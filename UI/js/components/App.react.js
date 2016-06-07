var React = require('react');
var Map = require('./Map.react');
var Search = require('./Search.react');
var PostcodeStore = require('../stores/PostcodeStore');
var SuburbStore = require('../stores/SuburbStore');
var StateStore = require('../stores/StateStore');
var PostcodeActions = require('../actions/PostcodeActions');
var SuburbActions = require('../actions/SuburbActions');
var StateActions = require('../actions/StateActions');

function getAppState() {
  return {
    postcode: PostcodeStore.getPostcode(),
    postcodeList: PostcodeStore.getPostcodeList(),
    streamPostcodeList: PostcodeStore.getStreamPostcodeList(),
    suburbList: SuburbStore.getSuburbList(),
    stateList: StateStore.getStateList()
  };
}

var App = React.createClass({
  getInitialState: function() {
    return getAppState();
  },

  componentDidMount: function() {
    PostcodeStore.addChangeListener(this._onChange);
    SuburbStore.addChangeListener(this._onChange);
    StateStore.addChangeListener(this._onChange);

    SuburbActions.updateSuburbList();
    StateActions.updateStateList();
  },

  componenetWillUnMount: function() {
    PostcodeStore.removeChangeListener(this._onChange);
    SuburbStore.removeChangeListener(this._onChange);
    StateStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(getAppState());
  },

  _onSearch: function(input, state) {
    PostcodeActions.getByCodeOrSuburbName(input, state);
  },

  _onMapClick: function(lat, lng) {
    this.setState({
      postcodeList: []
    });
    PostcodeActions.getPostcodesByLatLng(lat, lng);
  },

  /**
   * @return {object}
   */
  render: function() {
    return (
      <div>
        <h1>Australian Postcodes</h1>
        <Search 
          onSearch={this._onSearch} 
          suburbList={this.state.suburbList} 
          stateList={this.state.stateList} />
        <Map 
          postcode={this.state.postcode} 
          onMapClick={this._onMapClick} 
          postcodeList={this.state.postcodeList}
          streamPostcodeList={this.state.streamPostcodeList} />
      </div>
    );
  }
});

module.exports = App;
