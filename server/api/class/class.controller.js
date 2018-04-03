import Class from './class.model';
import Student from '../student/student.model';
import createError from 'http-errors';
import XLSX from 'xlsx';
import {promisify} from 'util';
const execFile = promisify(require('child_process').execFile);
import _ from 'lodash';

const errorIfEmpty = result => result || Promise.reject(createError(404));

export function index() {
    return Class.find({});
}

export function get(req) {
    return Class.findById(req.params.id)
        .populate('students');
}

export function download(req, res) {
    return Class.find({})
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

    return Class.remove({})
        .then(() => Student.find({}))
        .then(students => execFile('node', ['class.alg.js'], {
            cwd: __dirname,
            env: {
                CLASSIFY_PARAMS: JSON.stringify({maxStudents: req.body.maxStudents, students})
            }
        }))
        .then(({stdout, stderr}) => JSON.parse(stdout))
        .then(classes => Promise.all(classes.map(c => new Class(c).save())))
        .then(_.noop);
}
