const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');
const clearPatterns = require('../utils/clearPatterns');

const cohortSchema = new Schema(
    {
        courseFormatId: {
            type: Schema.Types.ObjectId,
            ref: 'CourseFormat',
            required: [true, 'Format là bắt buộc'],
            index: true,
        },

        name: {
            type: String,
            required: [true, 'Tên cohort là bắt buộc'],
            trim: true,
            maxlength: [100, 'Tên cohort không quá 100 ký tự'],
        },

        startDate: {
            type: Date,
            required: [true, 'Ngày khai giảng là bắt buộc'],
        },

        endDate: {
            type: Date,
            required: [true, 'Ngày kết thúc là bắt buộc'],
        },

        status: {
            type: String,
            enum: {
                values: ['upcoming', 'ongoing', 'completed', 'cancelled'],
                message: 'Status phải là upcoming | ongoing | completed | cancelled',
            },
            default: 'upcoming',
            index: true,
        },

        zoomLink: { type: String, trim: true, default: '' },
        // Số học viên tối đa — lấy từ format detail nhưng cho phép override
        maxSeats: {
            type: Number,
            min: [1, 'Số ghế phải >= 1'],
            default: null, // null = lấy từ format detail
        },

        cancelReason: { type: String, trim: true, default: '' },
    },
    {
        timestamps: true,
    }
);

cohortSchema.index({ courseFormatId: 1, status: 1 });
cohortSchema.index({ startDate: 1 });
cohortSchema.index({ status: 1, startDate: 1 });

cohortSchema.virtual('enrollmentCount', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'cohortId',
    count: true, // chỉ đếm
});

cohortSchema.virtual('instructors', {
    ref: 'CohortInstructor',
    localField: '_id',
    foreignField: 'cohortId',
});

// validate startDate < endDate
cohortSchema.pre('save', function (next) {
    if (this.startDate >= this.endDate) {
        return next(new Error('Ngày kết thúc phải sau ngày khai giảng'));
    }
    next();
});

cohortSchema.plugin(toJSON);
cohortSchema.plugin(paginate);

const clearCohortCache = clearPatterns(
    '__express__/v1/cohorts*',
    '__express__/v1/course-formats*'
);

cohortSchema.post('save', clearCohortCache);
cohortSchema.post('insertMany', clearCohortCache);
cohortSchema.post('findOneAndUpdate', clearCohortCache);
cohortSchema.post('findOneAndDelete', clearCohortCache);
cohortSchema.post('deleteOne', clearCohortCache);
cohortSchema.post('updateMany', clearCohortCache);

const Cohort = mongoose.model('Cohort', cohortSchema);
module.exports = Cohort;