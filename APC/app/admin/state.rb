ActiveAdmin.register State do
  menu priority: 1

  # Filter in index page  filter :postcode, as: :select, collection: proc { Postcode.pluck(:code, :id) }
  filter :name
  filter :created_at
  filter :updated_at

  permit_params :name
end
