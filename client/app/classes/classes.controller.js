'use strict';

angular.module('classify').controller('ClassesController', function($scope, $mdEditDialog, students, $students, $q, $mdDialog, $mdToast, auth) {
    $scope.items = students;

    $scope.openCity = function (evt, classNum) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(classNum).style.display = "block";
        evt.currentTarget.className += " active";
    }

    $scope.getItems = function () {
        $scope.promise = $students.paginate($scope.query).$promise.then(function (items) {
            $scope.selected = [];
            $scope.items = items;
        });
    };
});