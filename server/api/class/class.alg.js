const _ = require('lodash');
const {students, maxStudents} = JSON.parse(process.env.CLASSIFY_PARAMS);

const numClasses = Math.ceil(students.length / maxStudents);
const studentsPerClass = Math.ceil(students.length / numClasses);
const classes = _.times(numClasses, i => ({
    index: i + 1,
    students: _.slice(students, studentsPerClass * i, studentsPerClass * (i + 1)).map(s => s._id)
}));


console.log(JSON.stringify(classes));
