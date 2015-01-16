angular.module('KidoScraperPopup', ['ngRoute']).config(function ($routeProvider, $compileProvider) {
    $compileProvider
        .aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|filesystem:chrome-extension|blob:chrome-extension):/);

    $routeProvider
        .when('/', {
            templateUrl: '../../view/popup/partial/login.html',
            controller: 'LoginController'
        })
        .otherwise({
            redirectTo: '/'
        });
}).run(function ($window, $rootScope) {
    $rootScope.goBack = function () {
        $window.history.back();
    }
});