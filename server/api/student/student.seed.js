import School from '../school/school.model.js';

export default {
    dependencies: [School],
    seed: (schools) => [{
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
    }]
}
