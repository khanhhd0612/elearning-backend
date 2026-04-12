const mongoose = require('mongoose');
const { Schema } = mongoose;

// Mục tiêu học tập
const objectiveSchema = new Schema(
    {
        code: { type: String, trim: true },   // vd: "OP1"
        description: { type: String, required: true, trim: true },
    },
    { _id: true }
);

//Buổi học trong module
const lessonSchema = new Schema(
    {
        order: { type: Number, required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
    },
    { _id: true }
);

//Module trong lộ trình
const moduleSchema = new Schema(
    {
        order: { type: Number, required: true },
        title: { type: String, required: true, trim: true },
        lessons: { type: [lessonSchema], default: [] },
    },
    { _id: true }
);

//Chuẩn đầu ra
const outcomeSchema = new Schema(
    {
        order: { type: Number, required: true },
        description: { type: String, required: true, trim: true },
    },
    { _id: true }
);

const skillRequirementSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        isRequired: { type: Boolean, default: true },
    },
    { _id: false }
);

const courseContentFields = {
    // Mục tiêu học tập — "Học viên sẽ đạt được gì"
    objectives: {
        type: [objectiveSchema],
        default: [],
    },

    // Lộ trình học tập chi tiết
    curriculum: {
        type: [moduleSchema],
        default: [],
    },

    // Chuẩn đầu ra
    outcomes: {
        type: [outcomeSchema],
        default: [],
    },

    // Đối tượng phù hợp — ai nên học khóa này
    targetAudience: {
        type: [String],
        default: [],
    },

};

module.exports = {
    objectiveSchema,
    moduleSchema,
    lessonSchema,
    outcomeSchema,
    courseContentFields,
    skillRequirementSchema
};