class CreateServiceRequests < ActiveRecord::Migration[8.1]
  def change
    create_table :service_requests do |t|
      t.integer :user_id
      t.string :service_type
      t.string :status
      t.string :address
      t.date :scheduled_date

      t.timestamps
    end
  end
end
