class AddProviderIdToServiceRequests < ActiveRecord::Migration[8.1]
  def change
    add_column :service_requests, :provider_id, :integer
  end
end
