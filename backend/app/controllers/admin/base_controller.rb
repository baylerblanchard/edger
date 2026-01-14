module Admin
  class BaseController < ApplicationController
    before_action :authorize_request
    before_action :require_admin

    private

    def require_admin
      unless @current_user.admin?
        render json: { error: 'Unauthorized' }, status: :forbidden
      end
    end
  end
end
