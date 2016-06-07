class AddMaxMinLngLatToPostcodes < ActiveRecord::Migration
  def change
    add_column :postcodes, :max_lat, :decimal
    add_column :postcodes, :min_lat, :decimal
    add_column :postcodes, :max_lng, :decimal
    add_column :postcodes, :min_lng, :decimal
  end
end
