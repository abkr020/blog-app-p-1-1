const { Router } = require('express');
const upload = require('../middlewares/uploadMiddleware'); // Import the upload middleware
const {
    renderAddNewBlog,
    createNewBlog,
    viewBlog,
    renderEditBlog,
    updateBlog
} = require('../controllers/blogController'); // Import the controllers
const router = Router();

router.get('/add-new', renderAddNewBlog); // Use the controller to render add new blog page

router.post('/', upload.single("coverImageURL"), createNewBlog); // Handle new blog creation

router.get('/view/:id', viewBlog); // View a single blog by ID

router.get('/edit/:id', renderEditBlog); // Render edit blog page

router.post('/edit/update/:id', upload.single("coverImageURL"), updateBlog); // Handle blog update with file upload

module.exports = router;
