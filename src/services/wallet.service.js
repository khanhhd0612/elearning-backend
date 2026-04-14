const crypto = require('crypto');
const { Wallet, WalletTransaction } = require('../models/wallet.model');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const qs = require('qs');
const FinancingOption = require('../models/financingOption.model');


const initWallet = async (userId) => {
    const exists = await Wallet.findOne({ userId });
    if (exists) return exists;
    return Wallet.create({ userId });
};

const getWallet = async (userId) => {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new ApiError(404, 'Ví chưa được khởi tạo');
    return wallet;
};

//Lịch sử giao dịch
const getTransactions = async (userId, filter = {}, options = {}) => {
    const wallet = await getWallet(userId);
    const mongoFilter = { walletId: wallet._id };
    if (filter.type) mongoFilter.type = filter.type;
    if (filter.status) mongoFilter.status = filter.status;

    return WalletTransaction.paginate(mongoFilter, {
        sortBy: 'createdAt:desc',
        limit: options.limit || 20,
        page: options.page || 1,
    });
};

// NẠP TIỀN — INITIATE

// Tạo transaction pending + trả về payment URL hoặc QR
const initiateTopup = async (userId, { amount, gateway }) => {
    const wallet = await getWallet(userId);

    if (!wallet.isActive) {
        throw new ApiError(400, 'Ví đã bị khóa');
    }

    // Tạo transaction pending trước
    const transaction = await WalletTransaction.create({
        walletId: wallet._id,
        userId,
        type: 'topup',
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance, // cập nhật sau khi webhook confirm
        status: 'pending',
        gateway,
        transferContent: gateway === 'vietqr' ? `NAPTIEN ${Date.now()}` : '',
    });

    if (gateway === 'vnpay') {
        const paymentUrl = buildVNPayUrl(transaction);
        return { gateway: 'vnpay', paymentUrl, transactionId: transaction._id };
    }

    if (gateway === 'vietqr') {
        const qrData = await buildVietQRCode(transaction);
        return { gateway: 'vietqr', qrData, transactionId: transaction._id, transferContent: transaction.transferContent };
    }
};

//Build VNPay URL
const buildVNPayUrl = (transaction) => {
    const vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: process.env.VNPAY_TMN_CODE,
        vnp_Amount: transaction.amount * 100,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: transaction._id.toString(),
        vnp_OrderInfo: `Nap tien vi ${transaction.userId}`,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: `${process.env.SERVER_URL}/v1/wallet/topup/vnpay/return`,
        vnp_IpnUrl: `${process.env.SERVER_URL}/v1/wallet/topup/vnpay/ipn`,
        vnp_CreateDate: new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14),
        vnp_BankCode: 'NCB'
    };

    const sortedParams = Object.keys(vnpParams)
        .sort()
        .reduce((acc, key) => {
            acc[key] = vnpParams[key];
            return acc;
        }, {});

    const signData = qs.stringify(sortedParams, { encode: false });

    const secureHash = crypto
        .createHmac('sha512', process.env.VNPAY_SECRET_KEY)
        .update(Buffer.from(signData, 'utf-8'))
        .digest('hex');

    const queryParams = qs.stringify(sortedParams, { encode: true });

    return `${process.env.VNPAY_URL}?${queryParams}&vnp_SecureHash=${secureHash}`;
};

//build VietQR code
const buildVietQRCode = async (transaction) => {
    const bank = process.env.BANK_CODE; // ví dụ: MB, VCB
    const accountNo = process.env.BANK_ACCOUNT_NO;

    const qrUrl = `https://img.vietqr.io/image/${bank}-${accountNo}-compact.png?amount=${transaction.amount}&addInfo=${transaction.transferContent}`;

    return qrUrl;

};

// WEBHOOK HANDLERS

// VNPay IPN
const handleVNPayIPN = async (query) => {
    const { vnp_SecureHash, vnp_ResponseCode, vnp_TxnRef, vnp_Amount, vnp_TransactionNo, ...rest } = query;

    // Verify chữ ký
    const signData = new URLSearchParams(
        Object.keys(rest).sort().reduce((acc, k) => { acc[k] = rest[k]; return acc; }, {})
    ).toString();

    const expectedHash = crypto
        .createHmac('sha512', process.env.VNPAY_SECRET_KEY)
        .update(signData)
        .digest('hex');

    if (expectedHash !== vnp_SecureHash) {
        logger.warn('[VNPay] Invalid signature');
        return { RspCode: '97', Message: 'Invalid signature' };
    }

    // Tìm transaction
    const transaction = await WalletTransaction.findById(vnp_TxnRef);
    if (!transaction) return { RspCode: '01', Message: 'Order not found' };

    // Idempotency — đã xử lý rồi
    if (transaction.status === 'completed') {
        return { RspCode: '02', Message: 'Order already confirmed' };
    }

    // Verify amount (VNPay gửi * 100)
    if (transaction.amount * 100 !== Number(vnp_Amount)) {
        logger.warn(`[VNPay] Amount mismatch: ${transaction.amount} vs ${vnp_Amount / 100}`);
        return { RspCode: '04', Message: 'Invalid amount' };
    }

    // Xử lý kết quả
    if (vnp_ResponseCode === '00') {
        await creditWallet(transaction, vnp_TransactionNo, query);
    } else {
        transaction.status = 'failed';
        transaction.metadata = query;
        await transaction.save();
    }

    return { RspCode: '00', Message: 'Confirm Success' };
};

