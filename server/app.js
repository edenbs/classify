import 'dotenv/config';
import mongoose from 'mongoose';
import mongooseConfig from './config/mongoose';
import express from 'express';
import expressConfig from './config/express';
import logger from './components/logger';
import socketio from 'socket.io';
import configSocketIO from './config/socketio';

const app = express();

expressConfig(app);

import Student from './api/student/student.model.js';
import School from './api/school/school.model.js';

mongooseConfig(mongoose)
    .then(() => {
        /*School.find({name: 'Gimnasia Realit'})
            .then(school => {
                return Student.find({school});
            })
            .then(students => {
                process.env.CLASSIFY_PARAMS = JSON.stringify({students, maxStudents: 30});
                require('./api/class/alg');

                process.exit(0);
            })
            .catch(err => {
                console.log(err);
                process.exit(1);
            });*/

        const server = app.listen(process.env.PORT, () => {
            logger.info('Express listening on port %s', process.env.PORT);

            const io = socketio(server);
            configSocketIO(io);
        });
    });

mongoose.connect(process.env.MONGO_URI);

export default app;
