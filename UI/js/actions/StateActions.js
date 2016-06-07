var AppDispatcher = require('../dispatcher/AppDispatcher');
var StateConstants =require('../constants/StateConstants');

var StateActions = {

  updateStateList: function() {
    AppDispatcher.dispatch({
      actionType: StateConstants.STATE_UPDATE_LIST
    })
  }
}

module.exports = StateActions;
