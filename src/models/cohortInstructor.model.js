const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON } = require('./plugins');

const cohortInstructorSchema = new Schema(
    {
        cohortId: {
            type: Schema.Types.ObjectId,
            ref: 'Cohort',
            required: true,
            index: true,
        },

        instructorId: {
            type: Schema.Types.ObjectId,
            ref: 'Instructor',
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: {
                values: ['lead', 'assistant', 'guest'],
                message: 'Role phải là lead | assistant | guest',
            },
            default: 'assistant',
        },
    },
    { timestamps: true }
);

// Mỗi instructor chỉ xuất hiện 1 lần trong 1 cohort
cohortInstructorSchema.index(
    { cohortId: 1, instructorId: 1 },
    { unique: true }
);

// Mỗi cohort chỉ có 1 lead
cohortInstructorSchema.index(
    { cohortId: 1, role: 1 },
    {
        unique: true,
        partialFilterExpression: { role: 'lead' },
    }
);

cohortInstructorSchema.plugin(toJSON);

const CohortInstructor = mongoose.model('CohortInstructor', cohortInstructorSchema);
module.exports = CohortInstructor;