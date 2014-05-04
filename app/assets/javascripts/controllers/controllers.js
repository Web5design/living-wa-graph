app.controller('MapCtrl', function($scope, $http){
  console.log('MapCtrl');
  $http.get('/fake_map').then(function(result, status){
    $scope.choroplethData = result.data;
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