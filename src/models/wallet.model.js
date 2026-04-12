const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const walletSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },

        balance: {
            type: Number,
            default: 0,
            min: [0, 'Số dư không hợp lệ'],
        },

        totalTopup: { type: Number, default: 0 }, // tổng đã nạp — audit
        totalSpent: { type: Number, default: 0 }, // tổng đã chi — audit

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    { timestamps: true }
);

walletSchema.plugin(toJSON);
const Wallet = mongoose.model('Wallet', walletSchema);

const walletTransactionSchema = new Schema(
    {
        walletId: {
            type: Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true,
            index: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ['topup', 'purchase', 'refund'],
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: [1000, 'Số tiền tối thiểu là 1.000 VND'],
        },

        // Snapshot số dư — dùng để audit, không cần tính lại
        balanceBefore: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },

        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
            index: true,
        },

        gateway: {
            type: String,
            enum: ['vnpay', 'vietqr', 'manual'],
            required: true,
        },

        // Mã giao dịch từ cổng — dùng để chống idempotency
        gatewayRef: {
            type: String,
            default: null,
            sparse: true, // null không bị count vào unique
        },

        // Nếu type = purchase
        enrollmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Enrollment',
            default: null,
        },

        // Nội dung chuyển khoản (VietQR)
        transferContent: { type: String, default: '' },

        // Raw data từ webhook — lưu để debug
        metadata: { type: Schema.Types.Mixed, default: {} },

        note: { type: String, trim: true, default: '' },
    },
    { timestamps: true }
);

// gatewayRef unique — tránh cộng tiền 2 lần từ cùng 1 giao dịch
walletTransactionSchema.index(
    { gatewayRef: 1 },
    { unique: true, sparse: true }
);
walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1, status: 1 });

walletTransactionSchema.plugin(toJSON);
walletTransactionSchema.plugin(paginate);

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

module.exports = {
    Wallet,
    WalletTransaction
};