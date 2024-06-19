const mongoose = require('mongoose')



const blogSchema = mongoose.Schema({
    title: {
        type: String,

    },
    body: {
        type: String,


    },

    coverImageURL: {
        type: String,

    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }


}, { timestamps: true })




const BlogModel = mongoose.model('blogs', blogSchema)

module.exports = BlogModel;