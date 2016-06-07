ActiveAdmin.register Suburb do
  menu priority: 3

  # Index page
  index do
    selectable_column
    id_column
    column :postcode do |suburb|
      link_to suburb.postcode.code, admin_postcode_path(suburb.postcode)
    end
    column :name
    column :created_at
    column :updated_at
    actions
  end

  # Filter in index page
  filter :postcode, as: :select, collection: proc { Postcode.order(:code).pluck(:code, :id) }
  filter :name
  filter :created_at
  filter :updated_at

  # Show page
  show do
    attributes_table do
      row :id
      row :postcode do |suburb|
        link_to suburb.postcode.code, admin_postcode_path(suburb.postcode)
      end
      row :name
      row :created_at
      row :updated_at
    end
    active_admin_comments
  end

  # Edit page
  form do |f|
    f.semantic_errors # shows errors on :base
    
    f.inputs do
      f.input :postcode, as: :select, collection: Postcode.order(:code).pluck(:code, :id)
      f.input :name
    end

    f.actions         # adds the 'Submit' and 'Cancel' buttons
  end

  permit_params :name, :postcode_id
end
