const catchAsync = require('../utils/catchAsync');
const financingService = require('../services/financingOption.service');

const createFinancingOption = catchAsync(async (req, res) => {
    const financing = await financingService.createFinancingOption(
        req.params.enrollmentId,
        req.body
    );
    res.status(201).json({ status: 'success', data: financing });
});

const getByEnrollment = catchAsync(async (req, res) => {
    const financing = await financingService.getByEnrollment(req.params.enrollmentId);
    res.status(200).json({ status: 'success', data: financing });
});

const getFinancingOption = catchAsync(async (req, res) => {
    const financing = await financingService.getFinancingOptionById(req.params.financingId);
    res.status(200).json({ status: 'success', data: financing });
});

const recordPayment = catchAsync(async (req, res) => {
    const financing = await financingService.recordPayment(
        req.params.financingId,
        req.body
    );
    res.status(200).json({
        status: 'success',
        message: `Đã ghi nhận ${req.body.amount.toLocaleString()} VND`,
        data: financing,
    });
});

const updateIsa = catchAsync(async (req, res) => {
    const financing = await financingService.updateIsa(req.params.financingId, req.body);
    res.status(200).json({ status: 'success', data: financing });
});

const cancelFinancingOption = catchAsync(async (req, res) => {
    const financing = await financingService.cancelFinancingOption(
        req.params.financingId,
        req.body.notes
    );
    res.status(200).json({
        status: 'success',
        message: 'Đã hủy phương thức thanh toán',
        data: financing,
    });
});

module.exports = {
    createFinancingOption,
    getByEnrollment,
    getFinancingOption,
    recordPayment,
    updateIsa,
    cancelFinancingOption,
};