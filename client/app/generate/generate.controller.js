'use strict';

angular.module('classify').controller('GenerateController2', function($scope, $classes, $state) {
    $scope.generating = false;
    $scope.maxStudents = 30;

    $scope.generate = function () {
        $scope.generating = true;
        $classes.generate({maxStudents: $scope.maxStudents}).$promise.then(function() {
            $state.go('shell.classes')
        });
    };
});