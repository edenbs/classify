import Class from './class.model';
import Student from '../student/student.model';
import createError from 'http-errors';
import XLSX from 'xlsx';
import {promisify} from 'util';
import {spawn} from 'child_process';
import _ from 'lodash';
import logger from '../../components/logger';
import {onGenerateComplete, onGenerateTimeout, onGenerateFail} from '../../config/socketio';
import uuid from 'uuid4';

const errorIfEmpty = result => result || Promise.reject(createError(404));
const errorIfNotSchool = (c, school) => c.school.equals(school) ? c : Promise.reject(createError(403));

export function index(req) {
    return Class.find({school: req.user.school});
}

export function get(req) {
    return Class.findById(req.params.id)
        .populate('students')
        .then(errorIfEmpty)
        .then(c => errorIfNotSchool(c, req.user.school));
}

export function download(req, res) {
    return Class.find({school: req.user.school})
        .populate('students')
        .then(classes => {
            if (!classes.length) {
                return Promise.reject(createError(404));
            }

            const wb = XLSX.utils.book_new();

            _.each(classes, c => {
                const ws = XLSX.utils.json_to_sheet(c.students.map(s => ({
                    'First Name': s.name.first,
                    'Last Name': s.name.last,
                    'ID': s.id,
                    'Gender': s.gender,
                    'Average Grade': s.avgGrade,
                    'Social': s.social,
                    'First Prefer': s.prefer.first,
                    'Second Prefer': s.prefer.second,
                    'Third Prefer': s.prefer.third
                })));
                XLSX.utils.book_append_sheet(wb, ws, `Class ${c.index}`);
            });

            res.setHeader('Content-disposition', 'attachment; filename=classes.xlsx');
            return XLSX.write(wb, {type:'buffer'});
        });
}

export function generate(req) {
    if (!req.body || !req.body.maxStudents) {
        return Promise.reject(createError(400));
    }

    return Class.remove({school: req.user.school})
        .then(() => Student.find({school: req.user.school}))
        .then(students => {
            if (students.length <= req.body.maxStudents) return Promise.reject(createError(400, 'Insufficient number of students in school'));

            const id = uuid();
            let timeout = false;
            let alg = null;

            setTimeout(() => {
                if (alg) {
                    alg.kill(9);
                    timeout = true;
                }
            }, parseInt(process.env.ALG_TIMEOUT_IN_MIN  || 10) * 60 * 1000);

            new Promise((resolve, reject) => {
                alg = spawn('node', ['alg'], {
                    cwd: __dirname,
                    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
                    env: Object.assign({}, process.env, {
                        CLASSIFY_PARAMS: JSON.stringify({maxStudents: req.body.maxStudents, students})
                    })
                });

                alg.on('message', data => {
                    logger.info('Process has finished');
                    alg = null;
                    resolve(JSON.parse(data));
                });

                alg.on('close', code => {
                    alg = null;

                    if (code && code !== 0) {
                        onGenerateFail(id);
                        reject('Process has failed');
                    }

                    if (timeout) {
                        onGenerateTimeout(id);
                        reject('Timeout while generating classes');
                    }
                });

                alg.on('error', () => {
                    alg = null;
                    reject('Process has failed to start');
                });
            })
                .then(classes => Promise.all(classes.map(c => new Class(_.extend(c, {school: req.user.school})).save())))
                .then(() => onGenerateComplete(id))
                .catch(err => {
                    logger.error({err}, 'Error occurred while generating classes')
                });

            return {uuid: id};
        });
}
