ActiveAdmin.register_page 'Dashboard' do
  menu priority: 1, label: proc { I18n.t('active_admin.dashboard') }

  content title: proc { I18n.t('active_admin.dashboard') } do
    render partial: 'commonAssets'

    columns do
      column do
        panel 'Search Postcode Statistics' do
          render partial: 'searchPostcodeStatistics'
        end
      end

      column do
        panel 'Select Postcode Statistics' do
          render partial: 'selectPostcodeStatistics'
        end
      end
    end
  end
end
