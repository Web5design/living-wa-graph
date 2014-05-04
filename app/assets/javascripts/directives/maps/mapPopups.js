// Expected mapPopup object:

// {
//     position: string. 'inside' or 'outside' accepted.
//     popupOnHover: boolean. true if popup should appear on hover; false if popup should appear on click.
//     message: function that takes 1 argument as the leaflet layer object (= leafletEvent.target).
//     layerType: string. 'geojson', 'circle', 'circleMarker', and 'marker' accepted.
// }
app.directive('mapPopups', function ($log, leafletHelpers, templateHelper) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',

        link: function($scope, element, attrs, controller) {
            var isDefined = leafletHelpers.isDefined,
            leafletScope = controller.getLeafletScope();

            controller.getMap().then(function(map) {
                leafletScope.$watch('mapPopups', function(newMapPopups) {
                    if (!isDefined(newMapPopups)) {
                        $log.error('[AngularJS - Maps - mapPopups] Invalid mapPopups');
                        return;
                    }

                    if (!isDefined(newMapPopups.message)) {
                        throw new Error('[AngularJS - Maps - mapPopups] mapPopup.message as a function(feature) is required.');
                    }

                    // default option values
                    var options = {
                        position: newMapPopups.position || 'inside',
                        popupOnHover: newMapPopups.popupOnHover || false,
                        message: newMapPopups.message,
                        layerType: newMapPopups.layer || 'geojson',
                        style: newMapPopups.style || {
                          weight: 5,
                          color: 'white'
                        }
                    };

                    // TODO: below implementation assumes position: 'outside'.
                    // Also configure for position: 'inside'

                    // set up map popup object
                    if ( $('.map-popup.track').length ) {
                        var $tooltip = $('.map-popup.track');
                    } else {
                        $('body').append('<div class="map-popup track"><div class="content"></div><div class="custom-pointer"></div></div>');
                        var $tooltip = $('.map-popup.track');
                    }


                    var positionTooltip = function(e){
                        var top = e.pageY,
                            left = e.pageX;
                        var height = $tooltip.outerHeight();
                        var width = $tooltip.outerWidth();

                        $tooltip.css("top", (top - height - 20));
                        $tooltip.css("left", (left - (width/2)));
                    }

                    if (options.popupOnHover) {

                        if (options.layerType == 'geojson') {
                        // mouse-over effect
                        $scope.$on("leafletDirectiveMap.geojsonMouseover", function(event, leafletEvent) {
                            var layer = leafletEvent.target;
                            var feature = layer.feature;
                            var message = options.message(feature);

                            $tooltip.find('.content').html(message);

                            layer.setStyle(options.style).bringToFront();

                            element.find('path')
                                .mousemove(function(e){
                                  $tooltip.show();
                                  positionTooltip(e);
                                })
                                .mouseout(function(){
                                    if (element.find(".tooltip:hover").length == 0){
                                        $tooltip.hide();
                                    } else {
                                        // hovering on tooltip
                                        element.find(".tooltip")
                                            .mousemove(function(e2){
                                                positionTooltip(e2);
                                            })
                                            .mouseout(function(){
                                              //remove bug where tooltip doesn't disappear when hovering on map
                                              if (element.find("path:hover").length == 0) {
                                                $tooltip.hide();
                                              }
                                            });
                                    }
                                });
                            });
                        }
                    } else {
                        // TODO: click effect
                        $log.error('[AngularJS - Leaflet - mapPopup] Click effect for the mapPopup directive has not yet been defined.');

                    }

                    // TODO: so far, has been tested for geojson popups.
                    // Has not been generalized to circleMarker, circle, or marker yet.
                }, true);
            });
        }
    };
});
