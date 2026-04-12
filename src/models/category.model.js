const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const slugify = require('slugify');
const clearPatterns = require('../utils/clearPatterns');

const categorySchema = mongoose.Schema(
    {
        parentId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Category',
            default: null,
        },
        name: {
            type: String,
            required: [true, 'Tên danh mục là bắt buộc'],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        icon: {
            type: String,
        },
        colorHex: {
            type: String,
            match: /^#([0-9A-F]{3}){1,2}$/i,
        },
        level: {
            type: Number,
            default: 0
        },
        sortOrder: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

categorySchema.index({ parentId: 1, order: 1 });

categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);

categorySchema.pre('save', function (next) {
    if (this.parentId && this.parentId.equals(this._id)) {
        return next(new Error('Category không thể là cha của chính nó'));
    }
    next();
});

categorySchema.pre('save', async function (next) {
    if (this.isModified('name')) {
        let baseSlug = slugify(this.name, {
            lower: true,
            strict: true,
            locale: 'vi',
        });

        let slug = baseSlug;
        let count = 1;

        while (await mongoose.models.Category.findOne({ slug })) {
            slug = `${baseSlug}-${count++}`;
        }

        this.slug = slug;
    }
    next();
});

const clearCategoryCache = clearPatterns(
    '__express__/v1/categories*',
    '__express__/v1/courses*'
);

categorySchema.post('save', clearCategoryCache);
categorySchema.post('insertMany', clearCategoryCache);
categorySchema.post('findOneAndUpdate', clearCategoryCache);
categorySchema.post('findOneAndDelete', clearCategoryCache);
categorySchema.post('deleteOne', clearCategoryCache);
categorySchema.post('updateMany', clearCategoryCache);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;