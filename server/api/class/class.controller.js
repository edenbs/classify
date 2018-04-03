import Class from './class.model';
import Student from '../student/student.model';
import createError from 'http-errors';
import XLSX from 'xlsx';
import {promisify} from 'util';
const execFile = promisify(require('child_process').execFile);
import _ from 'lodash';

const errorIfEmpty = result => result || Promise.reject(createError(404));
const errorIfNotSchool = (c, school) => c.school.equals(school) ? c : Promise.reject(createError(403));

export function index() {
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
                    'Average Grade': s.avgGrade
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
        .then(students => execFile('node', ['class.alg.js'], {
            cwd: __dirname,
            env: {
                CLASSIFY_PARAMS: JSON.stringify({maxStudents: req.body.maxStudents, students})
            }
        }))
        .then(({stdout, stderr}) => JSON.parse(stdout))
        .then(classes => Promise.all(classes.map(c => new Class(_.extend(c, {school: req.user.school})).save())))
        .then(_.noop);
}
