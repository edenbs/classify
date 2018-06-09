let socketio = null;

export default function(io) {
    socketio = io;
};

export function onGenerateComplete(uuid) {
    socketio.emit(`complete-${uuid}`);
};

export function onGenerateFail(uuid) {
    socketio.emit(`fail-${uuid}`);
};

export function onGenerateTimeout(uuid) {
    socketio.emit(`timeout-${uuid}`);
};
