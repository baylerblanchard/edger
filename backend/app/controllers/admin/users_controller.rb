module Admin
  class UsersController < BaseController
    def index
      @users = User.all.order(created_at: :desc)
      render json: @users
    end

    def destroy
      @user = User.find(params[:id])
      @user.destroy
      head :no_content
    end
  end
end
