const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');
const { toJSON, paginate } = require('./plugins');

const skillRequirementSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        isRequired: { type: Boolean, default: true },
    },
    { _id: false }
);

const courseSchema = new Schema(
    {
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Danh mục là bắt buộc'],
            index: true,
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },

        title: {
            type: String,
            required: [true, 'Tiêu đề là bắt buộc'],
            trim: true,
            maxlength: [255, 'Tiêu đề không quá 255 ký tự'],
        },

        description: {
            type: String,
            default: '',
        },

        durationWeeks: {
            type: Number,
            required: [true, 'Thời lượng là bắt buộc'],
            min: [1, 'Thời lượng phải >= 1 tuần'],
        },

        basePrice: {
            type: Number,
            required: [true, 'Giá là bắt buộc'],
            min: [0, 'Giá không hợp lệ'],
        },

        enrollmentType: {
            type: String,
            enum: {
                values: ['public', 'approval', 'invite_only'],
                message: 'enrollmentType phải là public | approval | invite_only',
            },
            default: 'public',
            index: true,
        },

        level: {
            type: String,
            enum: {
                values: ['beginner', 'intermediate', 'advanced', 'expert'],
                message: 'Level phải là beginner | intermediate | advanced | expert',
            },
            default: null,
        },

        requiredSkills: {
            type: [skillRequirementSchema],
            default: [],
        },

        thumbnailUrl : {
            type: String,
            default: "",
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

courseSchema.index({ categoryId: 1, isActive: 1 });
courseSchema.index({ enrollmentType: 1, isActive: 1 });
courseSchema.index({ basePrice: 1 });
courseSchema.index({ createdAt: -1 });

courseSchema.virtual('formats', {
    ref: 'CourseFormat',
    localField: '_id',
    foreignField: 'courseId',
});

courseSchema.pre('save', async function (next) {
    if (this.isModified('title')) {
        let baseSlug = slugify(this.title, { lower: true, strict: true, locale: 'vi' });
        let slug = baseSlug;
        let count = 1;
        while (await mongoose.models.Course.findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${count++}`;
        }
        this.slug = slug;
    }

    next();
});

courseSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    const title = update?.title || update?.$set?.title;
    if (!title) return next();

    const docId = this.getQuery()._id;
    let baseSlug = slugify(title, { lower: true, strict: true, locale: 'vi' });
    let slug = baseSlug;
    let count = 1;
    while (await mongoose.models.Course.findOne({ slug, _id: { $ne: docId } })) {
        slug = `${baseSlug}-${count++}`;
    }
    this.set({ slug });
    next();
});

courseSchema.plugin(toJSON);
courseSchema.plugin(paginate);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;