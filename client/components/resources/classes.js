angular.module('classify')
    .service('$classes', function ($resource) {
        return $resource('/api/classes/:id', {id: '@_id'}, {
            generate: {method: 'POST', url: '/api/classes/generate'}
        })
    });
