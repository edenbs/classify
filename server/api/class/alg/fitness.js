const {students, maxStudents} = JSON.parse(process.env.CLASSIFY_PARAMS);
const _ = require('lodash');
const sd = require('standard-deviation');

const GRADE_DIFF_THRESHOLD = 2;
const GRADE_DEVIATION_FACTOR = 0.2;

const all = {
    avgGrade: _.meanBy(students, 'avgGrade')
};

const getGradesFitness = classes => {
    // Difference between each class' average grade to global average grade
    const classesAvgGradesDiffFromAll = classes.map(c => Math.abs(all.avgGrade - _.meanBy(c.students, 'avgGrade')));

    // Ex: Difference of 1.5 would go unpunished, a difference of 3 bears a penalty of 0.1 ((3 - THRESHOLD) / 10)
    const avgGradePenalties = classesAvgGradesDiffFromAll.map(grade => grade <= GRADE_DIFF_THRESHOLD ? 0 : (grade - GRADE_DIFF_THRESHOLD) / 10);
    const avgGradeFitness = _.sum(avgGradePenalties) > 1 ? 0 : 1 - _.sum(avgGradePenalties);

    console.log('====== Grades');
    console.log('All: ', all.avgGrade);
    console.log('Diffs from all: ', classesAvgGradesDiffFromAll);
    console.log('Penalties: ', avgGradePenalties);
    console.log('Fitness: ' + avgGradeFitness);

    // Calculate the deviation of the students' grades in each class
    // (In order to learn if students are divided the same way around the mean in all classes)
    const classesGradesDeviations = classes.map(c => sd(_.map(c.students, 'avgGrade')));

    // Calculate the deviation of the classes' grades' deviations in order to learn if the current division is fitted
    const classesGradesDeviationDifference = sd(classesGradesDeviations);

    // Represent the students' grades deviation of each class in array, then calculate the deviations of these
    // values and multiple by GRADE_DEVIATION_FACTOR,
    // calculate 1 - the result in order to get how fitted the arrangement is (little deviation means better results)
    // [ 18.11874413111706, 19.503390018717827, 19.3416361481879 ] -> 0.6181399908054543 -> 0.8763720018389092
    // [ 18.65252440466616, 12.398207755782911, 19.08777968579199 ] -> 3.0560740339892782 -> 0.38878519320214433
    let gradesDeviationFitness = 1 - classesGradesDeviationDifference * GRADE_DEVIATION_FACTOR;
    gradesDeviationFitness = gradesDeviationFitness < 0 ? 0 : gradesDeviationFitness;

    console.log('====== Grades Deviations');
    console.log('Classes Grades Deviations: ', classesGradesDeviations);
    console.log('Classes Deviation Difference: ', classesGradesDeviationDifference);
    console.log('Deviation Fitness: ' + gradesDeviationFitness);

    return avgGradeFitness * 0.6 + gradesDeviationFitness * 0.4;
};

module.exports = classes => {
    const gradeFitness = getGradesFitness(classes);
    return gradeFitness;
};