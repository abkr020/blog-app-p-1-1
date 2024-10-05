const multer = require('multer');
const path = require('path');

// Multer storage configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '../public/images/uploads')); // Use path.join to resolve the destination path
//     },
//     filename: function (req, file, cb) {
//         const filename = `${Date.now()}-${file.originalname}`; // Use a unique filename to avoid overwriting
//         console.log("File name:", filename);
//         cb(null, filename);
//     }
// });

// // Multer middleware
// const upload = multer({ storage: storage });




// Multer memory storage configuration
const storage = multer.memoryStorage();

// Multer middleware
const upload = multer({ storage: storage });

// Exporting middleware to be used in routes
module.exports = upload;
