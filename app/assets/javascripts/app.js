var app = angular.module('app', [
	'ngRoute'
])
.config(function($routeProvider){
	$routeProvider
		.when('/housing-alliance', {
			templateUrl: '/pages/ha.html',
			controller: 'HousingAllianceCtrl'
		})
		.when('/housing-trust-fund', {
			templateUrl: '/pages/htf.html',
			controller: 'HTFCtrl'
		})
		.when('/columbia-legal-society', {
			templateUrl: '/pages/cls.html',
			controller: 'CLSCtrl'
		})
		.when('/housing-d-commission', {
			templateUrl: '/pages/hdc.html',
			controller: 'HDCCtrl'
		})
		.otherwise({
			redirectTo: '/'
		})
})