class ServiceRequestsController < ApplicationController
  before_action :authorize_request
  before_action :set_service_request, only: %i[ show update destroy ]

  # GET /service_requests
  def index
    @service_requests = ServiceRequest.all

    render json: @service_requests
  end

  # GET /service_requests/1
  def show
    render json: @service_request
  end

  # POST /service_requests
  def create
    @service_request = @current_user.service_requests.new(service_request_params)

    if @service_request.save
      render json: @service_request, status: :created, location: @service_request
    else
      render json: @service_request.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /service_requests/1
  def update
    if @service_request.status == 'pending' && service_request_params[:status] == 'accepted'
      # Identify who is accepting
      @service_request.provider = @current_user
      @service_request.status = 'accepted'
    else
      @service_request.assign_attributes(service_request_params)
    end

    if @service_request.save
      render json: @service_request
    else
      render json: @service_request.errors, status: :unprocessable_content
    end
  end

  # DELETE /service_requests/1
  def destroy
    @service_request.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_service_request
      @service_request = ServiceRequest.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def service_request_params
      params.expect(service_request: [ :service_type, :status, :address, :scheduled_date ])
    end
end
