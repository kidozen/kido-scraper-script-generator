'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('datasourceService', function ($http, RunInBackgroundScript, AngularScope) {

            // TODO The marketplaceURL should be provided by a service that knows the current auth details
            var createDatasource = function ($scope, ds, marketplaceURL, cb) {
                if (_newDatasourceNameIsInvalid(ds) || _descriptionIsInvalid(ds) || _methodIsInvalid(ds) || _timeoutIsInvalid(ds)) {
                    return cb(Error.create("Validation errors"));
                }
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    AngularScope.apply($scope, function() {
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
                });
            };

            var getAllDatasources = function (cb, marketplaceURL) {
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
                        alert(JSON.stringify(response, null, 2));
                        cb(response);
                    }, function (err) {
                        cb(Error.create("An error occurred while retrieving existing datasources", err));
                    });
                });
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

            var _descriptionIsInvalid = function (ds) {
                if (ds.description && ds.description.length > 400) {
                    alert("The description is mandatory and must be shorter than 400 characters");
                    return true;
                }
                return false;
            };

            return {
                createDatasource: createDatasource,
                getAllDatasources: getAllDatasources
            };
        }
    );
})();
