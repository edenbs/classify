angular.module('classify')
    .service('$students', function($resource) {
        return $resource('/api/students', {}, {
            'paginate': {
                method: 'GET',
                params: {
                    sort: 'name.first',
                    limit: 5,
                    page: 1
                }
            },
            'update': {url: '/api/students/:id', method: 'PUT', params: {id: '@_id'}},
            'delete': {url: '/api/students/:id',method: 'DELETE', params: {id: '@_id'}},
            'upload': {url: '/api/students/upload',method: 'PUT'},
            'search': {url: '/api/students/search', method: 'GET', params: {id: '@_id'}},
            'getByID': {url: '/api/students/:id', method: 'GET', params: {id: '@_id'}}
        })
    });
