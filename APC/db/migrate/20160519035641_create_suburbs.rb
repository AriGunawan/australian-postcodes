class CreateSuburbs < ActiveRecord::Migration
  def change
    create_table :suburbs do |t|
      t.string :name, limit: 100
      t.references :postcode, index: true

      t.timestamps null: false
    end
    add_foreign_key :suburbs, :postcodes
  end
end
