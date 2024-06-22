const multer = require("multer");
const fs = require('fs');
const path = require('path');


const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadsDir);
    },
    filename: (req, file, callback) => {
        const filename = `image-${Date.now()}.${file.originalname}`;
        callback(null, filename);
    }
});

// File filter
const fileFilter = (req, file, callback) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        callback(null, true);
    } else {
        callback(null, false);
        return callback(new Error("Only .png, .jpg & .jpeg formats are allowed!"));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;
