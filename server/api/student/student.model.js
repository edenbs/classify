import mongoose from 'mongoose';
import {createSeedModel} from 'mongoose-plugin-seed';
import seed from './student.seed';
import mongoosePaginate from 'mongoose-paginate';
import idvalidator from 'mongoose-id-validator';

const Schema = mongoose.Schema;

const genders = ['male', 'female'];

const studentSchema = new Schema({
    id: {
       type: String,
       required: true
    },
    name: {
        first: String,
        last: String
     },
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    gender: {
        enum: genders,
        type: String,
        lowercase: true,
        required: true
    },
    avgGrade: {
        type: Number,
        min: 0,
        max: 100
    },
    social: {
        type: Number,
        min: 1,
        max: 4
    },
    prefer: {
        first: {
            type: String
        },
        second: {
            type: String
        },
        third: {
            type: String
        }
    }
});

studentSchema.index( { "id": 1, "school": 1 }, { unique: true ,background: false } );

studentSchema.plugin(idvalidator);
studentSchema.plugin(mongoosePaginate);

var Students = module.exports =  createSeedModel('Student', studentSchema, seed);

Students.ensureIndexes({ "id": 1, "school": 1 },function (err) {
    if (err) console.log(err)
});

Students.on('index', function (err) {
    if (err) console.log(err)
});


