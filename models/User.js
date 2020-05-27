'use strict';

const mongoose = require("mongoose");

// User Schema
let userSchema = mongoose.Schema({
    user_id: {
        type: Number,
        required: true,
        unique: true
    },
    city: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        default: "en"
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;