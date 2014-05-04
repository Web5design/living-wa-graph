app.directive('controls', function ($log, leafletHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: '?^leaflet',

        link: function(scope, element, attrs, controller) {
			if(!controller) {
				return;
			}

            var isDefined = leafletHelpers.isDefined,
                leafletScope  = controller.getLeafletScope();

            controller.getMap().then(function(map) {
                if (isDefined(L.Control.Draw) && isDefined(controls.draw)) {
					var drawnItems = new L.FeatureGroup();
					map.addLayer(drawnItems);
					var options = {
						edit: {
							featureGroup: drawnItems
						}
					};
					angular.extend(options, controls.draw.options);
					
                    var drawControl = new L.Control.Draw(options);
                    map.addControl(drawControl);
                }
                
                // SOCRATA giacomo.ferrari@socrata.com: Patched this to support controls being modified after the map is
                // instantiated. This is a partial implementation as controls will be added more than once if controls
                // changes to be non-empty. Also, removed controls will not be removed. I don't see any api for querying which
                // controls are already added, so this won't be easy to implement correctly.
                leafletScope.$watch('controls', function(controls) {
                    if(isDefined(controls) && isDefined(controls.custom)) {
                        for(var i in controls.custom) {
                            map.addControl(controls.custom[i]);
                        }
                    }
                });
            });
        }
    };
});
