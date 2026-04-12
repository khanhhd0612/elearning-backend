const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['refresh']
    },
    blacklisted: {
        type: Boolean,
        default: false
    },
    expires: Date,
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Token', tokenSchema);
