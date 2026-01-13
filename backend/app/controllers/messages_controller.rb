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
      
      # Determine recipient
      recipient = if @current_user.id == service_req.user_id
                    service_req.provider
                  else
                    service_req.user
                  end
      
      if recipient
        Notification.create(
          user: recipient,
          title: "New Message",
          message: "You have a new message regarding your service request.",
          link: "/dashboard", # ideally link to specific chat or request
          related: @conversation
        )
      end

      render json: @message.as_json(include: :sender), status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end
