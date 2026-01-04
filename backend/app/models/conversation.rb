class Conversation < ApplicationRecord
  belongs_to :service_request
  has_many :messages, dependent: :destroy
end
