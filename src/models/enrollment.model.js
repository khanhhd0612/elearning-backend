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
            required: [true, 'Cohort là bắt buộc'],
            index: true,
        },

        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Khóa học là bắt buộc'],
            index: true,
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

        amountPaid: {
            type: Number,
            min: [0, 'Số tiền không hợp lệ'],
            default: 0,
        },

        paymentStatus: {
            type: String,
            enum: {
                values: ['pending', 'partial', 'paid', 'refunded'],
                message: 'paymentStatus phải là pending | partial | paid | refunded',
            },
            default: 'pending',
            index: true,
        },

        // Thời điểm hoàn thành hoặc bỏ học
        completedAt: {
            type: Date,
            default: null,
        },

        droppedAt: {
            type: Date,
            default: null,
        },

        // Lý do bỏ học
        dropReason: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

enrollmentSchema.index(
    { userId: 1, cohortId: 1 },
    { unique: true }
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