const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const enrollmentRequestSchema = new Schema(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },

        cohortId: {
            type: Schema.Types.ObjectId,
            ref: 'Cohort',
            required: true,
            index: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // Lý do muốn tham gia
        motivation: {
            type: String,
            required: [true, 'Vui lòng cho biết lý do bạn muốn tham gia khóa học'],
            trim: true,
            minlength: [50, 'Lý do phải có ít nhất 50 ký tự'],
            maxlength: [2000, 'Lý do không quá 2000 ký tự'],
        },

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },

        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        // Lý do từ chối (nếu rejected)
        rejectionReason: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Mỗi user chỉ gửi 1 request pending cho mỗi cohort
enrollmentRequestSchema.index(
    { cohortId: 1, userId: 1 },
    { unique: true }
);

enrollmentRequestSchema.plugin(toJSON);
enrollmentRequestSchema.plugin(paginate);

const EnrollmentRequest = mongoose.model('EnrollmentRequest', enrollmentRequestSchema);
module.exports = EnrollmentRequest;