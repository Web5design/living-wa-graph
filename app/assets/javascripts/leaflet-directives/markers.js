app.directive('markers', function ($timeout, $log, $rootScope, $q, leafletData, leafletHelpers, leafletMapDefaults, leafletMarkersHelpers, leafletEvents) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: ['leaflet', '?layers'],

        link: function(scope, element, attrs, controller) {
            var mapController = controller[0],
                Helpers = leafletHelpers,
                isDefined = leafletHelpers.isDefined,
                isString = leafletHelpers.isString,
                leafletScope  = mapController.getLeafletScope(),
                markers = leafletScope.markers,
                deleteMarker = leafletMarkersHelpers.deleteMarker,
                addMarkerWatcher = leafletMarkersHelpers.addMarkerWatcher,
                listenMarkerEvents = leafletMarkersHelpers.listenMarkerEvents,
                addMarkerToGroup = leafletMarkersHelpers.addMarkerToGroup,
                bindMarkerEvents = leafletEvents.bindMarkerEvents,
                createMarker = leafletMarkersHelpers.createMarker,
                createCircleMarker = leafletMarkersHelpers.createCircleMarker,
                markerType = attrs.markerType;

            mapController.getMap().then(function(map) {
                var leafletMarkers = {},
                    getLayers;

                // If the layers attribute is used, we must wait until the layers are created
                if (isDefined(controller[1])) {
                    getLayers = controller[1].getLayers;
                } else {
                    getLayers = function() {
                        var deferred = $q.defer();
                        deferred.resolve();
                        return deferred.promise;
                    };
                }

                if (!isDefined(markers)) {
                    return;
                }

                getLayers().then(function(layers) {
                    leafletData.setMarkers(leafletMarkers, attrs.id);
                    leafletScope.$watch('markers', function(newMarkers) {
                        // Delete markers from the array
                        for (var name in leafletMarkers) {
                            if (!isDefined(newMarkers) || !isDefined(newMarkers[name])) {
                                deleteMarker(leafletMarkers[name], map, layers);
                                delete leafletMarkers[name];
                            }
                        }

                        // add new markers, sorted descending by radius.
                        var sortedNewMarkers = _.sortBy(_.values(_.map(newMarkers,
                            function(marker, newName) {
                                // Bring the key into the object for later reference.
                                marker.markerName = newName; return marker; })),
                            function(marker) { return -marker.radius; });
                        for (var i = 0; i < sortedNewMarkers.length; i++) {
                            var newName = sortedNewMarkers[i].markerName;
                            if (!isDefined(leafletMarkers[newName])) {
                                var markerData = newMarkers[newName];
                                if (markerType == 'circleMarker'){
                                    var marker = createCircleMarker(markerData);
                                } else if (markerType == 'circle'){
                                    var marker = createMarker(markerData);
                                    // TODO have a createCircle method on leafletMarkersHelpers.
                                } else {
                                    var marker = createMarker(markerData);
                                }
                                if (!isDefined(marker)) {
                                    $log.error('[AngularJS - Leaflet] Received invalid data on the marker ' + newName + '.');
                                    continue;
                                }
                                leafletMarkers[newName] = marker;

                                // Bind message
                                if (isDefined(markerData.message)) {
                                    if (isDefined(markerData.messageOptions)) {
                                        var options = markerData.messageOptions;

                                        var positionTooltip = function(marker, latLng){
                                            var top = latLng.y + $(element).offset().top,
                                                left = latLng.x + $(element).offset().left;
                                            var height = $tooltip.outerHeight(),
                                                width = $tooltip.outerWidth();
                                            var markerRadius = marker._radius;
                                            var popupTipHeight = 10; // different from CSS height (which is set to zero)

                                            $tooltip.css("top", (top - height - markerRadius - popupTipHeight ) );
                                            $tooltip.css("left", (left - (width/2)));
                                            $tooltip.show();
                                        };
                                        var removePopup = function(marker){
                                            $tooltip.hide()
                                            marker.setStyle({
                                              color: markerData.color,
                                              fillColor: markerData.fillColor,
                                              stroke: markerData.stroke,
                                              weight: markerData.weight
                                            });
                                        };
                                        // if hover = false on markerOptions, open marker on click (i.e., bindPopup)
                                        if (!options.hover){ marker.bindPopup(markerData.message, markerData.popupOptions); }

                                        // Hover on message, if messageHover set
                                        if (options.hover && options.position != 'outside') {

                                            marker.on('mouseover', function(){
                                                this.openPopup();
                                                this.setStyle({
                                                    color: '#405370',
                                                    fillColor: '#849dc4',
                                                    stroke: true,
                                                    weight: 5
                                                });
                                                if (isDefined(options.characterLimit) && isDefined(options.characterLimitSelector)) {
                                                    // truncate popup message text and append ellipsis after set character limit, if any
                                                    $(options.characterLimitSelector).ellipsis(options.characterLimit, true);
                                                }
                                            }).on('mouseout', function() {
                                                /*
                                                SOCRATA (dylan.bussone@socrata.com)
                                                fix for hovering over tooltip causing flashes
                                                when mouse leaves circle, check if it's on a 
                                                tooltip before removing tooltip.
                                                */
                                                var curPoint = this;

                                                setTimeout(function(){
                                                    // setTimeout because firefox/IE need it
                                                    if ($(".leaflet-popup:hover").length == 0){
                                                        removePopup(curPoint);
                                                    }
                                                }, 20);

                                                $(".leaflet-popup").mouseleave(function(){
                                                    removePopup(curPoint);
                                                });
                                            });
                                        } else if (options.hover && options.position == 'outside') {

                                            // set up map popup object
                                            if ( $('.map-popup.markers').length ) {
                                                var $tooltip = $('.map-popup.markers');
                                            } else {
                                                $('body').append('<div class="map-popup markers dark-map"><div class="leaflet-popup-content-wrapper outside"><div class="leaflet-popup-content"></div></div><div class="leaflet-popup-tip-container"><div class="leaflet-popup-tip"></div></div></div>');
                                                var $tooltip = $('.map-popup.markers');
                                            }

                                            $tooltip.on('mouseover', function(){
                                                $(this).hide();
                                            })

                                            var highlightStyle = {
                                                color: '#405370',
                                                fillColor: '#849dc4',
                                                stroke: true,
                                                weight: 5
                                            };

                                            var normalStyle = {
                                              color: markerData.color,
                                              fillColor: markerData.fillColor,
                                              stroke: markerData.stroke,
                                              weight: markerData.weight
                                            };

                                            marker.on('mouseover', function(e){
                                                this.setStyle(highlightStyle);

                                                var message = this.options.message;
                                                $tooltip.find('.leaflet-popup-content').html(message);
                                                if (isDefined(options.characterLimit) && isDefined(options.characterLimitSelector)) {
                                                    // truncate popup message text and append ellipsis after set character limit, if any
                                                    $(options.characterLimitSelector).ellipsis(options.characterLimit, true);
                                                }

                                                var latLng = map.latLngToContainerPoint(this.getLatLng());
                                                positionTooltip(this, latLng);
                                                $timeout(function(){
                                                    $tooltip.show();
                                                }, 20);
                                            })
                                            .on('mouseout', function(e){

                                                // if mouseout event caused by mousing over the popup, do nothing
                                                if ($('.map-popup.markers .leaflet-popup-content-wrapper:hover, .map-popup.markers .leaflet-popup-tip-container:hover').length > 0) {
                                                    $tooltip.show();
                                                    this.setStyle(normalStyle)
                                                    return;
                                                }

                                                var curPoint = this;
                                                removePopup(curPoint);

                                                $timeout(function(){
                                                    // setTimeout because firefox/IE need it
                                                    if ($(".map-popup.markers .leaflet-popup-content-wrapper:hover").length == 0){
                                                        removePopup(curPoint);
                                                    }
                                                }, 20);

                                                $(".map-popup.markers .leaflet-popup-content-wrapper").mouseleave(function(){
                                                    removePopup(curPoint);
                                                });
                                            })
                                            .on('click', function(){
                                                removePopup(this);
                                            });
                                        }

                                        if (!options.hover) marker.bindPopup(markerData.message, markerData.popupOptions);
                                    } else {
                                        marker.bindPopup(markerData.message, markerData.popupOptions);
                                    }
                                }

                                // Add the marker to a cluster group if needed
                                if (isDefined(markerData.group)) {
                                    addMarkerToGroup(marker, markerData.group, map);
                                }

                                // Show label if defined
                                if (Helpers.LabelPlugin.isLoaded() && isDefined(markerData.label) && isDefined(markerData.label.message)) {
                                    marker.bindLabel(markerData.label.message, markerData.label.options);
                                }

                                // Check if the marker should be added to a layer
                                if (isDefined(markerData) && isDefined(markerData.layer)) {
                                    if (!isString(markerData.layer)) {
                                        $log.error('[AngularJS - Leaflet] A layername must be a string');
                                        continue;
                                    }
                                    if (!isDefined(layers)) {
                                        $log.error('[AngularJS - Leaflet] You must add layers to the directive if the markers are going to use this functionality.');
                                        continue;
                                    }

                                    if (!isDefined(layers.overlays) || !isDefined(layers.overlays[markerData.layer])) {
                                        $log.error('[AngularJS - Leaflet] A marker can only be added to a layer of type "group"');
                                        continue;
                                    }
                                    var layerGroup = layers.overlays[markerData.layer];
                                    if (!(layerGroup instanceof L.LayerGroup)) {
                                        $log.error('[AngularJS - Leaflet] Adding a marker to an overlay needs a overlay of the type "group"');
                                        continue;
                                    }

                                    // The marker goes to a correct layer group, so first of all we add it
                                    layerGroup.addLayer(marker);

                                    // The marker is automatically added to the map depending on the visibility
                                    // of the layer, so we only have to open the popup if the marker is in the map
                                    if (map.hasLayer(marker) && markerData.focus === true) {
                                        marker.openPopup();
                                    }

                                // Add the marker to the map if it hasn't been added to a layer or to a group
                                } else if (!isDefined(markerData.group)) {
                                    // We do not have a layer attr, so the marker goes to the map layer
                                    map.addLayer(marker);
                                    if (markerData.focus === true) {
                                        marker.openPopup();
                                    }
                                    if (Helpers.LabelPlugin.isLoaded() && isDefined(markerData.label) && isDefined(markerData.label.options) && markerData.label.options.noHide === true) {
                                        marker.showLabel();
                                    }
                                }

                                // Should we watch for every specific marker on the map?
                                var shouldWatch = (!isDefined(attrs.watchMarkers) || attrs.watchMarkers === 'true');

                                if (shouldWatch) {
                                    addMarkerWatcher(marker, newName, leafletScope, layers, map);
                                    listenMarkerEvents(marker, markerData, leafletScope);
                                }
                                bindMarkerEvents(marker, newName, markerData, leafletScope);
                            }
                        }
                    }, true);
                });
            });
        }
    };
});
