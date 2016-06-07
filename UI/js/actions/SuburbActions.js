var AppDispatcher = require('../dispatcher/AppDispatcher');
var SuburbConstants =require('../constants/SuburbConstants');

var SuburbActions = {

  updateSuburbList: function() {
    AppDispatcher.dispatch({
      actionType: SuburbConstants.SUBURB_UPDATE_LIST
    })
  }
}

module.exports = SuburbActions;
