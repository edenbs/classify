angular.module('classify')
    .factory('socket', function (socketFactory, $mdToast, $state) {
        var ioSocket = io('');
        var socket = socketFactory({
            ioSocket: ioSocket
        });
        var registeredEvents = {};
        var registeredEventsErrors = {};

        return {
            register: function(uuid, cb, errCb) {
                registeredEvents[uuid] = cb;
                registeredEventsErrors[uuid] = errCb;
                socket.on('timeout-' + uuid, function () {
                    if (registeredEventsErrors[uuid]) {
                        registeredEventsErrors[uuid]();
                    }
                    $mdToast.show($mdToast.simple()
                        .textContent('The system couldn\'t find optimal classes in a reasonable time'));
                });

                socket.on('fail-' + uuid, function () {
                    if (registeredEventsErrors[uuid]) {
                        registeredEventsErrors[uuid]();
                    }
                    $mdToast.show($mdToast.simple()
                        .textContent('An error occurred while generating classes'));
                });

                socket.on('complete-' + uuid, function () {
                    if (registeredEvents[uuid]) {
                        registeredEvents[uuid]();
                    }
                    else {
                        $mdToast.show($mdToast.simple()
                            .textContent('Your New Generation is Completed')
                            .action('SHOW ME')
                            .highlightAction(true))
                            .then(function(response) {
                                if (response === 'ok') {
                                    $state.go('shell.classes');
                                }
                            });
                    }
                });
            },
            unregister: function(uuid) {
                delete registeredEvents[uuid];
                delete registeredEventsErrors[uuid];
            }
        };
    });
