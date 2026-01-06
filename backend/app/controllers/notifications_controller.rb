class NotificationsController < ApplicationController
  before_action :authorize_request

  # GET /notifications
  def index
    notifications = Notification.where(user_id: @current_user.id)
                                .order(created_at: :desc)
                                .limit(20)
    
    render json: notifications
  end

  # PATCH /notifications/:id/mark_read
  def mark_read
    notification = Notification.find(params[:id])
    
    if notification.user_id != @current_user.id
      return render json: { error: 'Not authorized' }, status: :forbidden
    end

    notification.update(read_at: Time.current)
    render json: notification
  end
end
