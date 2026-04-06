const catchAsync = require('../utils/catchAsync');
const campusService = require('../services/campus.service');
const pick = require('../utils/pick');

const createCampus = catchAsync(async (req, res) => {
    const campus = await campusService.createCampus(req.body);

    res.status(201).json({
        status: 'success',
        data: campus
    });
});

const getCampuses = catchAsync(async (req, res) => {

    const filter = pick(req.query, ['isActive', 'city']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const result = await campusService.getCampuses(filter, options);
    res.status(200).json({
        status: 'success',
        data: result
    });
});

const getCampus = catchAsync(async (req, res) => {
    const campus = await campusService.getCampusById(req.params.campusId);

    res.status(200).json({
        status: 'success',
        data: campus
    });
});

const updateCampus = catchAsync(async (req, res) => {
    const campus = await campusService.updateCampus(req.params.campusId, req.body);

    res.status(200).json({ 
        status: 'success', 
        data: campus 
    });
});

const toggleCampus = catchAsync(async (req, res) => {
    const campus = await campusService.toggleCampus(req.params.campusId);

    res.status(200).json({
        status: 'success',
        message: `Trường đã được ${campus.isActive ? 'kích hoạt' : 'ẩn'}`,
        data: { id: campus._id, isActive: campus.isActive },
    });
});

const deleteCampus = catchAsync(async (req, res) => {
    await campusService.deleteCampus(req.params.campusId);
    res.status(204).send();
});

module.exports = {
    createCampus,
    getCampuses,
    getCampus,
    updateCampus,
    toggleCampus,
    deleteCampus
};