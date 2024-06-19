const { Router } = require('express');
const BlogModel = require('../models/blog.module');
const router = Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log("file destination")
        cb(null, "./public/images/uploads")
    },
    filename: function (req, file, cb) {
        const filename = `${file.originalname}`
        // const filename = `${Date.now()}-${file.originalname}`
        // console.log("file name", filename)

        return cb(null, filename)

    }
})

const upload = multer({ storage: storage })

router.get('/add-new', (req, res) => {
    res.render('addyourblog', { user: req.user })
})
router.post('/', upload.single("coverImageURL"),async (req, res) => {
    let { title, body } = req.body


    let blog = await BlogModel.create({
        title,
        body,
        // coverImageURL: req.file.filename,
        createdBy: req.user._id
    })
    res.redirect("/")
})
router.get('/view/:id', async (req, res) => {
    let blog  = await BlogModel.findById(req.params.id)
    res.render("viewblog",{
     user:req.user,
     blog
    })
 })
router.get('/edit/:id', async (req, res) => {
    let blog  = await BlogModel.findById(req.params.id)
    res.render("editblog",{
     user:req.user,
     blog
    })
 })

module.exports = router;