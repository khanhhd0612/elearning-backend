const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const installmentSchema = new Schema(
    {
        dueDate: { type: Date, required: true },
        amount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ['pending', 'paid', 'overdue'],
            default: 'pending',
        },
        paidAt: { type: Date, default: null },
    },
    { _id: true }
);

const financingOptionSchema = new Schema(
    {
        enrollmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Enrollment',
            required: [true, 'Enrollment là bắt buộc'],
            unique: true, // 1 enrollment chỉ có 1 financing option
            index: true,
        },

        type: {
            type: String,
            enum: {
                values: ['full', 'installment', 'scholarship', 'isa'],
                message: 'Type phải là full | installment | scholarship | isa',
                // tra thang - tra gop - hoc bong - tra sau khi co viec lam
            },
            required: [true, 'Loại thanh toán là bắt buộc'],
            index: true,
        },

        totalAmount: {
            type: Number,
            required: [true, 'Tổng tiền là bắt buộc'],
            min: [0, 'Tổng tiền không hợp lệ'],
        },

        // Số tiền đã thanh toán thực tế
        paidAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        status: {
            type: String,
            enum: {
                values: ['pending', 'active', 'completed', 'defaulted', 'cancelled'],
                message: 'Status phải là pending | active | completed | defaulted | cancelled',
            },
            default: 'pending',
            index: true,
        },

        //dùng cho trả góp
        installments: {
            type: [installmentSchema],
            default: [],
        },

        // dùng cho học bổng
        scholarshipCode: { type: String, trim: true, default: '' },
        discountAmount: { type: Number, default: 0, min: 0 },
        discountPercentage: { type: Number, default: 0, min: 0, max: 100 },

        // dung cho tra sau khi co viec lam
        isaPercentage: { type: Number, default: 0, min: 0, max: 100 }, // % thu nhập
        isaDurationMonths: { type: Number, default: 0, min: 0 },        // số tháng thu
        isaStartDate: { type: Date, default: null },

        // Nhà cung cấp tài chính (bên thứ 3) nếu có
        provider: { type: String, trim: true, default: '' },

        notes: { type: String, trim: true, default: '' },
    },
    {
        timestamps: true,
    }
);

financingOptionSchema.index({ status: 1 });
financingOptionSchema.index({ type: 1, status: 1 });

financingOptionSchema.virtual('remainingAmount').get(function () {
    return Math.max(0, this.totalAmount - this.paidAmount);
});

financingOptionSchema.virtual('nextInstallment').get(function () {
    if (this.type !== 'installment') return null;
    return this.installments.find((i) => i.status === 'pending') || null;
});

financingOptionSchema.pre('save', function (next) {
    if (this.isModified('paidAmount')) {
        if (this.paidAmount >= this.totalAmount && this.status === 'active') {
            this.status = 'completed';
        }
    }
    next();
});

financingOptionSchema.plugin(toJSON);
financingOptionSchema.plugin(paginate);

const FinancingOption = mongoose.model('FinancingOption', financingOptionSchema);
module.exports = FinancingOption;