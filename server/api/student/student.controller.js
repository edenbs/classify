import Student from './student.model.js';
import createError from 'http-errors';
import _ from 'lodash';

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

    if (req.query.class) {
        query['class'] = req.query.class;
    }

    return Student.paginate(query, req.query);
}

export function create (req) {
    const data = _.pick(req.body, ['id', 'name', 'class', 'gender', 'avgGrade','social','prefer']);

    data.school = req.user.school;

    return new Student(data).save()
        .then(errorIfEmpty)
        .then(_.noop);
}

export function update(req) {
    var data = _.pick(req.body, ['name', 'class', 'gender', 'avgGrade','social','prefer']);

    return Student.findById(req.params.id)
        .then(errorIfEmpty)
        .then(student => errorIfNotSchool(student, req.user.school))
        .then(student => student.set(data).save())
        .then(_.noop);
}

export function remove (req) {
    return Student.findById(req.params.id)
        .then(errorIfEmpty)
        .then(student => errorIfNotSchool(student, req.user.school))
        .then(student => student.remove())
        .then(_.noop);
}

export function loadExcel(req){
    var XLS = require('xlsjs');
    var result = {};
    result.error = {};
    var records =[];

    try {
        var path = req.files.file.path;
        var workbook = XLS.readFile(path);

        workbook.SheetNames.forEach(function (sheetName) {
            var roa = XLS.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            if (roa.length > 0) {
                result[sheetName] = roa;
            }

            roa.forEach(function (newStd) {
                var convertStd = convertStudent(newStd);
                records.push(convertStd);
                 //saveStudent(req, convertStd);
            });
        });
    }
    catch (err){
        result['error'] = err;
    };

    return Promise.all(records.map(stdRec => saveStudent(req, stdRec))).then(_.noop);
};

function convertStudent(exlStd) {
    var newStd;

    //name conversion
    newStd = exlStd;
    newStd.name={};
    newStd.name.first = exlStd.firstname;
    newStd.name.last = exlStd.lastname;

    //perforation conversion
    newStd.prefer = {};
    newStd.prefer.first = exlStd.first_prefer;
    newStd.prefer.second = exlStd.second_prefer;
    newStd.prefer.third = exlStd.third_prefer;

    return newStd;
};

function saveStudent (req,std) {
    //Check if student already exist
    Student.find({'id':std.id},function(err,existingUser) {
            if (existingUser.length) {
                const data = _.pick(std, ['id','name', 'class','gender', 'avgGrade','social','prefer']);
                /*TODO: change the key to id + school*/
                data.school = req.user.school;

                return Student.findOneAndUpdate({'id': std.id}, data)
                        .then(errorIfEmpty)
                        .then(student => errorIfNotSchool(student, req.user.school))
                        .then(_.noop);
            }
            else {
                const data = _.pick(std, ['id', 'name', 'class', 'gender', 'avgGrade', 'social', 'prefer']);
                data.school = req.user.school;

                return new Student(data).save().then(errorIfEmpty)
                    .then(_.noop);
            }
        });
};

export function searchStudent(reqs){
    const searchQuery = {school: reqs.user.school
        , $or:[{'name.first': {$regex: reqs.params.name, $options: 'i'}},
            {'name.last':{$regex: reqs.params.name, $options: 'i'}}]
    };


    const query = {
        sort: reqs.query.sort,
        limit: parseInt(reqs.query.limit),
        page: parseInt(reqs.query.page)};

    return Student.paginate(searchQuery,query);
};