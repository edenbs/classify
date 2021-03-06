const {students, maxStudents} = JSON.parse(process.env.CLASSIFY_PARAMS);
const _ = require('lodash');
const sd = require('standard-deviation');

const types = {
    grade: {
        all: _.meanBy(students, 'avgGrade'),
        field: 'avgGrade',
        DIFF_THRESHOLD: 2,
        DIFF_PENALTY_FACTOR: 0.1,
        DEVIATION_PENALTY_FACTOR: 0.2
    },
    social: {
        all: _.meanBy(students, 'social'),
        field: 'social',
        DIFF_THRESHOLD: 0.1,
        DIFF_PENALTY_FACTOR: 2,
        DEVIATION_PENALTY_FACTOR: 2
    }
};

const girlsInStudentsRatio = _.filter(students, {gender: 'female'}).length / students.length;
const GENDER_DIFF_THRESHOLD = 0.03;
const GENDER_DIFF_PENALTY_FACTOR = 1.5;

const getFitness = (classes, type) => {
    // Difference between each class' average grade to global average grade
    const classesAvgGradesDiffFromAll = classes.map(c => Math.abs(type.all - _.meanBy(c.students, type.field)));

    // Ex: Difference of 1.5 would go unpunished, a difference of 3 bears a penalty of 0.1 ((3 - THRESHOLD) / 10)
    const avgGradePenalties = classesAvgGradesDiffFromAll.map(grade => grade <= type.DIFF_THRESHOLD ? 0 : (grade - type.DIFF_THRESHOLD) * type.DIFF_PENALTY_FACTOR);
    const avgGradeFitness = _.sum(avgGradePenalties) > 1 ? 0 : 1 - _.sum(avgGradePenalties);
/*
    console.log('====== Grades');
    console.log('All: ', type.all);
    console.log('Diffs from all: ', classesAvgGradesDiffFromAll);
    console.log('Penalties: ', avgGradePenalties);
    console.log('Fitness: ' + avgGradeFitness);
*/
    // Calculate the deviation of the students' grades in each class
    // (In order to learn if students are divided the same way around the mean in all classes)
    const classesGradesDeviations = classes.map(c => sd(_.map(c.students, type.field)));

    // Calculate the deviation of the classes' grades' deviations in order to learn if the current division is fitted
    const classesGradesDeviationDifference = sd(classesGradesDeviations);

    // Represent the students' grades deviation of each class in array, then calculate the deviations of these
    // values and multiple by GRADE_DEVIATION_FACTOR,
    // calculate 1 - the result in order to get how fitted the arrangement is (little deviation means better results)
    // [ 18.11874413111706, 19.503390018717827, 19.3416361481879 ] -> 0.6181399908054543 -> 0.8763720018389092
    // [ 18.65252440466616, 12.398207755782911, 19.08777968579199 ] -> 3.0560740339892782 -> 0.38878519320214433
    let gradesDeviationFitness = 1 - classesGradesDeviationDifference * type.DEVIATION_PENALTY_FACTOR;
    gradesDeviationFitness = gradesDeviationFitness < 0 ? 0 : gradesDeviationFitness;
/*
    console.log('====== Grades Deviations');
    console.log('Classes Grades Deviations: ', classesGradesDeviations);
    console.log('Classes Deviation Difference: ', classesGradesDeviationDifference);
    console.log('Deviation Fitness: ' + gradesDeviationFitness);
*/
    return avgGradeFitness * 0.6 + gradesDeviationFitness * 0.4;
};

const getGenderRatioFitness = classes => {
    const girlsRatioInClasses = _.map(classes, c => {
        return _.filter(c.students, {gender: 'female'}).length / c.students.length;
    });
    const girlsRatioDiff = _.map(girlsRatioInClasses, ratioInClass => Math.abs(girlsInStudentsRatio - ratioInClass));
    const genderRatioPenalties = _.map(girlsRatioDiff, diff => {
        return diff < GENDER_DIFF_THRESHOLD ? 0 : (diff - GENDER_DIFF_THRESHOLD) * GENDER_DIFF_PENALTY_FACTOR;
    });
    const fitness =  _.sum(genderRatioPenalties) > 1 ? 0 : 1 - _.sum(genderRatioPenalties);
/*
    console.log('====== Gender');
    console.log('Female/Students: ', girlsInStudentsRatio);
    console.log('Female/Students in classes: ', girlsRatioInClasses);
    console.log('Diff: ', girlsRatioDiff);
    console.log('Penalties: ', genderRatioPenalties);
    console.log('Fitness: ' + fitness);
*/
    return fitness;
} ;

const getClassesFitness = classes => {
    const gradeFitness = getFitness(classes, types['grade']);
    const socialFitness = getFitness(classes, types['social']);
    const genderRatioFitness = getGenderRatioFitness(classes);

    return gradeFitness * 0.55 + socialFitness * 0.35 + genderRatioFitness * 0.1;
};

const getPrefersSuccessCount = classes => {
    const prefersCountInClasses = _.map(classes, c => {
        return _.map(c.students, student => {
            const prefers = [student.prefer.first, student.prefer.second, student.prefer.third];

            return _.filter(prefers, prefer => {
                return !!_.find(c.students, {id: prefer});
            }).length;
        });
    });

    return _.filter(_.flatten(prefersCountInClasses), c => c > 0).length;
};

module.exports = {
    getClassesFitness,
    getPrefersSuccessCount,
    fitnessFunction: classes => {
        const preferCount = getPrefersSuccessCount(classes);
        // Percent to give a higher score then normal (the last 10% will get a higher score bump)
        const percent = 0.1;
        // The first part of the students (The first 90 out of 100 students will get a normal fitness)
        const bigPart = students.length * (1 - percent);
        // The first part of the students (The last 10 out of 100 students will get a fitness bump)
        const smallPart = students.length * percent;
        // The percentage of students of the first part (if 90 or more students, will get full fitness which is 0.6, otherwise will get only a part.)
        const bigPartPercent = Math.min(bigPart, preferCount) / bigPart;
        // The percentage of students of the second part (if more then 90 students, each extra student will get a big fitness bump, overall 0.4 of the total fitness)
        const smallPartPercent = Math.max((preferCount - bigPart) / smallPart, 0);
        // The final fitness
        // Examples
        // 45 students got their prefers = 0.5 * 0.6 = 0.3
        // 90 students got their prefers = 1 * 0.6 = 0.6
        // 95 students got their prefers = 1 * 0.6 + 0.5 * 0.4 = 0.8
        const preferFitness = bigPartPercent * 0.6 + smallPartPercent * 0.4;

        return getClassesFitness(classes) * 0.5 + preferFitness * 0.5;
    }
};
