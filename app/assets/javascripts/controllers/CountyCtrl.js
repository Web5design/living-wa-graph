app.controller('CountyCtrl', function($scope, $http, numberFormatter, geojsonMap){
  console.log('CountyCtrl');
  var formatCurrencyAmount = function(amount) {
        return numberFormatter.formatNumber(amount, {
          currency: '$',
          maxLength: 4
        });
      };

 $scope.message = function(feature) {
        var council_district_id = feature.properties.JURNM;
        var message =   '<strong>' + council_district_id + '</strong>';

        return message;
      }

   $scope.$on("leafletDirectiveMap.geojsonMouseover", function(ev, leafletEvent) {
    console.log('mouseover');
    geojsonMap.hover(leafletEvent);
    
    console.log($scope.districtName);
  });

  $scope.$on("leafletDirectiveMap.geojsonClick", function(ev, featureSelected, leafletEvent) {
    console.log('click');
    geojsonMap.click(leafletEvent);
    $scope.districtName = leafletEvent.target.feature.properties.JURNM;
  });


  $http.get('/county_map').then(function(result, status){
    $scope.choroplethData = result.data;
    console.log($scope.choroplethData);
  var districtsAllocationData = (result.data.features || []).map(function(district){
      return {
        'label' : 'District ' + district.properties.council_district_id,
        'total': district.properties.sum_fy_allocation || 0
      };
    });
    $scope.districtsAllocationData = districtsAllocationData.sort(function(a, b) {
      return b.total - a.total;
    });
  });
  if (d3 == undefined || d3.selectAll == undefined) defineD3();
});