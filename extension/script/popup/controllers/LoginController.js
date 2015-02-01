angular.module('KidoScraperPopup').controller("LoginController", function ($scope) {
    $scope.marketplaceURL = "";
    $scope.logged = false;

    var bgScript = getBackgroundScript("BackgroundScript");
    var devTools = getBackgroundScript("DevTools");

    bgScript.getFromLocalStorage(bgScript.lastUsedMarketplaceURL).done(function (lastUsedMarketplaceURL) {
        if (lastUsedMarketplaceURL) {
            $scope.$apply(function () {
                $scope.marketplaceURL = lastUsedMarketplaceURL;
            });
            bgScript.getAuthTokenKeyInLocalStorageFor($scope.marketplaceURL).done(function(tokenKey) {
                bgScript.getFromLocalStorage(tokenKey).done(function (authToken) {
                    if (authToken) {
                        $scope.$apply(function () {
                            $scope.logged = authToken != null;
                            bgScript.changeExtensionPopUpIcon($scope.logged);
                        });
                    }
                });
            });
        }
    });

    $scope.login = function () {
        if (!$scope.marketplaceURL) {
            alert("The Marketplace URL is required");
            return;
        }
        // Standardize all marketplace URLs to have a trailing slash
        $scope.marketplaceURL = $scope.marketplaceURL.replace(/\/?$/, '/');

        devTools.getAuthToken({marketplaceURL: $scope.marketplaceURL, fromLogin: true}).done(function (authToken) {
            if (authToken != null) {
                $scope.logged = authToken != null;
                bgScript.changeExtensionPopUpIcon($scope.logged);
            }
        });
    };

    $scope.logout = function () {
        if (!$scope.marketplaceURL) {
            alert("The Marketplace URL is required");
            return;
        }
        bgScript.getAuthTokenKeyInLocalStorageFor($scope.marketplaceURL).done(function(tokenKey) {
            bgScript.deleteFromLocalStorage(tokenKey).done(function () {
                $scope.$apply(function () {
                    $scope.logged = false;
                    bgScript.changeExtensionPopUpIcon($scope.logged);
                });
            });
        });
    };
});