angular.module('classify')
    .factory('socket', function (socketFactory, $mdToast, $state) {
        var ioSocket = io('');
        var socket = socketFactory({
            ioSocket: ioSocket
        });
        var registeredEvents = {};

        return {
            register: function(uuid, cb) {
                registeredEvents[uuid] = cb;
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
            }
        };
    });
