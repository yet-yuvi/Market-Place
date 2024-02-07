const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fname: {
        type: String,
    },
    lname: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    type: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer',
    }
},{timestamps: true});

module.exports = User = mongoose.model('User', UserSchema);



