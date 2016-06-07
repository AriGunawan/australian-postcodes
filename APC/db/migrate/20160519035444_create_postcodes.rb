class CreatePostcodes < ActiveRecord::Migration
  def change
    create_table :postcodes do |t|
      t.integer :code
      t.string :description, limit: 100
      t.json :boundary
      t.references :state, index: true

      t.timestamps null: false
    end
    add_foreign_key :postcodes, :states
  end
end
