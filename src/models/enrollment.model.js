const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const enrollmentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User là bắt buộc'],
            index: true,
        },

        cohortId: {
            type: Schema.Types.ObjectId,
            ref: 'Cohort',
            default: null,      // null với self_paced
            index: true,
        },

        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Khóa học là bắt buộc'],
            index: true,
        },

        // Phân biệt 2 loại để query và xử lý khác nhau
        deliveryMode: {
            type: String,
            enum: ['self_paced', 'instructor_led'],
            required: true,
        },

        status: {
            type: String,
            enum: {
                values: ['active', 'completed', 'dropped', 'deferred'],
                message: 'Status phải là active | completed | dropped | deferred',
            },
            default: 'active',
            index: true,
        },

        amountPaid: { type: Number, min: 0, default: 0 },
        paymentStatus: {
            type: String,
            enum: ['pending', 'partial', 'paid', 'refunded'],
            default: 'pending',
            index: true,
        },

        completedAt: { type: Date, default: null },
        droppedAt: { type: Date, default: null },
        dropReason: { type: String, trim: true, default: '' },
        startedAt: { type: Date, default: null },
        lastAccessedAt: { type: Date, default: null },
        expiresAt: { type: Date, default: null },
        progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// self_paced: user chỉ enroll 1 lần cho mỗi course (cohortId = null)
enrollmentSchema.index(
    { userId: 1, courseId: 1 },
    {
        unique: true,
        partialFilterExpression: { deliveryMode: 'self_paced' },
        name: 'unique_self_paced_enrollment',
    }
);

// instructor_led: user chỉ enroll 1 lần cho mỗi cohort
enrollmentSchema.index(
    { userId: 1, cohortId: 1 },
    {
        unique: true,
        partialFilterExpression: { deliveryMode: 'instructor_led' },
        sparse: true,   // bỏ qua document có cohortId = null
        name: 'unique_instructor_led_enrollment',
    }
);

enrollmentSchema.index({ cohortId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });
enrollmentSchema.index({ createdAt: -1 });

enrollmentSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === 'completed' && !this.completedAt) {
            this.completedAt = new Date();
        }
        if (this.status === 'dropped' && !this.droppedAt) {
            this.droppedAt = new Date();
        }
    }
    next();
});

enrollmentSchema.plugin(toJSON);
enrollmentSchema.plugin(paginate);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;