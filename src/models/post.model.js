const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');
const { default: slugify } = require('slugify');

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true
        },

        summary: {
            type: String,
            trim: true
        },

        content: {
            type: Object,
            required: true
        },

        thumbnail: {
            type: String
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft'
        },

        views: {
            type: Number,
            default: 0
        },

        isFeatured: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

postSchema.index({ title: 'text', content: 'text', });

postSchema.pre('validate', async function (next) {
    if (this.isModified('title')) {
        let baseSlug = slugify(this.title, { lower: true, strict: true, locale: 'vi' });
        let slug = baseSlug;
        let count = 1;

        while (await mongoose.models.Post.findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${count++}`;
        }
        this.slug = slug;
    }
    next();
});

postSchema.plugin(toJSON);
postSchema.plugin(paginate);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;