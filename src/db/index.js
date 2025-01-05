import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

//database is in another continent so create the funtion as async which connect database

const connectDB = async () =>{
    try{
        console.log(`${process.env.MONGODB_URI}`);
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DB_NAME, // Specify the database name explicitly
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }); 
        console.log( `\n mongodbconnected !! DB HOST : ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("MONGODB connection error" , error);
        //To exit the current process
        process.exit(1);
    }
}

export default connectDB
