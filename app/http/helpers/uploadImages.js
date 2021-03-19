const multer = require('multer');
const mkdirp = require('mkdirp');
const fs = require('fs')


const getDir = () => {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDay();
    return `./public/uploads/images/${year}/${month}/${day}`;
}

const ImageStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        let dir = getDir()
        mkdirp(dir).then(err => cb(null , dir))
    },
    filename: (req, file, cb)=>{
        let filePath = getDir() + '/' + file.originalname;
        if(!fs.existsSync(filePath))
            cb(null, file.originalname)
        else
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const uploadImage = multer({
    storage: ImageStorage,
    lemits: {
        fileSize: 1024 * 1024 * 5
    }
})

module.exports = uploadImage;