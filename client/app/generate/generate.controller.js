'use strict';

angular.module('classify').controller('GenerateController2', function($scope, $classes, $state, socket) {
    $scope.generating = false;
    $scope.maxStudents = 30;

    $scope.generate = function () {
        $scope.generating = true;
        $classes.generate({maxStudents: $scope.maxStudents}).$promise.then(function(data) {
            socket.register(data.uuid, function () {
                $state.go('shell.classes');
            });

            $scope.$on('$destroy', function() {
                socket.unregister(data.uuid);
            });
        });
    };
});