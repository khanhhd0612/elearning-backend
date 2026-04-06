const FinancingOption = require('../models/financingOption.model');
const Enrollment = require('../models/enrollment.model');
const ApiError = require('../utils/ApiError');

const getEnrollment = async (enrollmentId) => {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) throw new ApiError(404, 'Không tìm thấy enrollment');
    return enrollment;
};

const getById = async (financingId) => {
    const financing = await FinancingOption.findById(financingId)
        .populate('enrollmentId', 'userId cohortId status amountPaid paymentStatus');
    if (!financing) throw new ApiError(404, 'Không tìm thấy thông tin thanh toán');
    return financing;
};

const createFinancingOption = async (enrollmentId, body) => {
    const enrollment = await getEnrollment(enrollmentId);

    // Kiểm tra đã có financing chưa
    const exists = await FinancingOption.findOne({ enrollmentId });
    if (exists) {
        throw new ApiError(409, 'Enrollment này đã có phương thức thanh toán');
    }

    // học bổng: tính lại totalAmount sau discount
    if (body.type === 'scholarship') {
        if (body.discountPercentage > 0) {
            body.discountAmount = Math.round(body.totalAmount * body.discountPercentage / 100);
        }
        body.totalAmount = body.totalAmount - body.discountAmount;
    }

    const financing = await FinancingOption.create({
        ...body,
        enrollmentId,
        status: 'active',
    });

    // Cập nhật paymentStatus trên enrollment
    await Enrollment.findByIdAndUpdate(enrollmentId, {
        paymentStatus: body.type === 'full' && body.totalAmount === 0 ? 'paid' : 'pending',
    });

    return financing;
};

const getByEnrollment = async (enrollmentId) => {
    await getEnrollment(enrollmentId);
    const financing = await FinancingOption.findOne({ enrollmentId });
    if (!financing) throw new ApiError(404, 'Chưa có thông tin thanh toán');
    return financing;
};

const getFinancingOptionById = async (financingId) => getById(financingId);

const recordPayment = async (financingId, { amount, installmentId, notes }) => {
    const financing = await getById(financingId);

    if (['completed', 'cancelled'].includes(financing.status)) {
        throw new ApiError(
            400,
            `Không thể ghi nhận thanh toán — trạng thái hiện tại: ${financing.status}`
        );
    }

    const remaining = financing.totalAmount - financing.paidAmount;
    if (amount > remaining + 1) { // +1 cho sai số làm tròn
        throw new ApiError(
            400,
            `Số tiền (${amount.toLocaleString()}) vượt quá số còn lại (${remaining.toLocaleString()})`
        );
    }

    // Cập nhật paidAmount
    financing.paidAmount = Math.min(financing.paidAmount + amount, financing.totalAmount);

    // Nếu là installment cập nhật đúng đợt
    if (financing.type === 'installment' && installmentId) {
        const installment = financing.installments.id(installmentId);
        if (!installment) {
            throw new ApiError(404, 'Không tìm thấy đợt thanh toán');
        }
        if (installment.status === 'paid') {
            throw new ApiError(409, 'Đợt này đã được thanh toán rồi');
        }
        installment.status = 'paid';
        installment.paidAt = new Date();
    }

    if (notes) financing.notes = notes;

    await financing.save(); // pre-save hook tự chuyển status completed nếu đủ tiền

    // Sync paymentStatus lên Enrollment
    const paymentStatus =
        financing.status === 'completed' ? 'paid' :
            financing.paidAmount > 0 ? 'partial' : 'pending';

    await Enrollment.findByIdAndUpdate(financing.enrollmentId, {
        amountPaid: financing.paidAmount,
        paymentStatus,
    });

    return financing;
};

const updateIsa = async (financingId, updateBody) => {
    const financing = await getById(financingId);

    if (financing.type !== 'isa') {
        throw new ApiError(400, 'Chỉ áp dụng cho loại ISA');
    }

    Object.assign(financing, updateBody);
    await financing.save();
    return financing;
};

//Đánh dấu các khoản trả góp quá hạn (gọi từ cronjob)
const markOverdueInstallments = async () => {
    const now = new Date();

    const result = await FinancingOption.updateMany(
        {
            type: 'installment',
            status: 'active',
            'installments.status': 'pending',
            'installments.dueDate': { $lt: now },
        },
        {
            $set: { 'installments.$[elem].status': 'overdue' },
        },
        {
            arrayFilters: [{ 'elem.status': 'pending', 'elem.dueDate': { $lt: now } }],
        }
    );

    return result.modifiedCount;
};

const cancelFinancingOption = async (financingId, notes = '') => {
    const financing = await getById(financingId);

    if (financing.status === 'completed') {
        throw new ApiError(409, 'Không thể hủy — thanh toán đã hoàn tất');
    }
    if (financing.paidAmount > 0) {
        throw new ApiError(
            409,
            `Không thể hủy — đã có ${financing.paidAmount.toLocaleString()} VND được thanh toán`
        );
    }

    financing.status = 'cancelled';
    if (notes) financing.notes = notes;
    await financing.save();

    // Reset paymentStatus trên enrollment
    await Enrollment.findByIdAndUpdate(financing.enrollmentId, { paymentStatus: 'pending' });

    return financing;
};

module.exports = {
    createFinancingOption,
    getByEnrollment,
    getFinancingOptionById,
    recordPayment,
    updateIsa,
    markOverdueInstallments,
    cancelFinancingOption,
};