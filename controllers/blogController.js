const BlogModel = require('../models/blog.module');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');


// Controller to render add new blog page
const renderAddNewBlog = (req, res) => {
    res.render('addyourblog', { user: req.user });
};


const createNewBlog = async (req, res) => {
    console.log("File upload single complete");
    console.log(req.body);

    let { title, body } = req.body;
    let coverImageURL = null;

    // Check if a file was uploaded
    if (req.file) {
        try {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);
            coverImageURL = result.secure_url; // Get the URL from Cloudinary
            console.log("Uploaded to Cloudinary:", coverImageURL);
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            return res.status(500).send("Failed to upload image to Cloudinary.");
        } finally {
            // Remove local file after upload
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error removing local file:", err);
            });
        }
    } else {
        console.warn("No file uploaded, coverImageURL set to null.");
    }

    // Check if title and body are provided
    if (!title || !body) {
        return res.status(400).send("Title and body are required.");
    }

    try {
        let blog = await BlogModel.create({
            title,
            body,
            coverImageURL, // Save the Cloudinary URL in the database (or null)
            createdBy: req.user._id
        });
        
        res.redirect("/");
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).send("An error occurred while creating the blog.");
    }
};




const viewBlog = async (req, res) => {
    let blog = await BlogModel.findById(req.params.id);
    res.render("viewblog", {
        user: req.user,
        blog
    });
};

// Controller to render edit blog page
const renderEditBlog = async (req, res) => {
    let blog = await BlogModel.findById(req.params.id);
    res.render("editblog", {
        user: req.user,
        blog
    });
};
const updateBlog = async (req, res) => {
    try {
        // Find the existing blog by its ID
        let blog = await BlogModel.findById(req.params.id);
        if (!blog) {
            return res.status(404).send("Blog not found.");
        }

        // Destructure title and body from the request body
        let { title, body } = req.body;
        let updateFields = { title, body };

        // If a new image is uploaded
        if (req.file) {
            // Upload the image to Cloudinary
            const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path);
            console.log("Uploaded to Cloudinary:", cloudinaryResponse.secure_url);

            // Update the coverImageURL with the Cloudinary URL
            updateFields.coverImageURL = cloudinaryResponse.secure_url;

            // Delete the local file after uploading to Cloudinary
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting local file:", err);
            });
        }

        // Update the blog post with new title, body, and coverImageURL (if provided)
        await BlogModel.findOneAndUpdate(
            { _id: blog._id },
            updateFields,
            { new: true } // This option returns the updated document
        );

        // Redirect to the user's profile after update
        res.redirect("/user/profile");
    } catch (err) {
        console.error("Error updating the blog post:", err);
        res.status(500).send("An error occurred while updating the blog post.");
    }
};

module.exports = {
    renderAddNewBlog,
    createNewBlog,
    viewBlog,
    renderEditBlog,
    updateBlog
};
