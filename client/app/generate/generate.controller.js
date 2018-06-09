'use strict';

angular.module('classify').controller('GenerateController2', function($scope, $classes, $state, socket, $mdToast) {
    $scope.generating = false;
    $scope.maxStudents = 30;

    $scope.generate = function () {
        $scope.generating = true;
        $classes.generate({maxStudents: $scope.maxStudents}).$promise.then(function(data) {
            socket.register(data.uuid, function () {
                $state.go('shell.classes');
            }, function () {
                $scope.generating = false;
            });

            $scope.$on('$destroy', function() {
                socket.unregister(data.uuid);
            });
        })
        .catch(function (err) {
            $mdToast.show($mdToast.simple()
                .textContent(_.get(err, 'data.message') || 'An error occurred while generating classes'));
            $scope.generating = false;
        });
    };
});