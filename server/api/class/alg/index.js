const GeneticAlgorithm = require('geneticalgorithm');
const _ = require('lodash');
const fitnessFunction = require('./fitness.js');

const {students, maxStudents} = JSON.parse(process.env.CLASSIFY_PARAMS);
const numClasses = Math.ceil(students.length / maxStudents);
const studentsPerClass = Math.ceil(students.length / numClasses);

const firstClasses = _.times(numClasses, i => ({
    index: i + 1,
    students: _.slice(students, studentsPerClass * i, studentsPerClass * (i + 1))
}));

console.log(fitnessFunction(firstClasses));

const config = {
    mutationFunction: classes => {
        classes = _.shuffle(classes);

        if (_.random(10) < 3) {
            const maxClass = _.maxBy(classes, c => c.students.length);
            const minClass = _.minBy(_.without(classes, maxClass), c => c.students.length);

            const student = _.sample(maxClass.students);
            _.pull(maxClass.students, student);
            minClass.students.push(student);
        }
        else {
            const firstClass = _.sample(classes);
            const secondClass = _.sample(_.without(classes, firstClass));
            const firstStudent = _.sample(firstClass.students);
            const secondStudent = _.sample(secondClass.students);

            _.pull(firstClass.students, firstStudent);
            _.pull(secondClass.students, secondStudent);
            firstClass.students.push(secondStudent);
            secondClass.students.push(firstStudent);
        }

        return classes;
    },
    crossoverFunction: (classesA, classesB) => {
        const firstHalf = _.slice(students, 0, Math.floor(students.length / 2));
        const secondHalf = _.slice(students, Math.floor(students.length / 2), students.length);
        const classes = _.cloneDeep(classesA);
        _.each(classes, c => c.students = []);

        _.each([firstHalf, secondHalf], (half, i) => {
            const arrangement = i === 0 ? classesA : classesB;

            _.each(half, student => {
                const _class = _.find(arrangement, c => {
                    return !!_.find(c.students, {id: student.id});
                });

                const classToPutIn = _.find(classes, {index: _class.index});
                classToPutIn.students.push(student);
            });
        });

        _.each(classes, c => {
            while (c.students.length > studentsPerClass) {
                const minClass = _.minBy(classes, c => c.students.length);

                const student = _.sample(c.students);
                _.pull(c.students, student);
                minClass.students.push(student);
            }
        });

        return [classes];
    },
    fitnessFunction,
    doesABeatBFunction: (classesA, classesB) => {
        const DIVERSITY = 0;
        const fitnessA = fitnessFunction(classesA);
        const fitnessB = fitnessFunction(classesB);

        return Math.abs(fitnessA - fitnessB) > DIVERSITY ? fitnessA - fitnessB > 0 : false;
    },
    population: [firstClasses],
    populationSize: 100
};

module.exports = function () {
    const algorithm = GeneticAlgorithm(config);
    /*console.log(algorithm.bestScore());
    _.times(30, () => {
        console.log('======');
        algorithm.evolve();
        console.log(algorithm.bestScore());
    });*/

    /*
     _.times(10, () => {
     algorithm.evolve();
     console.log(algorithm.bestScore());
     });*/

    //console.log(algorithm.bestScore());

    return algorithm;
};

//console.log(JSON.stringify(algorithm.best()));
