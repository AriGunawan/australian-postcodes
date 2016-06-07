ActiveAdmin.register Postcode do
  menu priority: 2

  # Index page
  index do
    selectable_column
    id_column
    column :state do |postcode|
      link_to postcode.state.name, admin_state_path(postcode.state)
    end
    column :code
    column :description
    column :search_count
    column :select_count
    column :created_at
    column :updated_at
    actions
  end

  # Filter in index page
  filter :state, as: :select, collection: proc { State.order(:name).pluck(:name, :id) }
  filter :code
  filter :description
  filter :search_count
  filter :select_count
  filter :created_at
  filter :updated_at

  # Show page
  show do
    attributes_table do
      row :id
      row :state do |postcode|
        link_to postcode.state.name, admin_state_path(postcode.state)
      end
      row :code
      row :description
      row :search_count
      row :select_count
      row :max_lng
      row :min_lng
      row :max_lat
      row :min_lat
      row :created_at
      row :updated_at
      row :boundary
    end
    active_admin_comments
  end

  # Edit page
  form do |f|
    f.semantic_errors # shows errors on :base

    f.inputs do
      f.input :state, as: :select, collection: State.order(:name).pluck(:name, :id)
      f.input :code
      f.input :description
      f.input :boundary, as: :text
      render partial: 'geoJsonEditor'
    end

    f.actions         # adds the 'Submit' and 'Cancel' buttons
  end

  permit_params :code, :description, :boundary, :state_id
end
