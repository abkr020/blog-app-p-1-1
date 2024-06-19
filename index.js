require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

const connect_db = require("./db/index.js")
connect_db();
const cookieparser = require('cookie-parser')

const userRoute = require("./routes/user.route.js");
const blogRoute = require("./routes/blog.route.js");
const { checkForAuthenticationCookie } = require('./middlewares/authentication.js');
const BlogModel = require('./models/blog.module.js');

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(cookieparser())
app.use(checkForAuthenticationCookie("token"))


app.get('/', async (req, res) => {
  const allblogs = await BlogModel.find({})

  res.render('home', {
    user: req.user,
    blogs: allblogs
  })
})
app.use('/user', userRoute)
app.use('/blog', blogRoute)


app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})