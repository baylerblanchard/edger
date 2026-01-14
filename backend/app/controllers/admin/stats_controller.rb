module Admin
  class StatsController < BaseController
    def index
      render json: {
        total_users: User.count,
        total_providers: User.providers.count,
        total_homeowners: User.homeowners.count,
        total_requests: ServiceRequest.count,
        active_requests: ServiceRequest.where.not(status: ['completed', 'cancelled']).count,
        completed_requests: ServiceRequest.where(status: 'completed').count,
        total_revenue: ServiceRequest.where(status: 'completed').sum(:price).to_f
      }
    end
  end
end
