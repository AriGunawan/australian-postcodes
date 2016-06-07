var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var PostcodeConstants = require('../constants/PostcodeConstants');
var assign = require('object-assign');
var $ = require('jquery');

var CHANGE_EVENT = 'change';

var _postcode = {};
var _postcodeList = [];
var _streamPostcodeList = [];

/**
 * Get postcode by code or suburb name
 * @param  {string} input postcode or suburb name
 */
function getByCodeOrSuburbName(input, state) {
  $.post('http://localhost:3001/api/v1/postcodes/search', 
    { input: input, state: state },
    function(data) {
      if (data.postcode == null) {
        var message = 'Postcode or Suburb "' + input + '" not found in ';
        if (state.id == 0) {
          message += 'all Australia.';
        } else {
          message += state.name + ' state.';
        }

        alert(message);
        return;
      }

      _postcode = data.postcode;

      PostcodeStore.emitChange(); 
  });
}

function getByLatLng(lat, lng) {  
  $.post('http://localhost:3001/api/v1/postcodes/check', 
    { lat: lat, lng: lng },
    function(data) {
      _postcodeList = data.postcodes;

      PostcodeStore.emitChange(); 
  });
}

function updateSelectCounter(postcode) {
  $.post('http://localhost:3001/api/v1/postcodes/select',
    { postcode: postcode },
    function(data) {
      // No operation
    });
}

function streamPostcodeList(skip, currentBound) {
  var take = 20;
  $.get('http://localhost:3001/api/v1/postcodes/stream_all', 
    { skip: skip, currentBound: currentBound, take: take },
    function(data) {
    _streamPostcodeList = data.postcodes;

    PostcodeStore.emitChange(); 
  });
}

var PostcodeStore = assign({}, EventEmitter.prototype, {  

  getPostcode: function() {
    return _postcode;
  },

  getPostcodeList: function() {
    return _postcodeList;
  },

  getStreamPostcodeList: function() {
    return _streamPostcodeList;
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
    case PostcodeConstants.POSTCODE_SEARCH_BY_CODE_OR_SUBURB_NAME:
      var input = action.input.toString().trim();
      var state = action.state;
      if (input !== '') {
        getByCodeOrSuburbName(input, state);       
      }
      break;
    case PostcodeConstants.POSTCODE_SEARCH_BY_LAT_LNG:
      var lat = action.lat;
      var lng = action.lng;
      getByLatLng(lat, lng);
      break;
    case PostcodeConstants.POSTCODE_UPDATE_SELECT_COUNTER:
      var postcode = action.postcode;
      updateSelectCounter(postcode);
      break;
    case PostcodeConstants.POSTCODE_STREAM_ALL:
      var skip = action.skip;
      var currentBound = action.currentBound
      streamPostcodeList(skip, currentBound);
    default:
      // no operation
  }
});

module.exports = PostcodeStore;
