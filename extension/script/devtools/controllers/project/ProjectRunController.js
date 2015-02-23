'use strict';
require('angular');

var kidoScraper = require('../../KidoScraper');
var Site = require('../../model/Site');

require('../../services/RunInBackgroundScript');
require('../../services/AngularScope');
require('../../services/BaseErrorHandler');
require('../../services/ServiceService');
require('../../services/AgentService');

module.exports = (function () {

    kidoScraper.controller('ProjectRunController', function ($scope, $routeParams, $location, $http, $modal,
                                                             RunInBackgroundScript, AngularScope, baseErrorHandler,
                                                             serviceService, agentService) {
        console.log('Loading Project Run Controller...');

        if (!$routeParams.name) {
            return $location.path('/');
        }
        $scope.breadcrumbReplacements = {'Project Name': $routeParams.name};
        $scope.timeout = 60;
        $scope.ignoreSSLErrors = false;
        $scope.running = false;
        $scope.selectedServiceName = '';
        $scope.alerts = [];
        $scope.NEW_SERVICE_META_KEY = "New Service...";

        $scope.openModalIfNecessary = function() {
            if ($scope.selectedServiceName === $scope.NEW_SERVICE_META_KEY) {
                var modalInstance = $modal.open({
                    scope: $scope,
                    templateUrl: 'createNewServiceModal.html',
                    controller: 'NewServiceModalController',
                    backdrop: 'static'
                });
            }
        };

        RunInBackgroundScript.getFromLocalStorage(RunInBackgroundScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
            AngularScope.apply($scope, function () {
                $scope.marketplaceURL = lastUsedMarketplaceURL;
            });
        });
        RunInBackgroundScript.getFromLocalStorage($routeParams.name).done(function (siteAsJson) {
            AngularScope.apply($scope, function () {
                $scope.site = siteAsJson;

                serviceService.getAllServices($scope.marketplaceURL, function (error, services) {
                    if (error) {
                        return baseErrorHandler.handleError(error, "Error while attempting to retrieve services", $scope.marketplaceURL);
                    }
                    // prepend an special option for creating a new service
                    services.unshift({name: $scope.NEW_SERVICE_META_KEY, enterpriseApi: "webauthorapi"});
                    $scope.services = services;

                    agentService.getAllAgents($scope.marketplaceURL, function (error, agents) {
                        if (error) {
                            return baseErrorHandler.handleError(error, "Error while attempting to retrieve agents", $scope.marketplaceURL);
                        }
                        // artificially add the 'kidozen' (cloud) option
                        agents.unshift({name: 'kidozen', type: 'cloud'});
                        $scope.agents = agents;
                    });
                });

                $scope.run = function () {
                    if (!$scope.selectedServiceName) return alert("Please choose the service to run the script with!");
                    if (timeoutIsInvalid()) return;
                    if (!$scope.site.steps || $scope.site.steps.length == 0) return alert("Cannot run the service without at least one scraping step!");

                    $scope.running = true;

                    // TODO Move this to ServiceService.js
                    RunInBackgroundScript.getAuthToken($scope.marketplaceURL).done(function (token) {
                        $http({
                            method: 'POST',
                            url: $scope.marketplaceURL + 'api/admin/services/' + $scope.selectedServiceName + '/invoke/runJson',
                            headers: {
                                'Authorization': token,
                                'timeout': $scope.timeout,
                                "Content-Type": "application/json"
                            },
                            data: {json: new Site($scope.site).toJson(), ignoreSSLErrors: $scope.ignoreSSLErrors}
                        }).then(function (response) {
                            if (response.status !== 200 || response.data.error) {
                                alert(JSON.stringify(response.data, null, 2));
                            } else {
                                $scope.executionResult = JSON.stringify(response.data, null, 2);
                            }
                            $scope.running = false;
                        }, function (error) {
                            baseErrorHandler.handleError(error, "Error while invoking the method 'runJson'", $scope.marketplaceURL);
                            $scope.running = false;
                        });
                    });
                };
                $scope.createDatasource = function () {
                    if (!$scope.selectedServiceName) {
                        alert("Could not determine the service the datasource will be associated to!");
                        return;
                    }
                    $location.path('/datasources/create/' + $scope.site.name + '/' + $scope.selectedServiceName);
                };

                var timeoutIsInvalid = function () {
                    if (!$scope.timeout || $scope.timeout.toString().match(/[^0-9]+/) != null) {
                        alert("The timeout must be a positive integer!");
                        return true;
                    }
                    return false;
                };
            });
        });
    });

    kidoScraper.controller('NewServiceModalController', function ($scope, $timeout, $modalInstance, AngularScope,
                                                                                    baseErrorHandler, serviceService) {
        $scope.createNewService = function () {
            if ($scope.newServiceName === $scope.NEW_SERVICE_META_KEY) {
                return alert("The service name you specified is invalid. Please choose a different one");
            }
            var service = {};
            service.name = $scope.newServiceName;
            service.runOn = $scope.runOn;
            service.enterpriseApi = 'webauthorapi';
            service.config = {};

            if (serviceService.serviceIsInvalid(service, $scope.services)) return;

            if (service.runOn.type === 'cloud') {
                service.runOn.type = 'hub';
            }
            serviceService.createService(service, $scope.services, $scope.marketplaceURL, function (error) {
                if (error) {
                    $modalInstance.dismiss('error');
                    return baseErrorHandler.handleError(error, "Error while attempting to create a new service", $scope.marketplaceURL);
                }
                if (service.runOn.type === 'hub') {
                    service.runOn.type = 'cloud';
                }
                $scope.services.push(service);
                $scope.services.sort(function (a, b) {
                    if (a.name == $scope.NEW_SERVICE_META_KEY || a.name < b.name) return -1;
                    if (b.name == $scope.NEW_SERVICE_META_KEY || a.name > b.name) return 1;
                    return 0;
                });
                // FIXME For some reason, the select widget does not update and causes a couple of problems...
                $scope.selectedServiceName = service.name;
                $modalInstance.close();

                $scope.newServiceName = '';
                $scope.runOn = null;

                $scope.addAlert({timeout: 3000, msg: "New service '" + $scope.selectedServiceName + "' has been successfully created"});
            });
        };

        $scope.cancelNewServiceCreation = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.addAlert = function(alert) {
            $scope.alerts.push(alert);

            if (alert.timeout) {
                $timeout(function(){
                    $scope.closeAlert($scope.alerts.indexOf(alert));
                }, alert.timeout);
            }
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    });
})();