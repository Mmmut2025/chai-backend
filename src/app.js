import express from "express";                    // file is created using (echo "msg" > filename.ext)  in terminated
import cors from "cors";
import cookieParser from "cookie-parser";   //browser par jo user cookie h unko access and set karne ke liye h



const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials : true
}))  //it used for middleware and configuration   //To connect frontend with backend

app.use(express.json({
    limit: "16kb"
}))  //TO ACCEPT the json on express and set the limit of json on express server


app.use(express.urlencoded({
    extended : true,
    limit : "16kb"
}))   //To accept the data from url that come at express in any format

app.use(express.static("public"))  //to store any assests in public folder

app.use(cookieParser())



//routes import
import userRouter from './routes/user.routes.js'


//routes declaration
app.use("/api/v1/users" , userRouter)

//https://localhost:8000/api/v1/users/register    // Go for the register page


export { app } 