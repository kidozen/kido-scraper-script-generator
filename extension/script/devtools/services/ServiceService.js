'use strict';
require('angular');

var kidoScraper = require('../KidoScraper');

require('../services/RunInBackgroundScript');

module.exports = (function () {

    kidoScraper.service('serviceService', function ($http, RunInBackgroundScript) {

            // TODO The marketplaceURL and existing services should not be passed in as parameters but provided someone else
            var createService = function (service, existingServices, marketplaceURL, cb) {
                if (serviceIsInvalid(service, existingServices)) {
                    return cb(Error.create("Validation errors"));
                }
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'POST',
                        url: marketplaceURL + 'api/admin/v2/services/',
                        headers: {
                            'Authorization': token,
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify(service)
                    }).then(function (response) {
                        _enableService(service, marketplaceURL, token, cb);
                    }, function (error) {
                        cb(Error.create("An error occurred while creating the service instance " + service.name, err));
                    });
                });
            };

            var getAllServices = function (marketplaceURL, cb) {
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'GET',
                        url: marketplaceURL + 'api/services',
                        headers: {'Authorization': token},
                        ignoreLoadingBar: true
                    }).then(function (response) {
                        cb(null, response.data);
                    }, function (err) {
                        cb(Error.create("An error occurred while retrieving services", err), null);
                    });
                });
            };

            var _enableService = function (service, marketplaceURL, token, cb) {
                var retries = 3;
                $http({
                    method: 'POST',
                    url: marketplaceURL + 'api/admin/v2/services/' + service.name + "/enable",
                    cache: false,
                    headers: {
                        'Authorization': token
                    }
                }).then(function (response) {
                    cb(null);
                }, function (error) {
                    if (retries-- > 0) {
                        _enableService();
                    } else {
                        cb(Error.create("An error occurred while enabling the service instance " + service.name, err));
                    }
                });
            };

            var serviceIsInvalid = function (s, existingServices) {
                return _newServiceNameIsInvalid(s, existingServices) || _runOnIsInvalid(s);
            };

            var _newServiceNameIsInvalid = function (service, existingServices) {
                if (!service.name) {
                    alert('Please specify the name of the new service');
                    return true;
                }
                if (service.name.toString().match(/^[-a-zA-Z0-9,&]+$/) == null) {
                    alert('New Service name must contain only alphanumeric characters');
                    return true;
                }
                var existingServiceWithSameName = existingServices.filter(function (s) {
                    return s.name === service.name;
                });
                if (existingServiceWithSameName.length > 0) {
                    alert(service.name + ' already exists. Please choose a different name');
                    return true;
                }
                return false;
            };

            var _runOnIsInvalid = function (service) {
                if (!service.runOn || typeof service.runOn !== 'object') {
                    alert('Please specify where the new service will run on');
                    return true;
                }
                return false;
            };

            return {
                createService: createService,
                getAllServices: getAllServices,
                serviceIsInvalid: serviceIsInvalid
            };
        }
    );
})();
