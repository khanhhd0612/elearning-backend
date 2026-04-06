const catchAsync = require('../utils/catchAsync');
const cohortService = require('../services/cohort.service');

const createCohort = catchAsync(async (req, res) => {
    const cohort = await cohortService.createCohort(
        req.params.courseFormatId,
        req.body
    );

    res.status(201).json({
        status: 'success',
        data: cohort
    });
});

const getCohorts = catchAsync(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const result = await cohortService.getCohorts(
        req.params.courseFormatId,
        filter,
        req.query
    );
    res.status(200).json({
        status: 'success',
        data: result
    });
});

const getCohort = catchAsync(async (req, res) => {
    const cohort = await cohortService.getCohortById(
        req.params.cohortId,
        req.query.populate || ''
    );

    res.status(200).json({
        status: 'success',
        data: cohort
    });
});

const updateCohort = catchAsync(async (req, res) => {
    const cohort = await cohortService.updateCohort(req.params.cohortId, req.body);

    res.status(200).json({
        status: 'success',
        data: cohort
    });
});

const updateStatus = catchAsync(async (req, res) => {
    const cohort = await cohortService.updateStatus(
        req.params.cohortId,
        req.body.status,
        req.body.cancelReason
    );
    res.status(200).json({
        status: 'success',
        message: `Cohort đã chuyển sang "${cohort.status}"`,
        data: cohort,
    });
});

const assignInstructor = catchAsync(async (req, res) => {
    const assignment = await cohortService.assignInstructor(
        req.params.cohortId,
        req.body.instructorId,
        req.body.role
    );
    
    res.status(201).json({
        status: 'success',
        data: assignment
    });
});

const removeInstructor = catchAsync(async (req, res) => {
    await cohortService.removeInstructor(
        req.params.cohortId,
        req.params.instructorId
    );
    res.status(204).send();
});

const deleteCohort = catchAsync(async (req, res) => {
    await cohortService.deleteCohort(req.params.cohortId);
    res.status(204).send();
});

module.exports = {
    createCohort,
    getCohorts,
    getCohort,
    updateCohort,
    updateStatus,
    assignInstructor,
    removeInstructor,
    deleteCohort,
};