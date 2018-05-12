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
        return classes;
    },
    crossoverFunction: (classesA, classesB) => {
        return [classesA, classesB];
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
    /*
     _.times(10, () => {
     algorithm.evolve();
     console.log(algorithm.bestScore());
     });*/

    //console.log(algorithm.bestScore());

    return algorithm;
};

//console.log(JSON.stringify(algorithm.best()));
