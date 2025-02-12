const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema
const shortLinkSchema = new Schema({
    real_link: {
        type: String,
        required: true,
    },
    short_link: {
        type: String,
        required: true,
        unique: true
    },
    ip: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ShortLink', shortLinkSchema);
