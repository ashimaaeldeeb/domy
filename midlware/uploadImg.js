const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Uploads')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.')[1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + ext)
    }
})

var upload = multer({
    storage: storage
})

module.exports = upload;