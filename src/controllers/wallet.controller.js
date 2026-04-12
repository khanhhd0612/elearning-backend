const catchAsync = require('../utils/catchAsync');
const walletService = require('../services/wallet.service');
const logger = require('../config/logger');

const getWallet = catchAsync(async (req, res) => {
    const wallet = await walletService.getWallet(req.user._id);

    res.status(200).json({
        status: 'success',
        data: wallet
    });
});

const getTransactions = catchAsync(async (req, res) => {
    const result = await walletService.getTransactions(req.user._id, req.query, req.query);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

const initiateTopup = catchAsync(async (req, res) => {

    const result = await walletService.initiateTopup(req.user._id, req.body);

    res.status(200).json({
        status: 'success', data: result
    });
});

//VNPay server-to-server
const vnpayIPN = catchAsync(async (req, res) => {
    const result = await walletService.handleVNPayIPN(req.query);
    res.status(200).json(result);
});

//redirect sau khi user thanh toán
const vnpayReturn = catchAsync(async (req, res) => {
    const { vnp_ResponseCode, vnp_TxnRef } = req.query;
    const success = vnp_ResponseCode === '00';
    res.redirect(`${process.env.CLIENT_URL}/wallet/topup/result?success=${success}&txn=${vnp_TxnRef}`);
});

// POST /wallet/topup/sepay/webhook — SePay callback
const sepayWebhook = catchAsync(async (req, res) => {
    const result = await walletService.handleSePay(req.body, req.headers);
    res.status(200).json(result);
});

// POST /wallet/purchase
const purchaseWithWallet = catchAsync(async (req, res) => {
    const result = await walletService.purchaseWithWallet(req.user._id, req.body.enrollmentId);
    res.status(200).json({
        status: 'success',
        message: `Thanh toán thành công ${result.amountPaid.toLocaleString('vi-VN')} VND`,
        data: {
            balance: result.wallet.balance
        },
    });
});

module.exports = {
    getWallet,
    getTransactions,
    initiateTopup,
    vnpayIPN,
    vnpayReturn,
    sepayWebhook,
    purchaseWithWallet
}