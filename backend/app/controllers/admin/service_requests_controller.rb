module Admin
  class ServiceRequestsController < BaseController
    def index
      @service_requests = ServiceRequest.includes(:user, :provider).order(created_at: :desc)
      render json: @service_requests, include: {
        user: { only: [:id, :email] },
        provider: { only: [:id, :email] }
      }
    end
  end
end
