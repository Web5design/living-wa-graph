app.directive('projectsMapLegend', function () {
  var getSmallestLargestAndMarkersCount = function (markers) {
    var largestMarker, smallestMarker, totalMarkers = 0;
    for (var markerId in markers) {
      var marker = markers[markerId];
      if (_.isUndefined(smallestMarker) || marker.radius < smallestMarker.radius) {
        smallestMarker = marker;
      }
      if (_.isUndefined(largestMarker) || marker.radius >= largestMarker.radius) {
        largestMarker = marker;
      }
      totalMarkers++;
    }
    return {smallestMarker: smallestMarker, largestMarker: largestMarker, totalMarkers: totalMarkers};
  };

  return {
    restrict: 'E',
    scope: {
      source: "=",
      disclaimerText: "@"
    },
    replace: true,
    templateUrl: '/templates/maps/projects-map-legend.html',
    link: function ($scope) {
      $scope.$watch('source', function(markers) {
        var circleLegends = [];
        var returnValue = getSmallestLargestAndMarkersCount(markers);
        var smallestMarker = returnValue.smallestMarker;
        var biggestMarker = returnValue.largestMarker;
        var totalMarkers = returnValue.totalMarkers;

        if (totalMarkers >= 1) {
          circleLegends.push({radius: smallestMarker.radius,
            value: smallestMarker.project.sum_fy_allocation});
        }
        if (totalMarkers >= 3) {
          var smallestAllocation = Number(smallestMarker.project.sum_fy_allocation);
          var largestAllocation = Number(biggestMarker.project.sum_fy_allocation);
          circleLegends.push({radius: (smallestMarker.radius + biggestMarker.radius) / 2,
              value: (smallestAllocation + largestAllocation) / 2}
          );
        }
        if (totalMarkers >= 2) {
          circleLegends.push({radius: biggestMarker.radius,
            value: biggestMarker.project.sum_fy_allocation}
          );
        }
        $scope.circleLegends = circleLegends;
      }, true);
    }
  };
});
