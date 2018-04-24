import Student from './student.model.js';
import Class from '../class/class.model.js';
import createError from 'http-errors';
import _ from 'lodash';
import XLS from 'xlsjs'

const errorIfEmpty = result => result || Promise.reject(createError(404));
const errorIfNotSchool = (student, school) => student.school.equals(school) ? student : Promise.reject(createError(403));

export function index(req) {
    var query = {school: req.user.school};

    if (req.query.name) {
        req.query.name = JSON.parse(req.query.name);

        if (req.query.name.first) {
            query['name.first'] = {$regex: req.query.name.first, $options: 'i'};
        }

        if (req.query.name.last) {
            query['name.last'] = {$regex: req.query.name.last, $options: 'i'};
        }
    }

    return Student.paginate(query, req.query);
}

export function create (req) {
    const data = _.pick(req.body, ['id', 'name', 'gender', 'avgGrade','social','prefer']);
    data.school = req.user.school;

    const student = new Student(data);
    swapPreferences(student);

    return student.save()
        .then(student => {
            return Class.remove({school: req.user.school})
                .then(() => student);
        })
        .then(errorIfEmpty)
        .then(_.noop);
}

export function update(req) {
    var data = _.pick(req.body, ['name', 'gender', 'avgGrade','social','prefer']);

    return Student.findById(req.params.id)
        .then(errorIfEmpty)
        .then(student => errorIfNotSchool(student, req.user.school))
        .then(student => {
            return Class.remove({school: req.user.school})
                .then(() => student);
        })
        .then(student => {
            student.set(data);
            if (data.prefer) swapPreferences(student);
            return student.save();
        })
}

export function remove (req) {
    return Student.findById(req.params.id)
        .then(errorIfEmpty)
        .then(student => errorIfNotSchool(student, req.user.school))
        .then(student => {
            return Class.remove({school: req.user.school})
                .then(() => student);
        })
        .then(student => student.remove())
        .then(student => rescueFriends(student.id, req.user.school))
        .then(_.noop);
}

export function loadExcel(req){
    try {
        const workbook = XLS.readFile(req.files.file.path);
        const studentsRows = _.flatten(workbook.SheetNames.map(sheetName =>  XLS.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])));
        const records = studentsRows.map(newStd => ({
            id: newStd.ID,
            name: {
                first: newStd['First Name'],
                last: newStd['Last Name']
            },
            school: req.user.school,
            gender: newStd.Gender,
            avgGrade: newStd['Average Grade'],
            social: newStd.Social,
            prefer: {
                first: newStd['First Prefer'],
                second: newStd['Second Prefer'],
                third: newStd['Third Prefer']
            }
        }));

        const valids = records.map(record => {
            const prefers = Object.keys(record.prefer).map(prefer => {
                return record.prefer[prefer] ? _.find(records, {id: record.prefer[prefer]}) : true;
            });

            return !_.some(prefers, p => !p);
        });

        if (_.some(valids, v => !v)) {
            return Promise.reject(createError(400));
        }

        return Class.remove({school: req.user.school})
            .then(() => Student.remove({school: req.user.school}))
            .then(() => Promise.all(records.map(rec => {
                const student = new Student(rec);

                swapPreferences(student);
                return student.save();
            })))
            .then(_.noop);
    }
    catch (err){
        console.log(err);
        return Promise.reject(createError(500));
    }
}

export function searchStudent(req){
    const query = {
        sort: req.query.sort,
        limit: parseInt(req.query.limit),
        page: parseInt(req.query.page)};

       var searchQuery = {
        id: {$nin: [req.query.currStudent, req.query.firstPref || '', req.query.secondPref || '', req.query.thirdPref || '']},
        school: req.user.school,
        $or: [{'name.first': {$regex: req.query.name, $options: 'i'}},
            {'name.last':{$regex: req.query.name, $options: 'i'}}]
    };

    return Student.paginate(searchQuery, query);
}

function rescueFriends (studentID, school) {
    return Student.find({
        school,
        $or: [{'prefer.first': studentID},
            {'prefer.second': studentID},
            {'prefer.third': studentID}]
    }).then(students => {
        return Promise.all(_.map(students, student => {
            _.forIn(student.prefer, (value, key) => {
                if (value === studentID) {
                    student.prefer[key] = null;
                }
            });

            swapPreferences(student);
            return student.save();
        }))
    })
}

function swapPreferences (student) {
    if (student.prefer.second && !student.prefer.first) {
        student.prefer.first = student.prefer.second;
        student.prefer.second = null;
    }
    if (student.prefer.third && !student.prefer.second) {
        student.prefer.second = student.prefer.third;
        student.prefer.third = null;
    }
    if (student.prefer.second && !student.prefer.first) {
        student.prefer.first = student.prefer.second;
        student.prefer.second = null;
    }
}