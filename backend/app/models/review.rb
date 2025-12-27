class Review < ApplicationRecord
  belongs_to :service_request
  belongs_to :provider, class_name: 'User'
  belongs_to :reviewer, class_name: 'User'

  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :comment, length: { maximum: 500 }
end
