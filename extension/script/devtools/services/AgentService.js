'use strict';
require('angular');

module.exports = (function () {

    angular.module('KidoScraper')
        .service('agentService', function ($http, RunInBackgroundScript) {

            // TODO The marketplaceURL should be provided by a service that knows the current auth details
            var getAllAgents = function (marketplaceURL, cb) {
                RunInBackgroundScript.getAuthToken(marketplaceURL).done(function (token) {
                    $http({
                        method: 'GET',
                        url: marketplaceURL + 'api/admin/agents',
                        headers: {'Authorization': token},
                        cache: false,
                        ignoreLoadingBar: true
                    }).then(function (response) {
                        if (response.data && typeof Array.isArray(response.data)) {
                            response.data.forEach(function (agent) {
                                agent.type = 'agent';
                                delete agent._id;
                                delete agent.services;
                            });
                        } else {
                            response.data = [];
                        }
                        cb(null, response.data);
                    }, function (err) {
                        cb(Error.create("Error while attempting to retrieve agents", err, null));
                    });
                });
            };

            return {
                getAllAgents: getAllAgents
            };
        }
    );
})();
