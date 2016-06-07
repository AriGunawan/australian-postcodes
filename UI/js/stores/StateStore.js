var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var StateConstants = require('../constants/StateConstants');
var assign = require('object-assign');
var $ = require('jquery');

var CHANGE_EVENT = 'change';

var _stateList = [{
  id: 0,
  name: 'All'
}];

function sortByName(a,b) {
  if (a.name < b.name)
    return -1;
  else if (a.name > b.name)
    return 1;
  else 
    return 0;
}

function getStateList() {
  $.get('http://localhost:3001/api/v1/states/list', function(data) {
    _stateList = [{
      id: 0,
      name: 'All'
    }];

    // Sort states from server
    var states = data.states.sort(sortByName);

    Array.prototype.push.apply(_stateList, states);

    StateStore.emitChange(); 
  });
}

var StateStore = assign({}, EventEmitter.prototype, {

  getStateList: function() {
    return _stateList;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param  {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param  {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

});

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case StateConstants.STATE_UPDATE_LIST:
      getStateList();
      break;
    default:
      // no operation
  }
});

module.exports = StateStore;
