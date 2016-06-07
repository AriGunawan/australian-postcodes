// The Google Map.
var map;
var geoJsonInput;      

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

function init() {
  // Initialise the map.
  map = new google.maps.Map(document.getElementById('map-holder'), {
    zoom: 4,
    center: {lat: -23.9414689, lng: 133.5207984},
  });

  map.data.setControls(['Polygon']);
  map.data.setStyle({
    editable: true,
    draggable: true
  });

  bindDataLayerListeners(map.data);

  var mapContainer = document.getElementById('map-holder');
  geoJsonInput = document.getElementById('postcode_boundary');

  google.maps.event.addDomListener(
      geoJsonInput,
      'input',
      refreshMapFromGeoJson);

  refreshMapFromGeoJson();
}

google.maps.event.addDomListener(window, 'load', init);

// Refresh different components from other components.
function refreshGeoJsonFromMap(e) {
  map.data.toGeoJson(function(geoJson) {
    if (geoJson.features == null || geoJson.features.length == 0) return;

    var feature = geoJson.features[0];
    var geometry = feature.geometry;

    if (geoJson.features.length > 1) {
      if (geometry.type.toLowerCase() == "polygon") {
        geometry.type = "MultiPolygon";
        geometry.coordinates[0] = [geometry.coordinates[0]];
      }

      for (var i = 1; i < geoJson.features.length; i++) {
        var anotherFeature = geoJson.features[i];
        geometry.coordinates.push(anotherFeature.geometry.coordinates);
      }
    }

    // var stringGeoJson = JSON.stringify(geoJson);
    var stringGeoJson = JSON.stringify(feature);
    
    if (stringGeoJson != geoJsonInput.value) {
      geoJsonInput.value = stringGeoJson;
    }

    if (geoJson.features.length == 1) {
      fitToArea(e);
    }
  });
}

function fitToArea(e) {
  var bounds = new google.maps.LatLngBounds();
  processPoints(e.feature.getGeometry(), bounds.extend, bounds);
  map.fitBounds(bounds);
}

// Replace the data layer with a new one based on the inputted geoJson.
function refreshMapFromGeoJson() {
  if (geoJsonInput.value == '') return;

  var newData = new google.maps.Data({
    map: map,
    style: map.data.getStyle(),
    controls: ['Polygon']
  });

  map.data.setMap(null);
  map.data = newData;
  bindDataLayerListeners(newData);

  try {
    var userObject = JSON.parse(geoJsonInput.value); 
    map.data.addGeoJson(userObject);
  } catch (error) {
    newData.setMap(null);
    if (geoJsonInput.value !== "") {
      setGeoJsonValidity(false);
    } else {
      setGeoJsonValidity(true);
    }
    return;
  }

  setGeoJsonValidity(true);
}

// Apply listeners to refresh the GeoJson display on a given data layer.
function bindDataLayerListeners(dataLayer) {
  dataLayer.addListener('setgeometry', refreshGeoJsonFromMap);
  dataLayer.addListener('addfeature', refreshGeoJsonFromMap);
}

// Display the validity of geoJson.
function setGeoJsonValidity(newVal) {
  if (!newVal) {
    geoJsonInput.className = 'invalid';
  } else {
    geoJsonInput.className = '';
  }
}