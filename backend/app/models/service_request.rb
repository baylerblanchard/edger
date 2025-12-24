class ServiceRequest < ApplicationRecord
  belongs_to :user
  belongs_to :provider, class_name: 'User', optional: true
end