// SePay Webhook
const handleSePay = async (body, headers) => {
    //Verify API key
    const apiKey = headers['authorization'];
    if (apiKey !== process.env.SEPAY_API_KEY) {
        throw new ApiError(401, 'Invalid API key');
    }

    // Chỉ xử lý tiền vào
    if (body.transferType !== 'in') {
        return { success: true, message: 'Ignored outgoing transfer' };
    }

    // Parse nội dung CK để lấy transferContent
    const content = body.content?.toUpperCase() || '';
    const match = content.match(/NAPTIEN\s+([A-Z0-9]+)/i);
    if (!match) {
        logger.info(`[SePay] No matching transaction for content: "${body.content}"`);
        return { success: true, message: 'No matching transaction' };
    }

    // Tìm transaction pending theo transferContent
    const transaction = await WalletTransaction.findOne({
        transferContent: { $regex: match[1], $options: 'i' },
        status: 'pending',
        gateway: 'vietqr',
    });

    if (!transaction) {
        logger.warn(`[SePay] Transaction not found for content: "${body.content}"`);
        return { success: true, message: 'Transaction not found' };
    }

    // Idempotency
    if (transaction.status === 'completed') {
        return {
            success: true,
            message: 'Already processed'
        };
    }

    // Verify amount
    if (transaction.amount !== Number(body.transferAmount)) {
        logger.warn(`[SePay] Amount mismatch: expected ${transaction.amount}, got ${body.transferAmount}`);
        // Tùy chính sách: có thể vẫn credit nếu dư tiền, hoặc reject
        // Ở đây reject để an toàn
        transaction.status = 'failed';
        transaction.metadata = body;
        await transaction.save();
        return { success: false, message: 'Amount mismatch' };
    }

    // 7. Credit ví
    await creditWallet(transaction, `SEPAY_${body.id}`, body);
    return { success: true, message: 'Wallet credited' };
};

//Cộng tiền vào ví (dùng chung cho cả VNPay và SePay)
const creditWallet = async (transaction, gatewayRef, metadata) => {
    // Atomic update ví
    const wallet = await Wallet.findByIdAndUpdate(
        transaction.walletId,
        {
            $inc: { balance: transaction.amount, totalTopup: transaction.amount },
        },
        { new: true }
    );

    // Cập nhật transaction
    transaction.status = 'completed';
    transaction.gatewayRef = gatewayRef;
    transaction.balanceAfter = wallet.balance;
    transaction.metadata = metadata;
    await transaction.save();

    logger.info(`[Wallet] Credited ${transaction.amount} VND to wallet ${wallet._id}`);
    return wallet;
};

// MUA KHÓA HỌC BẰNG VÍ
const purchaseWithWallet = async (userId, enrollmentId) => {
    // Lấy financing để biết số tiền cần trả
    console.log(enrollmentId)
    const financing = await FinancingOption.findById(enrollmentId);
    if (!financing) {
        throw new ApiError(404, 'Không tìm thấy thông tin học phí');
    }
    if (financing.status === 'completed') {
        throw new ApiError(409, 'Học phí đã được thanh toán');
    }

    const amount = financing.totalAmount - financing.paidAmount;
    if (amount <= 0) {
        throw new ApiError(404, 'Không có khoản nào cần thanh toán');
    }

    // Atomic trừ tiền — nếu balance không đủ → findOneAndUpdate trả null
    const wallet = await Wallet.findOneAndUpdate(
        {
            userId,
            balance: { $gte: amount },
            isActive: true,
        },
        {
            $inc: { balance: -amount, totalSpent: amount },
        },
        { new: true }
    );

    if (!wallet) {
        const currentWallet = await Wallet.findOne({ userId });
        if (!currentWallet?.isActive) {
            throw new ApiError(400, 'Ví đã bị khóa');
        }
        throw new ApiError(
            400,
            `Số dư không đủ. Cần ${amount.toLocaleString('vi-VN')} VND, hiện có ${currentWallet.balance.toLocaleString('vi-VN')} VND`
        );
    }

    // Ghi nhận transaction
    await WalletTransaction.create({
        walletId: wallet._id,
        userId,
        type: 'purchase',
        amount,
        balanceBefore: wallet.balance + amount,
        balanceAfter: wallet.balance,
        status: 'completed',
        gateway: 'manual',
        enrollmentId,
        note: `Thanh toán khóa học enrollment ${enrollmentId}`,
    });

    // Gọi financingService để sync paymentStatus
    const financingService = require('./financingOption.service');
    await financingService.recordPayment(financing._id, { amount });

    return { wallet, amountPaid: amount };
};

module.exports = {
    initWallet,
    getWallet,
    getTransactions,
    initiateTopup,
    handleVNPayIPN,
    handleSePay,
    purchaseWithWallet,
};