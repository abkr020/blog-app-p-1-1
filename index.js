require('dotenv').config()
const session = require('express-session');

const express = require('express')
const app = express()


const path = require('path');
app.set('views', path.join(__dirname, 'views'));

// const path = require('path');
// const viewsPath = path.join(__dirname, 'views');
app.set("view engine", "ejs")



const connect_db = require("./db/index.js")
connect_db();
const cookieparser = require('cookie-parser')

const userRoute = require("./routes/user.route.js");
const blogRoute = require("./routes/blog.route.js");
const { checkForAuthenticationCookie } = require('./middlewares/authentication.js');
const BlogModel = require('./models/blog.module.js');

// app.set('views', viewsPath);
// console.log(`Views directory set to: ${viewsPath}`); // Log the views path to verify

// app.set('views', path.join(__dirname, 'views'));
// app.set('views', path.resolve(__dirname, 'views'));

// app.use(express.static(path.resolve('./public/uploads')))

app.use(session({
  secret: 'your-secret-key', // Replace with your own secret key
  resave: false, // Forces session to be saved back to the session store
  saveUninitialized: true, // Forces a session that is uninitialized to be saved to the store
  cookie: { secure: false } // Set secure to true if using HTTPS
}));
app.use(express.json());

app.use(express.static(path.resolve('./public')))

app.use(express.urlencoded({ extended: true }))
app.use(cookieparser())
app.use(checkForAuthenticationCookie("token1"))


app.get('/', async (req, res) => {
  // const allblogs = await BlogModel.find({})
  // const allblogs = await BlogModel.find().populate('createdBy', 'fullname'); // Populate the name of the user
  const allblogs = await BlogModel.find().populate('createdBy', 'fullname email blueTick');


  res.render('home', {
    user: req.user,
    blogs: allblogs
  })
})
app.use('/user', userRoute)
app.use('/blog', blogRoute)


app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})