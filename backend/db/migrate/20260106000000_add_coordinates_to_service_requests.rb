class AddCoordinatesToServiceRequests < ActiveRecord::Migration[8.1]
  def change
    add_column :service_requests, :latitude, :decimal
    add_column :service_requests, :longitude, :decimal
  end
end
