const BlogModel = require('../models/blog.module');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');


// Controller to render add new blog page
const renderAddNewBlog = (req, res) => {
    res.render('addyourblog', { user: req.user });
};

const createNewBlog = async (req, res) => {
    console.log("Request received for creating a new blog");
    console.log("Request Body:", req.body); // Log request body
    console.log("Uploaded File:", req.file); // Log uploaded file details

    let { title, body } = req.body;
    let coverImageURL = null;

    // Check if a file was uploaded
    if (req.file) {
        try {
            // Upload to Cloudinary using memory buffer
            console.log("Uploading to Cloudinary...");
            
            // Use Cloudinary's upload_stream to handle buffer uploads
            const uploadToCloudinary = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'auto' }, // auto-detect the file type (image, video, etc.)
                        (error, result) => {
                            if (error) {
                                return reject(error);
                            }
                            resolve(result);
                        }
                    );
                    stream.end(req.file.buffer); // Send the file buffer
                });
            };

            const result = await uploadToCloudinary();
            coverImageURL = result.secure_url; // Get the URL from Cloudinary
            console.log("Uploaded to Cloudinary:", coverImageURL);
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            return res.status(500).send("Failed to upload image to Cloudinary.");
        }
    } else {
        console.warn("No file uploaded, coverImageURL set to null.");
    }

    try {
        let blog = await BlogModel.create({
            title,
            body,
            coverImageURL, // Save the Cloudinary URL in the database (or null)
            createdBy: req.user._id
        });

        console.log("Blog created successfully:", blog);
        res.redirect("/");
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).send("An error occurred while creating the blog.");
    }
};






const viewBlog = async (req, res) => {
    try {
        // Populate the 'createdBy' (author) field
        let blog = await BlogModel.findById(req.params.id).populate('createdBy');

        if (!blog) {
            return res.status(404).render('404', { error: 'Blog not found' });
        }

        res.render("viewblog", {
            user: req.user,

            blog
        });
    } catch (error) {
        console.error(error);
        res.render('error', { error: 'Error retrieving blog details' });
    }
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
            try {
                // Upload the image to Cloudinary using memory buffer
                console.log("Uploading new image to Cloudinary...");
                
                const uploadToCloudinary = () => {
                    return new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            { resource_type: 'auto' }, // auto-detect the file type (image, video, etc.)
                            (error, result) => {
                                if (error) {
                                    return reject(error);
                                }
                                resolve(result);
                            }
                        );
                        stream.end(req.file.buffer); // Send the file buffer
                    });
                };

                const cloudinaryResponse = await uploadToCloudinary();
                console.log("Uploaded to Cloudinary:", cloudinaryResponse.secure_url);

                // Update the coverImageURL with the Cloudinary URL
                updateFields.coverImageURL = cloudinaryResponse.secure_url;
            } catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                return res.status(500).send("Failed to upload image to Cloudinary.");
            }
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
