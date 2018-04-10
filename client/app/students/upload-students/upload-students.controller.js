'use strict';

angular.module('classify').controller('UploadStudentsController',function($scope, $students,$mdDialog,
                                                                          Upload) {
    $scope.uploadExcel = function (files) {
        if (files && files.length) {
            $scope.file = files[0];

            Upload.upload({
                url: '/api/students/upload',
                method: 'PUT',
                file: $scope.file
            }).then(function (response) {
                $scope.file.result = response.data;
            }, function (response) {
                if (response.status !== 200) {
                    $scope.errorMsg = 'An error occurred uploading the file';
                }
            }, function (evt) {
                $scope.file.progress = Math.min(100, parseInt(100.0 *
                    evt.loaded / evt.total));
            });
        }
    };

    $scope.close = function () {
        $mdDialog.hide();
    }
});
