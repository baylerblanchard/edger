class CreateConversations < ActiveRecord::Migration[8.1]
  def change
    create_table :conversations do |t|
      t.references :service_request, null: false, foreign_key: true

      t.timestamps
    end
  end
end
