var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var SuburbConstants = require('../constants/SuburbConstants');
var assign = require('object-assign');
var $ = require('jquery');

var CHANGE_EVENT = 'change';

var _suburbList = [];

function getSuburbList() {
  $.get('http://localhost:3001/api/v1/suburbs/list', function(data) {
    _suburbList = data.suburbs;

    SuburbStore.emitChange(); 
  });
}

var SuburbStore = assign({}, EventEmitter.prototype, {

  getSuburbList: function() {
    return _suburbList;
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
    case SuburbConstants.SUBURB_UPDATE_LIST:
      getSuburbList();
      break;
    default:
      // no operation
  }
});

module.exports = SuburbStore;
