var React = require('react');
var PostcodeActions = require('../actions/PostcodeActions');
var Dropdown = require('react-bootstrap/lib/Dropdown');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Button = require('react-bootstrap/lib/Button');
var ClassNames = require('classnames');

var _map;
var _infoWindow;
var _postcode = { boundary: null };
var _featureList = [];
var _skipStream = 0;
var _isStreamPostcodeList = false;
var _currentBound = {};

function processPoints(geometry, callback, thisArg) {
  if (geometry instanceof google.maps.LatLng) {
    callback.call(thisArg, geometry);
  } else if (geometry instanceof google.maps.Data.Point) {
    callback.call(thisArg, geometry.get());
  } else {
    geometry.getArray().forEach(function(g) {
      processPoints(g, callback, thisArg);
    });
  }
}

function generateInfoContent(lat, lng, postcodeList) {
  var postcodes = '';
  if (postcodeList && postcodeList.length > 0) {
    postcodes = '<div>Postcodes: '
    postcodeList.forEach(function(postcode, index) {
      postcodes += '<a href ="#" id="postcode-' + postcode.code + '">' + postcode.code + '</a>';

      if (index != postcodeList.length - 1) {
        postcodes += ', ';
      }
    });
    postcodes += '</div>'
  }

  return '<div id="postcode-info">' +
    '<h4>Info</h4>' +
    '<div class="lat-lng-info">Lat: ' + lat + '</div>' +
    '<div class="lat-lng-info">Lng: ' + lng + '</div>' +
    postcodes +
    '</div>'
}

function buildMap(self) {
  _map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: {lat: -23.9414689, lng: 133.5207984}
  });

  _map.data.setStyle({
    strokeColor: '#ff3333',
    strokeWeight: 2,
    clickable: true
  });

  _map.data.addListener('click', function(event){
    var color = 'purple';
    if (event.feature.getProperty('isPersist')) {
      _map.data.remove(event.feature);
    } else {
      event.feature.setProperty('isPersist', true);
      _map.data.overrideStyle(event.feature, {strokeColor: color, fillColor: color});

      // Update select_count in database
      var postcode = event.feature.getProperty('postcode');
      PostcodeActions.updateSelectCounter(postcode);
    }
  });

  _infoWindow = new google.maps.InfoWindow();

  _map.addListener('click', function(e) {    
    var lat = e.latLng.lat();
    var lng = e.latLng.lng();

    self.setState({
      infoWindowsPos: {
        lat: lat,
        lng: lng
      }
    });

    self.props.onMapClick(lat, lng);
  });

  _infoWindow.addListener('closeclick', function() {
    self.setState({ infoWindowsPos: null });
  });
}

function setCurrentBound() {
  var bound = _map.getBounds().toJSON();

  _currentBound = {
    max_lat: bound.north,
    min_lat: bound.south,
    max_lng: bound.east,
    min_lng: bound.west
  }
}

function setBound(postcode) {
  postcode.boundary.properties = {
    postcode: postcode.code,
    bound: {
      min_lat: postcode.min_lat,
      max_lat: postcode.max_lat,
      min_lng: postcode.min_lng,
      max_lng: postcode.max_lng
    }
  };
}

var Map = React.createClass({
  componentDidMount: function(){
    var self = this;
    buildMap(self);
  },

  componentDidUpdate: function(){
    var self = this;

    var postcode = this.props.postcode;

    if (_isStreamPostcodeList) {
      if (this.props.streamPostcodeList) {
        if (this.props.streamPostcodeList.length == 0) {
          // Stop stream data
          _isStreamPostcodeList = false;
          _skipStream = 0;
          document.getElementById('stop-show-all-btn').className += ' hide-element';
          return false;
        }

        this.props.streamPostcodeList.forEach(function(item, i) {
          setBound(item);
          _map.data.addGeoJson(item.boundary);
        });

        _skipStream += this.props.streamPostcodeList.length;
      }
      
      PostcodeActions.streamPostcodeList(_skipStream, _currentBound);
    }

    if (postcode != null && postcode.boundary != null && postcode.boundary != _postcode.boundary) {
      // Remove not persisted boundary
      _map.data.forEach(function(feature) {
        if (!feature.getProperty('isPersist')) {
          _map.data.remove(feature);          
        }
      });

      // set bound
      setBound(postcode);      

      _map.data.addGeoJson(postcode.boundary);

      var bounds = new google.maps.LatLngBounds();
      _map.data.forEach(function(feature) {
        var bound = feature.getProperty('bound');
        bounds.extend(new google.maps.LatLng(bound.min_lat, bound.min_lng));
        bounds.extend(new google.maps.LatLng(bound.max_lat, bound.max_lng));
      });
      _map.fitBounds(bounds);

      _postcode = postcode;
    }

    if (this.state != null && this.state.infoWindowsPos != null) {
      _infoWindow.setContent(generateInfoContent(this.state.infoWindowsPos.lat, this.state.infoWindowsPos.lng, this.props.postcodeList));
      _infoWindow.setPosition({ lat: this.state.infoWindowsPos.lat, lng: this.state.infoWindowsPos.lng });
      _infoWindow.open(_map);

      this.props.postcodeList.forEach(function(postcode, index) {
        document.getElementById('postcode-' + postcode.code).onclick = function() {
          PostcodeActions.getByCodeOrSuburbName(postcode.code);
        }
      });
    }
  },

  _onShowAllSelected: function(eventKey, event) {
    if (_isStreamPostcodeList) { return false; }

    setCurrentBound();

    // Immediately show button to make it feel responsive
    document.getElementById('stop-show-all-btn').className = 'stop-show-all-btn btn btn-danger';

    // Reset data
    _skipStream = 0;
    _map.data.forEach(function(feature) {
      _map.data.remove(feature);
    });

    _isStreamPostcodeList = true;

    PostcodeActions.streamPostcodeList(_skipStream, _currentBound);
  },

  _onStopClicked: function() {
    _isStreamPostcodeList = false;
    
    // Immediately hide button to make it feel responsive
    document.getElementById('stop-show-all-btn').className += ' hide-element';
  },

  _onClearSelected: function() {
    _map.data.forEach(function(feature) {
      _map.data.remove(feature);
    });
  },

  /**
   * @return {object}
   */
  render: function() {
    var stopBtnClassName = ClassNames('stop-show-all-btn', {
      'hide-element': !_isStreamPostcodeList
    });

    return (
      <div className="map-section">
        <div className="map-button-section">
          <Button id="stop-show-all-btn" className={stopBtnClassName} bsStyle="danger" onClick={this._onStopClicked}>
            <Glyphicon glyph="stop" />&nbsp;&nbsp;Stop Show All
          </Button>
          <Dropdown id="action-btn" pullRight className="action-btn">
            <Dropdown.Toggle>
              <Glyphicon glyph="list" />
              &nbsp;&nbsp;Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <MenuItem key="1" onSelect={this._onShowAllSelected}>Show all boundaries on the current view</MenuItem>
              <MenuItem key="2" onSelect={this._onClearSelected}>Clear all boundaries on map</MenuItem>
            </Dropdown.Menu>
          </Dropdown>          
        </div>
        <div className="map-holder">
          <p>Loading...</p>
          <div id="map"></div>
        </div>
      </div>
    );
  }
});

module.exports = Map;
