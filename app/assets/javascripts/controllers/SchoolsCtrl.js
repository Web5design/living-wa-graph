app.controller('SchoolsCtrl', function($scope, $http, numberFormatter){
  console.log('SchoolsCtrl');

  var formatCurrencyAmount = function(amount) {
        return numberFormatter.formatNumber(amount, {
          currency: '$',
          maxLength: 4
        });
      };

  $scope.message = function(feature) {
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

  $http.get('/schools_map').then(function(result, status){
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

console.log('SchoolsCtrl loaded');