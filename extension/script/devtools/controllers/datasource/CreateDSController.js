'use strict';
require('angular');
var Site = require('../../model/Site');

module.exports = (function () {

    angular.module('KidoScraper').controller('CreateDSController', function ($scope, $routeParams, $location, $http, RunInBackgroundScript, AngularScope, datasourceService,baseErrorHandler) {
        console.log('Loading CreateDS Controller...');

        if (!$routeParams.serviceName) {
            return $location.path('/');
        }
        // TODO This param will not be mandatory in the near future...
        if (!$routeParams.siteName) {
            return $location.path('/');
        }
        $scope.serviceName = $routeParams.serviceName;
        $scope.siteName = $routeParams.siteName;
        $scope.methods = ['runJson', 'runScript'];
        $scope.timeout = 60; //default, can be changed by the user

        // TODO This is a clear candidate to be refactored out, to a service that deals with user session, auth credentials, etc...
        RunInBackgroundScript.getFromLocalStorage(RunInBackgroundScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
            AngularScope.apply($scope, function () {
                $scope.marketplaceURL = lastUsedMarketplaceURL;
            });
        });
        RunInBackgroundScript.getFromLocalStorage($scope.siteName).done(function (siteAsJson) {
            AngularScope.apply($scope, function () {
                $scope.site = new Site(siteAsJson);

                // TODO Can we move this method outside the callback chain?
                $scope.createNewDatasource = function () {
                    // TODO only keep siteName validation here...
                    if (siteNameIsNotPresent()) {
                        return;
                    }
                    var datasource = {};
                    datasource.name = $scope.newDatasourceName;
                    datasource.description = $scope.description;
                    datasource.type = 'query';
                    datasource.serviceName = $scope.serviceName;
                    datasource.serviceType = 'webauthorapi';// TODO This should be taken from the actual service object
                    datasource.operationName = $scope.method;
                    datasource.timeout = $scope.timeout;
                    datasource.cache = '0';
                    datasource.params = $scope.site.getAllParams();
                    datasource.body =  $scope.method === 'runJson' ? JSON.stringify({json: $scope.site.toJson()}) : {script: $scope.site.toCasper()};

                    datasourceService.createDatasource($scope, datasource, $scope.marketplaceURL, function(error) {
                        if (error) { return; }

                        alert("Data source created: " + JSON.stringify(datasource, null, 2));
                        //TODO $location.path('/datasource/list');
                    });
                };

                $scope.cancel = function () {
                    $location.path('#/zero');
                };

                var siteNameIsNotPresent = function() {
                    if (!$scope.siteName) {
                        alert('Please specify the site name');
                        return true;
                    }
                    return false;
                };
            });
        });
    })
})();