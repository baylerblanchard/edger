class AddPaymentToServiceRequests < ActiveRecord::Migration[8.1]
  def change
    add_column :service_requests, :payment_status, :integer
    add_column :service_requests, :stripe_payment_intent_id, :string
  end
end
