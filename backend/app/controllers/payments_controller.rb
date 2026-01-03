class PaymentsController < ApplicationController
  before_action :authorize_request

  def create
    service_request = ServiceRequest.find(params[:service_request_id])

    # Authorization: Simply check if the current user owns the request
    if service_request.user_id != @current_user.id
      return render json: { error: 'Not authorized' }, status: :unauthorized
    end

    if service_request.paid?
      return render json: { error: 'Request already paid' }, status: :unprocessable_entity
    end

    if service_request.price.nil? || service_request.price <= 0
      return render json: { error: 'Invalid price' }, status: :unprocessable_entity
    end

    begin
      amount = (service_request.price * 100).to_i

      intent = Stripe::PaymentIntent.create({
        amount: amount,
        currency: 'usd',
        metadata: { service_request_id: service_request.id },
        automatic_payment_methods: { enabled: true },
      })

      service_request.update(stripe_payment_intent_id: intent.id)

      render json: { clientSecret: intent.client_secret }
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end
end
