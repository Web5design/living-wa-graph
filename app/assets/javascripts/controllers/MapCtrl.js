app.controller('MapCtrl', function($scope, $http, geojsonMap){
  console.log('MapCtrl');
  

  $scope.$on("leafletDirectiveMap.geojsonMouseover", function(ev, leafletEvent) {
    console.log('mouseover');
    geojsonMap.hover(leafletEvent);
  });

  $scope.$on("leafletDirectiveMap.geojsonClick", function(ev, featureSelected, leafletEvent) {
    console.log('click');
    geojsonMap.click(featureSelected, leafletEvent);
  });
  

  if (d3 == undefined || d3.selectAll == undefined) defineD3();
});