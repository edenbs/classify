import mongoose from 'mongoose';
import _ from 'lodash';
import {createSeedModel} from 'mongoose-plugin-seed';
import seed from './class.seed';

const Schema = mongoose.Schema;

const classSchema = new Schema({
   index: {
       type: Number,
       required: true,
       unique: true,
       min: 1
   },
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }],
    avgGrade: {
        type: Number,
        required: true
    },
    avgSocial: {
        type: Number,
        required: true
    },
    avgPrefers: {
        type: Number,
        required: true
    },
    genders: {
        male: {
            type: Number,
            required: true
        },
        female: {
            type: Number,
            required: true
        }
    }
});

classSchema.pre('validate', function() {
    return this.populate('students').execPopulate().then(() => {
        const genders = _.countBy(this.students, 'gender');

        this.avgPrefers = _.meanBy(this.students, s => {
            return Number(!!_.find(this.students, {id: s.prefer.first})) +
               Number(!!_.find(this.students, {id: s.prefer.second})) +
                Number(!!_.find(this.students, {id: s.prefer.third}));
        });
        this.avgSocial = _.meanBy(this.students, 'social');
        this.avgGrade = _.meanBy(this.students, 'avgGrade');
        this.genders = {
            male: genders.male || 0,
            female: genders.female || 0
        };
    })
});

export default createSeedModel('Class', classSchema, seed);

