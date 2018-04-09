'use strict';

angular.module('classify').controller('GenerateController2', function($scope, $classes, $state) {
    $scope.maxStudents = 30;

    $scope.generate = function () {
        $classes.generate({maxStudents: $scope.maxStudents}).$promise.then(function() {
            $state.go('shell.classes')
        });
    };
});