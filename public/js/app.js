var defaultApp = angular.module('defaultApp', ['defaultAppServices', 'defaultAppFilters'])
	.config(defaultAppRouter);



function defaultAppRouter ($routeProvider) {
	$routeProvider
		.when('/', {templateUrl: 'partials/destinations.html',
		 controller: 'DestinationsCtrl'});
		// .when('/airports/:airportCode', {
		//  templateUrl: 'partials/airport.html',
		//  controller: 'AirportCtrl'
		// });
}

angular.module('defaultAppFilters', [])
	.filter('originTitle', function () {
		return function (input) {
			return input.origin + ' - ' + input.originFullName;
		};
	});