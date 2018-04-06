'use strict';

angular.module('classify')
    .config(function ($stateProvider) {
        $stateProvider.state('shell.classes',{
            url: '/classes',
            templateUrl: 'app/classes/classes.html',
            controller: 'ClassesController',
            resolve: {
                students: function($students) {
                    return $students.paginate().$promise;
                }
            },
            data: {
                requiredRole: ['manager', 'editor', 'viewer']
            }
        })
   });
