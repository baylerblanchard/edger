class User < ApplicationRecord
  has_secure_password
  has_many :service_requests
  
  validates :email, presence: true, uniqueness: true
  validates :password, presence: true, length: { minimum: 6 }
end
