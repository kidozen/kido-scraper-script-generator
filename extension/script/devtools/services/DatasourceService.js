'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('datasourceService', function ($http, RunInBackgroundScript) {

            // TODO The marketplaceURL should be provided by a service that knows the current auth details
            var createDatasource = function (ds, marketplaceURL, cb) {
                if (_datasourceIsInvalid(ds)) {
                    return cb(Error.create("Validation errors"));
                }
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'POST',
                        url: marketplaceURL + 'api/admin/datasources/',
                        headers: {
                            'Authorization': token,
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify(ds)
                    }).then(function (response) {
                        cb(null);
                    }, function (err) {
                        cb(Error.create("An error occurred while creating the datasource " + ds.name, err));
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
                        headers: { 'Authorization': token }
                    }).then(function (response) {
                        cb(null, {deleted: true});
                    }, function (err) {
                        cb(Error.create("An error occurred while deleting the datasource instance " + ds.name, err));
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
                getAllDatasources: getAllDatasources,
                deleteDatasource: deleteDatasource
            };
        }
    );
})();
