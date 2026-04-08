const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const callLogSchema = new Schema(
    {
        calledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        calledAt: { type: Date, default: Date.now },
        notes: { type: String, trim: true, default: '' },
        // Kết quả cuộc gọi
        outcome: {
            type: String,
            enum: ['reached', 'no_answer', 'rescheduled'],
            required: true,
        },
        // Nếu rescheduled → lưu thời gian gọi lại
        rescheduleAt: { type: Date, default: null },
    },
    { _id: true }
);

const interviewLogSchema = new Schema(
    {
        interviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        interviewedAt: { type: Date, default: Date.now },
        notes: { type: String, trim: true, default: '' },
        score: { type: Number, min: 0, max: 10, default: null }, // tùy chọn chấm điểm
        recommendation: {
            type: String,
            enum: ['approve', 'reject', 'consider'],
            required: true,
        },
    },
    { _id: true }
);

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

        motivation: {
            type: String,
            required: [true, 'Vui lòng cho biết lý do bạn muốn tham gia'],
            trim: true,
            minlength: [50, 'Lý do phải có ít nhất 50 ký tự'],
            maxlength: [2000, 'Lý do không quá 2000 ký tự'],
        },

        status: {
            type: String,
            enum: {
                values: ['pending', 'called', 'interviewed', 'approved', 'rejected'],
                message: 'Status không hợp lệ',
            },
            default: 'pending',
            index: true,
        },

        callLogs: {
            type: [callLogSchema],
            default: [],
        },

        assignedCounselor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true,
        },

        interviewLog: {
            type: interviewLogSchema,
            default: null,
        },

        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        reviewedAt: { type: Date, default: null },
        rejectionReason: { type: String, trim: true, default: '' },
    },
    { timestamps: true }
);

// Mỗi user chỉ gửi 1 request cho mỗi cohort
enrollmentRequestSchema.index(
    { cohortId: 1, userId: 1 },
    { unique: true }
);

enrollmentRequestSchema.plugin(toJSON);
enrollmentRequestSchema.plugin(paginate);

const EnrollmentRequest = mongoose.model('EnrollmentRequest', enrollmentRequestSchema);
module.exports = EnrollmentRequest;