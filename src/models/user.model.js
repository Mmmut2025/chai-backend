import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



const userSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true   //username ko sarchable banane ke liye ,  by wich easily search username  database searching
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        fullname : {
            type : String,
            required : true,
            trim : true,
            index : true 
        },
        avatar : {
            type : String,  //use the cloudnary url
            required : true
        },
        coverImage:{
            type : String  //use the cloudnary url
        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password : {
            type : String,
            required : [true , 'Password is required']
        },
        refreshToken : {
            type : String
        }
    },
    {
        timestamps:true
    }
)


//if password update by the user then encypt the new password and store in db otherwise check next middleware fuctinality
userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password,10)
    next()
})

//check the user entered password is equal or not to correct db password , if equal then user login succesfullu otherwise not login
userSchema.methods.isCorrectPassword= async function (password) {
    return await bcrypt.compare(password,this.password)    //user and db password is equal then return true otherwise return false
}


//it is used for set the access token and refresh token for user authorization to access certain resources for particular time
userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            //payload
            _id : this._id,
            email :this.email,
            username:this.username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiryIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            //payload
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiryIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User" , userSchema)                                       

