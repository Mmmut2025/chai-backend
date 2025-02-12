//verify that user exist or not 

import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"; 

export const verifyJWT = asyncHandler(async (req , res , next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")  //token fetch from cookie ya req header
    
        if(!token){
            throw new ApiError(401 , "Unauthorized request")    //when token not find 
        }
    
        //if token find from client side then ----->   decode the token for verification using secret key
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")   // take user using token id
        if(!user){
            //discuss about frontend
            throw new ApiError(401 , "Invalid Access Token")   //check user fetch or not
        }
    
        //if user have you
        req.user = user    //add the user to req by which i can fetch user from req for logout
        next()   //next() is used to execute to next middleware function

    } catch (error) {
        throw new ApiError(401 , error?.message || "invalid access token")
    }
})