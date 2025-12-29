class User < ApplicationRecord
  has_secure_password
  has_many :service_requests
  has_many :provided_reviews, class_name: 'Review', foreign_key: 'provider_id'
  has_many :written_reviews, class_name: 'Review', foreign_key: 'reviewer_id'

  validates :email, presence: true, uniqueness: true
  validates :password, presence: true, length: { minimum: 6 }

  def average_rating
    return 0 if provided_reviews.empty?
    provided_reviews.average(:rating).to_f.round(1)
  end

  def total_earnings
    # Sum the price of all completed service requests where this user is the provider
    ServiceRequest.where(provider: self, status: 'completed').sum(:price).to_f
  end

end
