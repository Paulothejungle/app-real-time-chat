const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room : {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true,
    }
}, { timestamp: true });

module.exports = mongoose.model('Message', messageSchema);