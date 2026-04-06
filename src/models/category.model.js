const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const slugify = require('slugify');

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

/**
 * @typedef Category
 * @property {string} _id
 * @property {string|null} parentId - ID danh mục cha, null nếu là danh mục gốc
 * @property {string} name - Tên danh mục
 * @property {string} slug - Slug tự động sinh từ name
 * @property {number} order - Thứ tự hiển thị
 * @property {boolean} isActive - Trạng thái
 * @property {Date} createdAt - Ngày tạo
 * @property {Date} updatedAt - Ngày cập nhật
 */

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;