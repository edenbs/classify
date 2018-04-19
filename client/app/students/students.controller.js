'use strict';

angular.module('classify').controller('StudentsController'
    ,function($scope, $mdEditDialog, students, $students, $q, $mdDialog, $mdToast ,auth,Upload,$timeout) {
    $scope.items = students;
    $scope.selected = [];
    $scope.searchStudent = '';
    $scope.lastSearch = [];

    $scope.query = {
        sort: 'name.first',
        limit: 5,
        page: 1
    };

    $scope.validators = {
        name: {
            first: {
                'required': true
            },
            last: {
                'required': true
            }
        },
        avgGrade: {
            'required': true,
            'ng-pattern': '/^([0-9]|[1-8][0-9]|9[0-9]|100)$/'
        },
        social: {
            'pattern': '[1-4]'
        }
    };

    $scope.messages = {
        name: {
            first: {
                'required': 'First name is required'
            },
            last: {
                'required': 'Last name is required'
            }
        },
        avgGrade: {
            'required': 'Avergae grade is required',
            'pattern': 'Avergae grade must be between 0 to 100'
        },
        social: {
            'pattern': 'social grade must be between 1 and 4'
        }
    };

    $scope.onFilter = function () {
        $scope.query.page = 1;
        return $scope.getItems();
    };

    $scope.clearFilter = function (name) {
        _.set($scope.query, name, '');
        return $scope.getItems();
    };

    $scope.getItems = function () {
        $scope.promise = $students.paginate($scope.query).$promise.then(function (items) {
            $scope.selected = [];
            $scope.items = items;
        });
    };

    $scope.onOrderChange = function (sort) {
        $scope.query.sort = sort;
        return $scope.getItems();
    };

    $scope.deleteItems = function () {
        $q.all(_.map($scope.selected, function (item) {
            return $students.delete({}, item).$promise;
        }))
            .then(function () {
                $mdToast.showSimple('Student deleted successfully');
                $scope.getItems();
            });
    };

    $scope.addItem = function (ev) {
        $mdDialog.show({
            controller: 'AddStudent',
            templateUrl: 'app/students/new-student/new-student.html',
            targetEvent: ev,
            clickOutsideToClose: true
        }).then(function (student) {
                return $students.save(student).$promise;
            })
            .then(function () {
                $mdToast.showSimple('Student added successfully');
                $scope.getItems();
            })
            .catch(function (err) {
                if (err) $mdToast.showSimple('Error adding student');
            });
    };

    $scope.edit = function (event, student, property) {
        // Access nested properties
        var getPropertyIn = _.property(_.toPath(property));

        $mdEditDialog.large({
            modelValue: getPropertyIn(student),
            validators: getPropertyIn($scope.validators),
            messages: getPropertyIn($scope.messages),
            targetEvent: event,
            save: function (input) {
                _.set(student, property, input.$modelValue);

                $scope.deferred = $students.update(student).$promise;

                $scope.deferred
                    .then(function () {
                        $mdToast.showSimple('Student updated successfully');
                    })
                    .catch(function (err) {
                        if (err) $mdToast.showSimple('Error updating student: ' + err.data.message);
                    });

                return $scope.deferred;
            }
        })
    };

    $scope.isEditor = function () {
        return auth.hasRole('editor');
    };

    $scope.changeGender = function (student) {
        return $students.update({}, student).$promise
            .then(function () {
                $mdToast.showSimple('Student gender changed');
            })
            .catch(function (err) {
                if (err) $mdToast.showSimple('Error changing student gender');
            });
    };

    $scope.uploadStudents = function (event) {
        $mdDialog.show({
            controller: 'UploadStudentsController',
            templateUrl: 'app/students/upload-students/upload-students.html',
            targetEvent: event,
            clickOutsideToClose: true
        }).then(function () {
            $mdToast.showSimple('Uploading operation ended');
            $scope.getItems();

        }).catch(function (err) {
            if (err) $mdToast.showSimple('Error uploading students');
        });

    };

    $scope.editPreference = function (event,student) {
        $mdDialog.show({
                controller: 'EditPreferenceController',
                templateUrl: 'app/students/edit-preferences/edit-preferences.html',
                targetEvent: event,
                locals : {
                    student: student
                },
                clickOutsideToClose: true
            }).then(function () {
                $mdToast.showSimple('Editing preferences operation ended');

            }).catch(function (err) {
                if (err) $mdToast.showSimple('Error Editing preferences');
            });

    };
});