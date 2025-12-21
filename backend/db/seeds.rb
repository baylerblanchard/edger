# Create seed data
puts "Seeding..."

# Create Users
homeowner = User.create!(
  email: "homeowner@test.com",
  password_digest: BCrypt::Password.create("password"),
  role: "homeowner"
)

provider = User.create!(
  email: "provider@test.com",
  password_digest: BCrypt::Password.create("password"),
  role: "provider"
)

# Create Service Requests
ServiceRequest.create!(
  user_id: homeowner.id,
  service_type: "mowing",
  status: "pending",
  address: "123 Maple Ave",
  scheduled_date: Date.today + 1.day
)

ServiceRequest.create!(
  user_id: homeowner.id,
  service_type: "edging",
  status: "completed",
  address: "456 Oak Lane",
  scheduled_date: Date.today - 2.days
)

puts "Seeding complete!"
