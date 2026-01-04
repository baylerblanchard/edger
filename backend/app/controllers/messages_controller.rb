class MessagesController < ApplicationController
  before_action :authorize_request

  # POST /messages
  def create
    @conversation = Conversation.find(params[:conversation_id])
    
    # Check participation
    service_req = @conversation.service_request
    unless service_req.user_id == @current_user.id || service_req.provider_id == @current_user.id
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

    @message = @conversation.messages.new(content: params[:content])
    @message.sender = @current_user

    if @message.save
      # Touch conversation to update updated_at for sorting
      @conversation.touch
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end
