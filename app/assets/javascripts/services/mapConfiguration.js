app.factory('mapConfiguration', function(leafletBoundsHelpers) {
  // give map padding around points on the map, so circles are not bordering the map edges
  var mapPadding = .025;
  
  var mapID = 'maptastic.i56p1ee9';
  
  var defaultSettings = {
    scrollWheelZoom: false,
    tileLayer: "http://a.tiles.mapbox.com/v3/"+mapID+"/{z}/{x}/{y}.png",
    zoomControlPosition: 'topright'
  };

  var defaultControls = {};

  if (Modernizr.geolocation)
  {
    defaultControls.custom = [
      L.control.locate({
        position: 'bottomright',
        follow: false,
        metric: false, // 'murica
        onLocationError: function(error) {
          alert("Sorry, your location is currently unavailable.");
        }
      })];
  };

  var displayBoundsFromPoints = function(points) {
    var latitudes = _.pluck(points, 'lat');
    var longitudes = _.pluck(points, 'lng');
    var minLatitude = d3.min(latitudes),
        maxLatitude = d3.max(latitudes),
        minLongitude = d3.min(longitudes),
        maxLongitude = d3.max(longitudes);

    return leafletBoundsHelpers.createBoundsFromArray([
        [maxLatitude + mapPadding, maxLongitude + mapPadding], // NE map corner
        [minLatitude - mapPadding, minLongitude - mapPadding] // SW map corner
      ]);

  };

  return {
    defaultControls: function() { return Object.create(defaultControls); },
    defaultSettings: function() { return Object.create(defaultSettings); },
    displayBoundsFromPoints: displayBoundsFromPoints 
  };
});

