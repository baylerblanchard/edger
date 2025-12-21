require "test_helper"

class ServiceRequestsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @service_request = service_requests(:one)
  end

  test "should get index" do
    get service_requests_url, as: :json
    assert_response :success
  end

  test "should create service_request" do
    assert_difference("ServiceRequest.count") do
      post service_requests_url, params: { service_request: { address: @service_request.address, scheduled_date: @service_request.scheduled_date, service_type: @service_request.service_type, status: @service_request.status, user_id: @service_request.user_id } }, as: :json
    end

    assert_response :created
  end

  test "should show service_request" do
    get service_request_url(@service_request), as: :json
    assert_response :success
  end

  test "should update service_request" do
    patch service_request_url(@service_request), params: { service_request: { address: @service_request.address, scheduled_date: @service_request.scheduled_date, service_type: @service_request.service_type, status: @service_request.status, user_id: @service_request.user_id } }, as: :json
    assert_response :success
  end

  test "should destroy service_request" do
    assert_difference("ServiceRequest.count", -1) do
      delete service_request_url(@service_request), as: :json
    end

    assert_response :no_content
  end
end
