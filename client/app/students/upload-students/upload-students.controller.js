'use strict';

angular.module('classify').controller('UploadStudentsController',function($scope, $students,$mdDialog,
                                                                          Upload,$timeout, $q) {
    $scope.added = false;

    $scope.$watch('file', function (err) {
       return $scope.uploadExcel($scope.file,err);
    });

    $scope.uploadExcel = function (file, errFiles) {

        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        let deferred = $q.defer(); // you need inject the $q

        if (file) {

            /* WORKED WITH PROMISE:
             - this version worked with promise but NOT with the file uploading
             - could also be only $students.upload().$promise, the lines below are testing the req on server side
             - also tried :  upload({url: '/api/students/:file',method: 'PUT',params:{file:'file'})in resources
             $students.upload({
             url: '/api/students/upload',
             method: 'PUT',
             // file: file,
             data: {file: file,}
             }).$promise*/
            Upload.upload({
                url: '/api/students/upload',
                method: 'PUT',
                file: file,
            }).then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                });

            }, function (response) {

                if (response.xhrStatus != "complete" && response.error) {
                    $scope.errorMsg = response.status + ': ' + response.data + " : " + response.data.error;
                }
            }, function (evt) {

                file.progress = Math.min(100, parseInt(100.0 *
                    evt.loaded / evt.total));
            });

        };

        /*WORKED AROUND PROMISE:
        * this works, it make the function wait until all the files and error appear
        * but still can not read data to .then*/
        return deferred.promise.then(function(result) {
            // here you can use the result of promiseB
            console.log(result);
        });;
    };

    $scope.close = function () {
        $mdDialog.hide($scope.student);
    }
});
