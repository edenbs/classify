'use strict';

angular.module('classify').controller('GenerateController', function($scope, $mdDialog) {
    $scope.MaxStudents = {name: 'MaxStudents', value: {}};

    $scope.generate = function (ev) {
        //TO DO : the algo
        //to do : MaxStudents to the db
        window.location.replace("/classes")
    };
  
});