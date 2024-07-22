const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/instaclone");

const userSchema = mongoose.Schema({
    name: String,
    blog: String,
    image: String,
    password : String
})

module.exports = mongoose.model("user", userSchema);



