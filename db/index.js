const mongoose = require('mongoose')


const connect_db = async () => {
    try {

        // mongoose.connect("mongodb://127.0.0.1:27017/blog-app-p-1-3")


        const connection_info = await mongoose.connect(`${process.env.DATABASE_URL}/blog-app-p-1`);



        console.log(`mongo db connected successfully`);

    } catch (error) {
        console.log("mongo db connection failed error", error);
        process.exit(1);

    }
}

module.exports = connect_db;