import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";    
//fs is a file system module provide by node js and no need to install.
// Common use for the File System module:
// Read files ,Create files , Update files , Delete files , Rename files


 // Configuration
 cloudinary.config({ 
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_KEY,
    api_secret : process.env.CLOUDINARY_SECRET
});


//To saved or Upload the file on cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        //if file path is correct then upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath , {resources_type : "auto"})

        //file has been upload successfully
        // console.log("file is uploaded on cloudinary" , response.url);

        fs.unlinkSync(localFilePath);   //remove the file from local storage after successfully uploading on cloudinary
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temperory as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}






