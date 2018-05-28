let socketio = null;

export default function(io) {
    socketio = io;
};

export function onGenerateComplete(uuid) {
    socketio.emit(`complete-${uuid}`);
};
