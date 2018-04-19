'use strict';

angular.module('classify').controller('EditPreferenceController',function($scope, $students,$mdDialog,$q,$timeout,student) {

    $scope.preferences = {first: student.prefer.first,
                            second: student.prefer.second,
                            third: student.prefer.third};

    /*Present given student full name*/
    $scope.getFullName = function (id) {
        var item = _.find($scope.lastSearch, {id: id});
        return item ? (item.name.first + " " +item.name.last + " (" + item.id + ")") : id;
    };

    /* Preference section */
    /*Searching for preferred student*/
    $scope.querySearch = function(search, item) {
        var deferred = $q.defer();

        $timeout(function() {
            $students.search({
                sort: 'name.first',
                limit: 10,
                page: 1,
                name: search,
                currStudent: student.id,
                firstPref: item.first,
                secondPref: item.second,
                thirdPref: item.third
            }).$promise.then(function (items) {
                $scope.lastSearch = items.docs;

                deferred.resolve(_.map(items.docs, 'id'));
            })
                .catch(function (err) {
                    deferred.reject(err);
                });
        });

        return deferred.promise;
    };

    /*Changing current user relevant preference*/
    $scope.changePreference = function (student) {

        console.log(student.prefer);
        return $students.update(student).$promise
            .then(function () {
                $mdToast.showSimple('Student preference updated successfully');
            })
            .catch(function (err) {
                if (err) $mdToast.showSimple('Error updating student preference: ' + err.data.message);
            });
    };

    $scope.save = function () {
        student.prefer.first = $scope.preferences.first;
        student.prefer.second = $scope.preferences.second;
        student.prefer.third = $scope.preferences.third;

        if(!$scope.preferences.first){
            student.prefer.first = $scope.preferences.second;
            student.prefer.second = $scope.preferences.third;
            student.prefer.third =null;
        }
        else if(!$scope.preferences.second){
            student.prefer.second = $scope.preferences.third;
            student.prefer.third =null;
        }

        $students.update(student).$promise.then(function (items) {
            $mdDialog.hide();
        });

    }
});
