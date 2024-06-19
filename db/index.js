const mongoose = require('mongoose')


const connect_db = async () => {
    try {


        const connection_info = await mongoose.connect(`${process.env.DATABASE_URL}/blog-app-p-1`);



        console.log(`mongo db connected successfully`);

    } catch (error) {
        console.log("mongo db connection failed error", error);
        process.exit(1);

    }
}

module.exports = connect_db;