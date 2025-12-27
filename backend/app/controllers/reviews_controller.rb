class ReviewsController < ApplicationController
  before_action :authorize_request

  # POST /reviews
  def create
    @service_request = ServiceRequest.find(params[:service_request_id])

    # Validate ownership: only the user who made the request can review it
    if @service_request.user_id != @current_user.id
      return render json: { error: 'Not authorized to review this request' }, status: :forbidden
    end

    # Can only review completed requests
    if @service_request.status != 'completed'
      return render json: { error: 'Can only review completed requests' }, status: :unprocessable_entity
    end

    @review = Review.new(review_params)
    @review.reviewer = @current_user
    @review.provider = @service_request.provider
    @review.service_request = @service_request

    if @review.save
      render json: @review, status: :created
    else
      render json: @review.errors, status: :unprocessable_content
    end
  end

  private

  def review_params
    params.require(:review).permit(:rating, :comment)
  end
end
