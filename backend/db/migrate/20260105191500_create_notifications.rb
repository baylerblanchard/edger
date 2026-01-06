class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.text :message
      t.datetime :read_at
      t.string :link
      t.references :related, polymorphic: true

      t.timestamps
    end
  end
end
