import multer from "multer";

//To save or upload the file on local storage (disk storage)
//jb api request me json data ke sath file bhi aa rhi h to multer ka use karte h
const storage = multer.diskStorage({
    destination: function (req, file, cb) {   //destination where file data are saved
      cb(null, './public/temp')              //all files saved in temp folder of public
    },
    filename: function (req, file, cb) {      //name of file
      cb(null, file.originalname)
    }
})
  
export const upload = multer({
    storage: storage 
})


