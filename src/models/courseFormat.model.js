const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const oncampusDetailSchema = new Schema(
    {
        campusId: {
            type: Schema.Types.ObjectId,
            ref: 'Campus',
            required: [true, 'Campus là bắt buộc'],
        },
        hoursPerWeek: { type: Number, required: true, min: 1 },
        schedule: { type: String, trim: true },   // vd: "Thứ 2-6, 8h-12h"
        maxSeats: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const onlineDetailSchema = new Schema(
    {
        totalVideos: { type: Number, min: 0, default: 0 },
        totalHours: { type: Number, min: 0, default: 0 },
        platform: { type: String, trim: true },   // vd: "Udemy", "LMS nội bộ"
        hasLifetimeAccess: { type: Boolean, default: false },
        hasCertificate: { type: Boolean, default: true },
    },
    { _id: false }
);

const remoteDetailSchema = new Schema(
    {
        timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
        zoomLink: { type: String, trim: true },
        hoursPerWeek: { type: Number, required: true, min: 1 },
        schedule: { type: String, trim: true },
        maxSeats: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const hybridDetailSchema = new Schema(
    {
        campusId: {
            type: Schema.Types.ObjectId,
            ref: 'Campus',
            required: [true, 'Campus là bắt buộc'],
        },
        oncampusHours: { type: Number, required: true, min: 0 },
        remoteHours: { type: Number, required: true, min: 0 },
        onlineHours: { type: Number, default: 0, min: 0 },
        schedule: { type: String, trim: true },
        maxSeats: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const courseFormatSchema = new Schema(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Khóa học là bắt buộc'],
            index: true,
        },

        formatType: {
            type: String,
            enum: {
                values: ['oncampus', 'online', 'remote', 'hybrid'],
                message: 'Format phải là oncampus | online | remote | hybrid',
            },
            required: [true, 'Loại hình học là bắt buộc'],
            index: true,
        },

        priceOverride: {
            type: Number,
            min: [0, 'Giá không hợp lệ'],
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        // Detail fields — chỉ một trong 4 field này có giá trị tùy formatType
        oncampusDetail: { type: oncampusDetailSchema, default: null },
        onlineDetail: { type: onlineDetailSchema, default: null },
        remoteDetail: { type: remoteDetailSchema, default: null },
        hybridDetail: { type: hybridDetailSchema, default: null },
    },
    {
        timestamps: true,
    }
);

// chỉ có 1 format mỗi loại (không tạo 2 online cho 1 course)
courseFormatSchema.index(
    { courseId: 1, formatType: 1 },
    { unique: true, name: 'unique_course_format' }
);
courseFormatSchema.index({ courseId: 1, isActive: 1 });

// Trả priceOverride nếu có, ngược lại populate từ course.basePrice
courseFormatSchema.virtual('effectivePrice').get(function () {
    return this.priceOverride ?? this.courseId?.basePrice ?? null;
});

//detail — shortcut trỏ về đúng sub-schema
courseFormatSchema.virtual('detail').get(function () {
    const map = {
        oncampus: this.oncampusDetail,
        online: this.onlineDetail,
        remote: this.remoteDetail,
        hybrid: this.hybridDetail,
    };
    return map[this.formatType] ?? null;
});

//validate detail tương ứng formatType
courseFormatSchema.pre('save', function (next) {
    const requiredDetail = `${this.formatType}Detail`;
    if (!this[requiredDetail]) {
        return next(
            new Error(`Thiếu ${requiredDetail} cho format type "${this.formatType}"`)
        );
    }

    // Xóa các detail không liên quan để tránh lưu rác
    const allDetails = ['oncampusDetail', 'onlineDetail', 'remoteDetail', 'hybridDetail'];
    allDetails
        .filter((d) => d !== requiredDetail)
        .forEach((d) => { this[d] = null; });

    next();
});

courseFormatSchema.plugin(toJSON);
courseFormatSchema.plugin(paginate);

const CourseFormat = mongoose.model('CourseFormat', courseFormatSchema);

module.exports = CourseFormat;
