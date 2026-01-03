class ServiceRequest < ApplicationRecord
  belongs_to :user
  belongs_to :provider, class_name: 'User', optional: true
  has_one :review

  enum payment_status: { pending: 0, paid: 1 }
end
