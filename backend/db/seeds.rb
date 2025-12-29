# Create seed data
puts "Seeding..."

# Clear existing data
Review.destroy_all
ServiceRequest.destroy_all
User.destroy_all

# Create Users
homeowner = User.create!(
  email: "homeowner@test.com",
  password: "password",
  role: "homeowner"
)

provider = User.create!(
  email: "provider@test.com",
  password: "password",
  role: "provider"
)

# Create Service Requests
ServiceRequest.create!(
  user_id: homeowner.id,
  service_type: "mowing",
  status: "pending",
  address: "123 Maple Ave",
  scheduled_date: Date.today + 1.day,
  price: 45.00
)

ServiceRequest.create!(
  user_id: homeowner.id,
  provider_id: provider.id,
  service_type: "edging",
  status: "completed",
  address: "456 Oak Lane",
  scheduled_date: Date.today - 2.days,
  price: 30.00
)

puts "Seeding complete!"
