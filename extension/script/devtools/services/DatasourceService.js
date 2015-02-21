'use strict';
require('angular');

var kidoScraper = require('../KidoScraper');

require('../services/RunInBackgroundScript');

module.exports = (function () {

    kidoScraper.service('datasourceService', function ($http, RunInBackgroundScript) {

            // TODO The marketplaceURL should be provided by a service that knows the current auth details
            var createDatasource = function (ds, marketplaceURL, cb) {
                if (_datasourceIsInvalid(ds)) {
                    return cb(new Error("Validation errors"));
                }
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'POST',
                        url: marketplaceURL + 'api/admin/datasources/',
                        headers: {
                            'Authorization': token,
                            "Content-Type": "application/json"
                        },
                        data: ds
                    }).then(function (response) {
                        cb(null);
                    }, function (err) {
                        cb(Error.create("An error occurred while creating the datasource " + ds.name, err));
                    });
                });
            };

            var getDatasourceByName = function (dsName, marketplaceURL, cb) {
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'GET',
                        url: marketplaceURL + 'api/admin/datasources/' + dsName,
                        headers: {
                            'Authorization': token,
                            "Content-Type": "application/json"
                        },
                        cache: false
                    }).then(function (response) {
                        cb(null, response.data);
                    }, function (err) {
                        cb(Error.create("An error occurred while retrieving a datasource with name " + dsName, err), null);
                    });
                });
            };

            var getAllDatasources = function (marketplaceURL, cb) {
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'GET',
                        url: marketplaceURL + 'api/admin/datasources/',
                        headers: {
                            'Authorization': token,
                            "Content-Type": "application/json"
                        },
                        cache: false
                    }).then(function (response) {
                        cb(null, response.data);
                    }, function (err) {
                        cb(Error.create("An error occurred while retrieving existing datasources", err), null);
                    });
                });
            };

            var deleteDatasource = function (ds, marketplaceURL, cb) {
                if (!ds) {
                    var msg = "Could not determine the datasource to be deleted";
                    alert(msg);
                    return cb(Error.create(msg));
                }
                if (!confirm("Are you sure you want to delete the datasource '" + ds.name + "'?")) {
                    return cb(null, {deleted: false});
                }
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'DELETE',
                        url: marketplaceURL + "api/admin/datasources/" + ds.name,
                        headers: {'Authorization': token}
                    }).then(function (response) {
                        cb(null, {deleted: true});
                    }, function (err) {
                        cb(Error.create("An error occurred while deleting the datasource instance " + ds.name, err));
                    });
                });
            };

            var runDatasource = function (ds, marketplaceURL, cb) {
                if (_datasourceIsInvalid(ds)) {
                    return cb(Error.create("Validation errors"));
                }
                //TODO Process the params in order to better support more complex datatypes

                var qs = ds.params.length > 0 ? "?" + $.param(ds.params) : "";

                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'GET',
                        url: marketplaceURL + 'api/v2/datasources/' + ds.name + qs,
                        headers: {
                            'Authorization': token,
                            'timeout': "" + ds.timeout
                        },
                        timeout: ds.timeout * 1000,
                        cache: false
                    }).then(function (response) {
                        if (response.status !== 200 || response.data.error) {
                            var msg = "The datasource invocation produced an error: " + response.statusText + " / " + JSON.stringify(response.data, null, 2);
                            alert(msg);
                            cb(Error.create(msg, response.data.error));
                        } else {
                            cb(null, response.data);
                        }
                    }, function (err) {
                        cb(Error.create("Error while invoking '" + ds.name + "'"), err);
                    });
                });
            };

            var _datasourceIsInvalid = function (ds) {
                return _newDatasourceNameIsInvalid(ds) || _descriptionIsInvalid(ds) || _serviceNameIsInvalid(ds) || _methodIsInvalid(ds) || _timeoutIsInvalid(ds);
            };

            var _newDatasourceNameIsInvalid = function (ds) {
                if (!ds.name) {
                    alert('Please specify the name of the new datasource');
                    return true;
                }
                if (ds.name.toString().match(/^[-a-zA-Z0-9,&]+$/) == null) {
                    alert('New Datasource name must contain only alphanumeric characters');
                    return true;
                }
                //TODO Validate ds name against existing ones...
                //var existingDatasourceWithSameName = datasources.filter(function(d) {
                //    return d.name === ds.newDatasourceName;
                //});
                //if (existingDatasourceWithSameName.length > 0) {
                //    alert(ds.newDatasourceName + ' already exists. Please choose a different name');
                //    return true;
                //}
                return false;
            };

            var _descriptionIsInvalid = function (ds) {
                if (ds.description && ds.description.length > 400) {
                    alert("The description must be shorter than 400 characters");
                    return true;
                }
                return false;
            };

            var _serviceNameIsInvalid = function (ds) {
                if (!ds.serviceName) {
                    alert('Please specify the service this datasource is associated to');
                    return true;
                }
                return false;
            };

            var _methodIsInvalid = function (ds) {
                if (!ds.operationName) {
                    alert('Please specify the method to execute');
                    return true;
                }
                return false;
            };

            var _timeoutIsInvalid = function (ds) {
                if (!ds.timeout || ds.timeout.toString().match(/[^0-9]+/) != null) {
                    alert("The timeout must be a positive integer!");
                    return true;
                }
                return false;
            };

            return {
                createDatasource: createDatasource,
                getDatasourceByName: getDatasourceByName,
                getAllDatasources: getAllDatasources,
                deleteDatasource: deleteDatasource,
                runDatasource: runDatasource
            };
        }
    );
})();
