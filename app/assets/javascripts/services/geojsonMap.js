app.factory('geojsonMap', function() {
  // give map padding around points on the map, so circles are not bordering the map edges
  var geojsonMap = {};

  geojsonMap.click = function(leafletEvent){
  	var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
  }

  geojsonMap.hover = function(leafletEvent){
  	var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
  }
  return geojsonMap;
});