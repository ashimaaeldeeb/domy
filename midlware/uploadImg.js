const multer = require('multer');
let fs = require('fs-extra');

const DIR = '../uploads/users/';

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        
        fs.mkdirsSync(DIR);
        cb(null, DIR)
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.')[1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + ext)
        // const fileName = file.originalname.toLowerCase().split(' ').join('-');
        // cb(null, fileName)
    }
})

var upload = multer({
    storage: storage,
    // fileFilter: (req, file, cb) => {
    // if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
    //     cb(null, true);
    // } else {
    //     cb(null, false);
    //     return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    // }
    // }
})

module.exports = upload;