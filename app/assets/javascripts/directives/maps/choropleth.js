app.directive('choropleth', function(mapConfiguration, leafletBoundsHelpers, numberFormatter, templateHelper) {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      disclaimerMessage: '=',
      mapTitle: '='
    },
    templateUrl: '/templates/maps/choropleth.html',
    controller: function($scope) {
      $scope.defaults = mapConfiguration.defaultSettings();
      $scope.leafletCustomControls = mapConfiguration.defaultControls();
    },
    link: function($scope, element, attrs) {
      var templateParts = templateHelper.findTemplateParts(element, [
        'legend']);

      var $legend = templateParts.templated.$legend;

      $scope.bounds = leafletBoundsHelpers.createBoundsFromArray([
        [85, 180], // NE map corner
        [-85, -180] // SW map corner
        ]);

      var formatCurrencyAmount = function(amount) {
        return numberFormatter.formatNumber(amount, {
          currency: '$',
          maxLength: 4
        });
      };

      var formatLegendTextAmount = function(amount) {
        return numberFormatter.formatNumber(amount, {
          currency: '',
          abbrPrecision: 0,
          maxLength: 3
        });
      };

      // Get a district paint color from the districts array of colors

      // -- helper functions
      function between(val, min, max) {
        // where between means 'min < val <= max'
        var lowerBound = min,
            upperBound = max;
        if (val > lowerBound && val <= upperBound) {
          return true;
        }
        return false;
      };

      function legendColor(index) {
        return $scope.colors[index];
      };


      // -- main function
      function getColor(amount) {
        // called by 'style'

        // e.g., for legend-text '$A-$B', color the amount if $A < amount <= $B
        var color = legendColor(0);
        // TODO: default color if outside range (which should not happen)

        _.each($scope.ranges, function(range, index){
          var min = range[0],
              max = range[1];

          if (between(amount,min,max)) {
            color = legendColor(index);
          }
        });

        return color;

        // TODO: dynamic legend color + label assignments (Giacomo)
      };

      // style geojson districts
      function style(feature) {
        return {
          fillColor: getColor(feature.properties.sum_fy_allocation),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '0',
          fillOpacity: 0.7
        };
      };

      // bind data to mapPopups directive
      $scope.mapPopups = {
        popupOnHover: true,
        position: 'outside',
        message: message,
        layerType: 'geojson',
        style: {
          weight: 5,
          color: 'white'
        }
      };

      function message(feature) {
        var council_district_id = feature.properties.council_district_id,
            project_count = feature.properties.project_count,
            sum_fy_allocation = feature.properties.sum_fy_allocation;
        var project_unit = ((project_count == 1) ? 'project' : 'projects');
        var message =   '<strong>District ' + council_district_id + '</strong>'
                      + '<br>'
                      + '<div class="padding-top-sm">'
                      +   '<span class="pull-left padding-right-md dark">' + project_count + ' ' + project_unit + '</span>'
                      +   '<span class="pull-right map-popup-currency dark">' + formatCurrencyAmount(sum_fy_allocation) + '</span>'
                      + '</div>';

        return message;
      }




      $scope.$watch('data', function(data) {
        // get array of sum_fy_allocation's from each feature's properties
        if (!data || data.length == 0) { return; }
        sum_fy_allocations = _.map(data.features, function(feature) { return feature.properties.sum_fy_allocation });
        // e.g., [100000, 90000, 5000, 100, 2000] with orders of magnitude [5, 4, 3, 2, 3]

        // filter out the missing district data (where sum_fy_allocation is zero for the given district)
        sum_fy_allocations = _.filter(sum_fy_allocations, function(num){ return num != 0 });

        // render map bounds

        // --- get lat-lng pairs
        var latlngs = [];

        _.each(data.features, function(feature) {

          latlngs = latlngs.concat.apply(latlngs,feature.geometry.coordinates);
          // format: [ [lat1,lng1], [lat2,lng2], ... ]
        });

        var latitudes = _.map(latlngs, function(latlng){ return latlng[1] }),
            longitudes = _.map(latlngs, function(latlng){ return latlng[0] });
            // NOTE: in geojson, coordinates are in x-y-z order (longitude, latitude, ...)

        // TODO: this is the same code from ExpenseSubcategoryMap.js controller's way of determining map bounds.
        //        eventually export this to a reusable service.

        // give map padding around points on the map, so circles are not bordering the map edges
        var mapPadding = .025;

        var minLatitude = _.min(latitudes) - mapPadding,
            maxLatitude = _.max(latitudes) + mapPadding,
            minLongitude = _.min(longitudes) - mapPadding,
            maxLongitude = _.max(longitudes) + mapPadding;

        // set up map bounds (bounds directive)
        $scope.bounds = leafletBoundsHelpers.createBoundsFromArray([
          [maxLatitude, maxLongitude], // NE map corner
          [minLatitude, minLongitude] // SW map corner
        ]);

        $scope.geojson = {
            data: data,
            style: style,
            resetStyleOnMouseout: true
          }

        // if no district projects / allocations $, have no legend
        if (sum_fy_allocations.length == 0) {
          $scope.errorMessageOnMap = "No projects were found";
          $scope.colors = [];
          return;
        }


        var min_allocation = _.min(sum_fy_allocations),
            // e.g., 100 (1E2)
            max_allocation = _.max(sum_fy_allocations);
            // e.g., 100000 (1E5)


        var ordersOfMagnitude = function(val) {
          return Math.floor(Math.log(val) / Math.log(10) );
        };

        var midOrderofMagnitude = Math.floor( ( ordersOfMagnitude(max_allocation) + ordersOfMagnitude(min_allocation) ) / 2 );
        // e.g., 3

        var orderofMagnitudes2LegendLabel = function(lowerBoundOrder, upperBoundOrder) {

          var orderOfMagnitude2Text = function(order) {
            if (order == 0) return 0;
            return formatLegendTextAmount(Math.pow(10, order));
          }

          if (upperBoundOrder == Infinity) {
            return '>$'+orderOfMagnitude2Text(lowerBoundOrder);
          } else if (lowerBoundOrder == -Infinity) {
            return '<$'+orderOfMagnitude2Text(upperBoundOrder);
          } else {
            return '$' + orderOfMagnitude2Text(lowerBoundOrder) + ' - ' + orderOfMagnitude2Text(upperBoundOrder);
          }
        };

        var orderOfMagnitudes2Ranges = function(lowerBoundOrder, upperBoundOrder) {

          function orderOfMagnitude2Value(order) {
            if (order == 0) {
              return 0;
            } else if (order == -Infinity) {
              return -Infinity;
            } else if (order == Infinity) {
              return Infinity;
            } else {
              return Math.pow(10, order);
            }
          }

          var lowerBound = orderOfMagnitude2Value(lowerBoundOrder),
              upperBound = orderOfMagnitude2Value(upperBoundOrder);

          return [lowerBound,upperBound];
        };

        $scope.colors = ['#c0e7f3','#96bfdb','#5383a5','#1c4681','#082146'];

        var legendRangesByOrdersOfMagnitude =  [
          {
            lowerBound: -Infinity,
            upperBound: midOrderofMagnitude - 1
          },
          {
            lowerBound: midOrderofMagnitude - 1,
            upperBound: midOrderofMagnitude
          },
          {
            lowerBound: midOrderofMagnitude,
            upperBound: midOrderofMagnitude + 1
          },
          {
            lowerBound: midOrderofMagnitude + 1,
            upperBound: midOrderofMagnitude + 2
          },
          {
            lowerBound: midOrderofMagnitude + 2,
            upperBound: Infinity
          }
        ];

        $scope.ranges = _.map(legendRangesByOrdersOfMagnitude, function(order_range) {
          return orderOfMagnitudes2Ranges(order_range.lowerBound, order_range.upperBound);
        });
        // e.g., ["$0-100", "$100-1K", "$1K-10K", "$10K-100K", ">100K"]
        // the bottom number should be “$0 - ” ONE magnitudes smaller than the middle lower bound
        var legendLabels = _.map(legendRangesByOrdersOfMagnitude, function(order_range) {
          return orderofMagnitudes2LegendLabel(order_range.lowerBound, order_range.upperBound);
        });

          var legendEntries = d3.select($legend[0]).selectAll('.legendEntry')
            .data(legendLabels)

          legendEntries
            .selectAll('.legendText')
            .text(function(d) { return d; });

          legendEntries
            .selectAll('.legendKey')
            .style('background', function(d, i) { return $scope.colors[i]; });

          var legendEntryDivs = legendEntries.enter()
            .append('div')
            .classed('legendEntry', true)

          legendEntryDivs.append('span')
            .style('background', function(d, i) { return $scope.colors[i]; })
            .classed('legendKey', true);

          legendEntryDivs.append('span')
            .classed('legendText', true)
            .text(function(d) { return d; } );

          legendEntries.exit().remove();

      }); // $scope.$watch(...)
    }
  }
});
console.log('choropleth')