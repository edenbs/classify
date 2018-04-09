'use strict';

angular.module('classify')
    .config(function ($stateProvider) {
        $stateProvider.state('shell.classes',{
            url: '/classes',
            templateUrl: 'app/classes/classes.html',
            controller: 'ClassesController',
            resolve: {
                classes: function($classes) {
                    return $classes.query().$promise;
                }
            },
            data: {
                requiredRole: ['manager', 'editor', 'viewer']
            }
        })
   });
