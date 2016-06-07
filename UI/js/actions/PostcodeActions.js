var AppDispatcher = require('../dispatcher/AppDispatcher');
var PostcodeConstants =require('../constants/PostcodeConstants');

var PostcodeActions = {

  /**
   * Get Postcode by code or suburb name
   * @param  {string} input name or post code
   */
  getByCodeOrSuburbName: function(input, state) {
    AppDispatcher.dispatch({
      actionType: PostcodeConstants.POSTCODE_SEARCH_BY_CODE_OR_SUBURB_NAME,
      input: input,
      state: state
    });
  },

  getPostcodesByLatLng: function(lat, lng) {
    AppDispatcher.dispatch({
      actionType: PostcodeConstants.POSTCODE_SEARCH_BY_LAT_LNG,
      lat: lat,
      lng: lng
    })
  },

  updateSelectCounter: function(postcode) {
    AppDispatcher.dispatch({
      actionType: PostcodeConstants.POSTCODE_UPDATE_SELECT_COUNTER,
      postcode: postcode
    })
  },

  streamPostcodeList: function(skip, currentBound) {
    AppDispatcher.dispatch({
      actionType: PostcodeConstants.POSTCODE_STREAM_ALL,
      skip: skip,
      currentBound: currentBound
    })
  }
}

module.exports = PostcodeActions;
