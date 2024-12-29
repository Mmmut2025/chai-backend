import mongoose from "mongoose";
import  { DB_NAME }from "../constant.js"

//database is in another continent so create the funtion as async which connect database

const connectDB = async () =>{
    try{

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log( `\n mongodbconnected !! DB HOST : ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("MONGODB connection error" , error);
        //To exit the current process
        process.exit(1);
    }
}

export default connectDB
