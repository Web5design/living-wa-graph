app.controller('MapCtrl', function($scope, $http){
  console.log('MapCtrl');
  

  if (d3 == undefined || d3.selectAll == undefined) defineD3();
});