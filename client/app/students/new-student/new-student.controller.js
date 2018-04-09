'use strict';

angular.module('classify')
    .controller('AddStudent', function ($scope, $mdDialog,$students,$q, $timeout) {
        $scope.student = {name: {}, gender: 'female', avgGrade: 0};
        $scope.simulateQuery=true;
        $scope.searchStds = [];
        $scope.searchQuery= {
            sort: 'name.first',
            limit: 10,
            page: 1
        };

        $scope.save = function () {
            $mdDialog.hide($scope.student);
        }

        /* Preference section */
        /*Searching for preferred student*/
        $scope.querySearch = function(search) {
            var deferred;
            $scope.searchQuery["name"] = search;
            $students.search($scope.searchQuery).$promise.then(function (items) {$scope.searchStds =items.docs});

            if ($scope.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve($scope.searchStds);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return $scope.searchStds;
            }
        };

        /*Changing current user relevant preference*/
        $scope.changePreference = function (property,student,prefStd) {
            _.set(student, property, prefStd.id);
            $scope.deferred = $students.update(student).$promise;

            $scope.deferred
                .then(function () { $mdToast.showSimple('Student preference updated successfully');
                })
                .catch(function (err) { if (err) $mdToast.showSimple('Error updating student preference: ' + err.data.message);
                });

            return $scope.deferred; };

        /*Present given student full name*/
        $scope.getFullName = function (item) {
            var fullName  = item ? (item.name.first + " " +item.name.last): "No student chosed";

            return fullName;
        };
    });