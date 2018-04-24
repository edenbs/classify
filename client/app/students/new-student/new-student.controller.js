'use strict';

angular.module('classify')
    .controller('AddStudent', function ($scope, $mdDialog, $students) {
        $scope.student = {name: {}, gender: '', avgGrade: 0, prefer: {}};
        $scope.simulateQuery=true;
        $scope.searchStds = [];
        $scope.validID = true;
        $scope.IDLength = 9;

        $scope.searchQuery= {
            sort: 'name.first',
            limit: 10,
            page: 1
        };

        $scope.save = function () {
            $mdDialog.hide($scope.student);
        };

        $scope.validateID = function(id){
            if  (id){
                if (id.length == $scope.IDLength) {
                    $students.getByID({id:id}).$promise.then(function (items) {

                        console.log("hereeeeee");
                        console.log(items);

                        if(items.docs.length > 0) {
                            $scope.validID = false;
                        }else
                            $scope.validID =  true;
                    });
                }
            }
        };

        /* Preference section */
        /*Searching for preferred student*/
        $scope.querySearch = function(search) {
            return $students.search({
                sort: 'name.first',
                limit: 10,
                page: 1,
                name: search
            }).$promise.then(function (items) {$scope.lastSearch = items.docs; return _.map(items.docs, 'id')});
        };

        /*Present given student full name*/
        $scope.getFullName = function (id) {
            var item = _.find($scope.lastSearch, {id: id});
            return item ? (item.name.first + " " +item.name.last + " (" + item.id + ")") : id;
        };
    });