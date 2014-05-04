app.factory('geojsonMap', function() {
  // give map padding around points on the map, so circles are not bordering the map edges
  var geojsonMap = {};

  function click(e){
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

  function hover(e){
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
  return {
    hover: hover,
    click: click
  };
});