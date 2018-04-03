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
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }],
    avgGrade: {
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

        this.avgGrade = _.meanBy(this.students, 'avgGrade');
        this.genders = {
            male: genders.male || 0,
            female: genders.female || 0
        };
    })
});

export default createSeedModel('Class', classSchema, seed);

