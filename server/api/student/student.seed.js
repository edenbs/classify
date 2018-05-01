import School from '../school/school.model.js';
import _ from 'lodash';
import random_name from 'node-random-name';
const TIMES = 45;
const students = _.times(TIMES);

export default {
    dependencies: [School],
    seed: (schools) =>
        _.times(TIMES, i => {
            const name = random_name({seed: Math.random()}).split(' ');
            const first = _.sample(_.without(students, i));
            const second = _.sample(_.without(students, i, first));
            const third = _.sample(_.without(students, i, first, second));
            const pad = n => n.toString().padLeft(9, '0');

            return {
                id: pad(i),
                name: {
                    first: name[0],
                    last: name[1]
                },
                school: schools[1],
                gender: ['male', 'female'][_.random(0, 1)],
                avgGrade: _.random(60, 100),
                prefer: {
                    first: pad(first),
                    second: pad(second),
                    third: pad(third)
                },
                social: _.random(1, 4)
            }
        }).concat([{
        id: '313562894',
        name: {
            first: 'Eden',
            last: 'Bens'
        },
        school: schools[0],
        gender: 'female',
        avgGrade: 100,
        prefer: {'first':'204773584',
                'second':'205634645'},
        social: 3
    }, {
        id: '204773584',
        name: {
            first: 'Dana',
            last: 'Tsirulnik'
        },
        school: schools[0],
        gender: 'female',
        avgGrade: 100,
        prefer: {'first':'205634645',
                'second':'313562894'},
        social: 4
    },{
        id: '205634645',
        name: {
            first: 'Noy',
            last: 'Y'
        },
        school: schools[0],
        gender: 'female',
        avgGrade: 100,
        prefer: {'first':'313562894',
                    'second':'123456789'},
        social: 3
    }, {
        id: '123456789',
        name: {
            first: 'Cristiano',
            last: 'Ronaldo'
        },
        school: schools[0],
        gender: 'male',
        avgGrade: 85,
        prefer: {'first':'313562894',
            'second':'123456789'},
        social: 1
    },{
        id: '312497720',
        name: {
            first: 'Bar',
            last: 'Leiman'
        },
        school: schools[0],
        gender: 'female',
        avgGrade: 92,
        prefer: {'first':'313562894',
            'second':'123456789'},
        social: 4
    },{
        id: '312526285',
        name: {
            first: 'Danielle',
            last: 'Zror'
        },
        school: schools[0],
        gender: 'female',
        avgGrade: 96,
        prefer: {'first':'313562894',
            'second':'123456789'},
        social: 4
    }])
}
