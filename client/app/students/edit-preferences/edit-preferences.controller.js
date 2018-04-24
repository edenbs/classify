'use strict';

angular.module('classify')
    .controller('EditPreferences', function ($scope, item, $students, $q, $timeout, $element, save, $mdDialog) {
        $scope.student = item;
        $scope.searchStudent = '';
        $scope.lastSearch = [];
        $scope.preferences = _.clone($scope.student.prefer);

        $scope.update = function (ev) {
            const action = function () {
                $q.when(save($scope.preferences))
                    .then(function() {
                        $element.remove();
                    });
            };

            if (!$scope.preferences.first && $scope.preferences.second ||
                !$scope.preferences.second && $scope.preferences.third) {
                $mdDialog.show($mdDialog.confirm()
                    .title('You left gaps in student\'s preferences!')
                    .textContent('The system will automatically rearrange the non sequential preferences.')
                    .targetEvent(ev)
                    .ok('Confirm')
                    .cancel('Cancel'))
                    .then(action)
                    .catch(_.noop);
            } else {
                action();
            }
        };

        $scope.cancel = function () {
            $element.remove();
        };

        $scope.querySearch = function(search) {
            var deferred = $q.defer();

            $timeout(function() {
                $students.search({
                    sort: 'name.first',
                    limit: 10,
                    page: 1,
                    name: search,
                    currStudent: $scope.student.id,
                    firstPref: $scope.student.prefer.first,
                    secondPref: $scope.student.prefer.second,
                    thirdPref: $scope.student.prefer.third
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

        $scope.getFullName = function (id) {
            var item = _.find($scope.lastSearch, {id: id});
            return item ? (item.name.first + " " +item.name.last + " (" + item.id + ")") : id;
        };
    });
