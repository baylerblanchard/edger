# verify_active_storage.rb
begin
  user = User.first
  unless user
    puts "No users found. Creating one..."
    user = User.create!(email: "test@example.com", password: "password", role: "provider")
  end

  puts "Testing Active Storage for User #{user.id}..."
  
  # Create a dummy image
  blob = ActiveStorage::Blob.create_after_upload!(
    io: StringIO.new("fake image content"),
    filename: "test.jpg",
    content_type: "image/jpeg"
  )

  user.profile_picture.attach(blob)
  
  if user.profile_picture.attached?
    puts "SUCCESS: Profile picture attached successfully."
    puts "URL: #{user.profile_picture_url}"
  else
    puts "FAILURE: Profile picture not attached."
  end

rescue => e
  puts "ERROR: #{e.message}"
  puts e.backtrace
end
