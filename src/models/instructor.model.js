const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');
const clearPatterns = require('../utils/clearPatterns');

const instructorSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User là bắt buộc'],
            unique: true, // mỗi user chỉ có 1 hồ sơ instructor
            index: true,
        },

        campusId: {
            type: Schema.Types.ObjectId,
            ref: 'Campus',
            required: [true, 'Campus là bắt buộc'],
            index: true,
        },

        bio: {
            type: String,
            trim: true,
            default: '',
        },

        linkedinUrl: {
            type: String,
            trim: true,
            default: '',
        },

        // Các kỹ năng hiển thị trên profile
        expertise: {
            type: [String],
            default: [],
        },

        avatarUrl: {
            type: String,
            default: '',
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

instructorSchema.index({ campusId: 1, isActive: 1 });

instructorSchema.virtual('cohorts', {
    ref: 'CohortInstructor',
    localField: '_id',
    foreignField: 'instructorId',
});

instructorSchema.plugin(toJSON);
instructorSchema.plugin(paginate);

const clearInstructorCache = clearPatterns(
    '__express__/v1/instructors*',
    '__express__/v1/cohorts*'
);

instructorSchema.post('save', clearInstructorCache);
instructorSchema.post('findOneAndUpdate', clearInstructorCache);
instructorSchema.post('findOneAndDelete', clearInstructorCache);
instructorSchema.post('deleteOne', clearInstructorCache);

const Instructor = mongoose.model('Instructor', instructorSchema);
module.exports = Instructor;