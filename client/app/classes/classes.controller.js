'use strict';

angular.module('classify').controller('ClassesController', function($scope, $mdEditDialog, classes, $classes, $mdToast, $cookieStore) {
    $scope.classes = classes;
    $scope.currClass = null;

    $scope.paginate = {
        limit: 5,
        currPage: 1
    };

    $scope.loadClass = function (c) {
        $classes.get({}, c).$promise.then(function (data) {
            $scope.currClass = data;
        })
        .catch(function (err) {
                if (err) $mdToast.showSimple('Error Showing Class');
            })
    };

    $scope.export = function () {
        var link = document.createElement('a');
        link.href = '/api/classes/download?access_token=' + $cookieStore.get('token');
        link.click();
    };
});