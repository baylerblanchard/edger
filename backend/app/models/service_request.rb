class ServiceRequest < ApplicationRecord
  belongs_to :user
  belongs_to :provider, class_name: 'User', optional: true
  has_one :review

  has_one_attached :before_picture
  has_one_attached :after_picture

  enum :payment_status, { pending: 0, paid: 1 }

  before_validation :geocode_address, on: :create

  def before_picture_url
    return nil unless before_picture.attached?
    Rails.application.routes.url_helpers.rails_blob_url(before_picture, host: "http://localhost:3001")
  end

  def after_picture_url
    return nil unless after_picture.attached?
    Rails.application.routes.url_helpers.rails_blob_url(after_picture, host: "http://localhost:3001")
  end

  def as_json(options = {})
    super(options.merge(
      methods: [:before_picture_url, :after_picture_url]
    ))
  end

  private

  def geocode_address
    if address.present? && (latitude.nil? || longitude.nil?)
      lat, lng = GeocodingService.geocode(address)
      self.latitude = lat
      self.longitude = lng
    end
  end
end
