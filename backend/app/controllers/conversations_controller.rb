class ConversationsController < ApplicationController
  before_action :authorize_request

  # GET /conversations
  # Returns list of conversation snippets for the user
  def index
    # Find service requests where the user is either the homeowner or the provider
    # Then get the associated conversations
    conversations = Conversation.joins(:service_request)
                                .where("service_requests.user_id = ? OR service_requests.provider_id = ?", @current_user.id, @current_user.id)
                                .includes(:service_request, :messages)
                                .order('updated_at DESC')

    render json: conversations.as_json(
      include: {
        service_request: { only: [:id, :service_type, :address, :status] },
        messages: { limit: 1, order: 'created_at DESC' } # Last message
      }
    )
  end

  # GET /conversations/:id
  def show
    @conversation = Conversation.find(params[:id])
    
    # Authorized?
    service_req = @conversation.service_request
    unless service_req.user_id == @current_user.id || service_req.provider_id == @current_user.id
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

    render json: @conversation.as_json(
      include: {
        messages: { 
          include: { sender: { only: [:id, :email] } },
          order: 'created_at ASC' 
        },
        service_request: { include: { user: { only: [:id, :email] }, provider: { only: [:id, :email] } } }
      }
    )
  end

  # POST /conversations
  # Find or create a conversation for a service_request
  def create
    @service_request = ServiceRequest.find(params[:service_request_id])
    
    # Check auth: only user or provider of the request can start chat
    unless @service_request.user_id == @current_user.id || @service_request.provider_id == @current_user.id
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

    @conversation = Conversation.find_or_create_by(service_request: @service_request)
    
    render json: @conversation, status: :created
  end
end
