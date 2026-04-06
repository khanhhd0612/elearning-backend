const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');
const { toJSON, paginate } = require('./plugins');

const campusSchema = new Schema(
    {
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },

        name: {
            type: String,
            required: [true, 'Tên campus là bắt buộc'],
            trim: true,
            maxlength: [100, 'Tên campus không quá 100 ký tự'],
        },

        city: {
            type: String,
            required: [true, 'Thành phố là bắt buộc'],
            trim: true,
        },

        country: {
            type: String,
            required: [true, 'Quốc gia là bắt buộc'],
            trim: true,
            default: 'Vietnam',
        },

        timezone: {
            type: String,
            required: [true, 'Timezone là bắt buộc'],
            default: 'Asia/Ho_Chi_Minh',
        },

        address: {
            type: String,
            trim: true,
            default: '',
        },

        phone: {
            type: String,
            trim: true,
            default: '',
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: '',
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

campusSchema.index({ city: 1, isActive: 1 });

campusSchema.virtual('instructorCount', {
    ref: 'Instructor',
    localField: '_id',
    foreignField: 'campusId',
    count: true,
});

campusSchema.pre('save', async function (next) {
    if (!this.isModified('name')) return next();

    let baseSlug = slugify(this.name, { lower: true, strict: true, locale: 'vi' });
    let slug = baseSlug;
    let count = 1;
    while (await mongoose.models.Campus.findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${count++}`;
    }
    this.slug = slug;
    next();
});

campusSchema.plugin(toJSON);
campusSchema.plugin(paginate);

const Campus = mongoose.model('Campus', campusSchema);
module.exports = Campus;