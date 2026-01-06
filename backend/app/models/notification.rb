class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :related, polymorphic: true, optional: true
end
