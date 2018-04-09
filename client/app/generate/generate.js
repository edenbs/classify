'use strict';

angular.module('classify')
    .config(function ($stateProvider) {
        $stateProvider.state('shell.generate',{
            url: '/generate',
            templateUrl: 'app/generate/generate.html',
            controller: 'GenerateController2',
            data: {
                requiredRole: ['editor']
            }
        })
   });
