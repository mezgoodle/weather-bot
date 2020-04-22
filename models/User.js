const mongoose = require("mongoose");

// User Schema
let userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    city: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;