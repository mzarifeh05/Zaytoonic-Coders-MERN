const mongoose = require("mongoose")

const memberSchema = new mongoose.Schema({
    name: String,
    major: String,
    bio: String,
    imgURL: String,
    linkedin: String,
    github: String
})

const Member = mongoose.model("member", memberSchema)

module.exports = Member