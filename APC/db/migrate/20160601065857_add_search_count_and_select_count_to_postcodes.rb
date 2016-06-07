class AddSearchCountAndSelectCountToPostcodes < ActiveRecord::Migration
  def change
    add_column :postcodes, :search_count, :integer
    add_column :postcodes, :select_count, :integer
  end
end
