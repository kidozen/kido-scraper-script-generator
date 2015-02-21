'use strict';
require('angular');

var kidoScraper = require('../../KidoScraper');
var Site = require('../../model/Site');

require('../../services/RunInBackgroundScript');
require('../../services/AngularScope');
require('../../services/BaseErrorHandler');
require('../../services/DatasourceService');
require('../../services/ServiceService');

module.exports = (function () {

    kidoScraper.controller('CreateDatasourceController', function ($scope, $routeParams, $location, $http, $modal,
                                                                   RunInBackgroundScript, AngularScope, baseErrorHandler,
                                                                   datasourceService, serviceService) {
        console.log('Loading CreateDatasource Controller...');

        var options = {parameterizable: true};

        $scope.siteName = $routeParams.siteName;
        $scope.serviceName = $routeParams.serviceName;
        $scope.method = $routeParams.method;

        $scope.projectNameWasSpecified = $scope.siteName != null;
        $scope.serviceNameWasSpecified = $scope.serviceName != null;
        $scope.methodWasSpecified = $scope.method != null;

        $scope.methods = ['runJson', 'runScript'];
        $scope.timeout = 60;

        $scope.$watchGroup(['siteName', 'method'], function (newValues, oldValues) {
            if ($scope.siteName && $scope.method) {

                RunInBackgroundScript.getFromLocalStorage($scope.siteName).done(function (siteAsJson) {
                    AngularScope.apply($scope, function () {
                        $scope.site = new Site(siteAsJson);
                        $scope.dsBody = $scope.method === 'runJson' ?
                            JSON.stringify($scope.site.toJson(options), null, 4) :
                            $scope.site.toCasper(options);
                    });
                });
            }
        });

        // TODO This is a clear candidate to be refactored out, to a service that deals with user session, auth credentials, etc...
        RunInBackgroundScript.getFromLocalStorage(RunInBackgroundScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
            AngularScope.apply($scope, function () {
                $scope.marketplaceURL = lastUsedMarketplaceURL;

                //TODO Create a "projectService" that deals with the details of how to retrieve projects
                RunInBackgroundScript.getFromLocalStorage(null).done(function (allProjects) {
                    AngularScope.apply($scope, function () {
                        $scope.projects = allProjects;
                    });
                });

                serviceService.getAllServices($scope.marketplaceURL, function (error, services) {
                    if (error) {
                        return baseErrorHandler.handleError(error, "Error while attempting to retrieve services", $scope.marketplaceURL);
                    }
                    $scope.services = services;

                    $scope.createNewDatasource = function () {
                        if (projectNameIsNotPresent()) {
                            return;
                        }
                        if ($scope.method === 'runJson' && !isValidJson($scope.dsBody)) {
                            return;
                        }
                        RunInBackgroundScript.getFromLocalStorage($scope.siteName).done(function (siteAsJson) {
                            AngularScope.apply($scope, function () {
                                $scope.site = new Site(siteAsJson);

                                var datasource = {};
                                datasource.name = $scope.newDatasourceName;
                                datasource.description = $scope.description;
                                datasource.type = 'query';
                                datasource.serviceName = $scope.serviceName;
                                datasource.serviceType = 'webauthorapi';
                                datasource.operationName = $scope.method;
                                datasource.timeout = $scope.timeout;
                                datasource.cache = '0';
                                datasource.params = $scope.site.getAllParams();
                                datasource.body = $scope.method === 'runJson' ?
                                    JSON.stringify({json: JSON.parse($scope.dsBody)}) :
                                    JSON.stringify({script: removeLineBreaksFrom($scope.dsBody)});

                                datasourceService.createDatasource(datasource, $scope.marketplaceURL, function (error) {
                                    if (error) {
                                        baseErrorHandler.handleError(error, "Error while creating datasource '" + datasource.name + "'",
                                            $scope.marketplaceURL, false);
                                        return;
                                    }
                                    $modal.open({
                                        scope: $scope,
                                        templateUrl: 'newDsCreatedModal.html',
                                        controller: 'NewDsCreatedModalController',
                                        backdrop: 'static'
                                    });
                                });
                            });
                        });
                    };

                    var projectNameIsNotPresent = function () {
                        if (!$scope.siteName) {
                            alert('Please specify the site name');
                            return true;
                        }
                        return false;
                    };

                    var isValidJson = function (jsonString) {
                        if (jsonString) {
                            try {
                                JSON.parse(jsonString);
                                return true;
                            } catch (err) {
                                alert("The specified JSON is invalid. Please review and try again.");
                            }
                        }
                        return false;
                    }

                    var removeLineBreaksFrom = function (string) {
                        return string.replace(/[\n\r]/g, "");
                    }
                });
            });
        });
    });

    kidoScraper.controller('NewDsCreatedModalController', function ($scope, $location, $modalInstance) {
        $scope.ok = function () {
            $location.path('/projects/' + $scope.siteName);
            $modalInstance.close();
        };
    });
})();