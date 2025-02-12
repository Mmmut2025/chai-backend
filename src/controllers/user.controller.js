import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"


//refresh token store in db by which user login without password using direct hit

//when user access token expire then 401 error aati h jesi hi 401 aayegi refresh token and genereate new access 
// token using refresh token stored in db

//when 401 find then new refresh token generate and compare it to refresh token stored in db if same then generate 
// new access token and send it to user



const generateAccessAndRefreshTokens =  async (userId)=> {
    try {
        const user = await User.findById(userId)  //take the user from db using userId
      
        const accessToken =  user.generateAccessToken()  //generate tokens
        const refreshToken = user.generateRefreshToken()                    

        //store refresh token in db
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500 , "something went wrong while generating the tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user detail from frontend
    //validation -- check the all data received from frontend is correct for not -- check not empty
    //check if user already exist : username , email
    //check for images , check for avtar
    //upload them to cloudinary , avtar
    //create user object - create entry in db
    //remove password and refresh token from response
    //check for user creation 
    //return response return otherwise return error




    //STEP-1 :- take user detail
    const {fullName, email , username , password}= req.body   //contain the data come from form and json file
    
    
    //console.log("email" , email);
    //console.log(req.body);

    


    
    //step-2 :- validation
    // if(fullName == ""){
    //     throw new ApiError(400 , "full name is required")
        
    // } 

    //2nd way of validation
    if (
        [fullName , email , username , password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400 , "All fields are requied")
    }
    




    
    //step-3 check the user already exist in db or not
    const existedUser =await User.findOne({
        $or : [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409 , "User with email or username already exist")
    }





    //step - 4  check for images
    //take file path from local storage
    const avatarLocalPath = req.files?.avatar[0]?.path;      //used for file and image //(?) questin mark esliye lagate h ki ho sakta h files ho ya n ho so its used for optional
    // const coverImageLocalPath = req.files?.coverImage[0].path;



    //it handle those situation if user don't provide the coverimage 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    //console.log(req.files)



    //check avatar aaya h ya nhi   ----------kyuki avatar is mandatory 
    if (!avatarLocalPath) {
        throw new ApiError(400 , "Avatar file is required")
    }









    //step-5 upload image and avatar on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    

    //check avatar coudinary par upload hua h ya nhi
    if(!avatar){
        throw new ApiError(400 , "Avatar file is required");
    }






    //step-6  create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })




    //step - 7 remove password from res
    //check user created or not in db so it is checked by user id that create by mongo
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"  //define field that you want to remove from db response
    )

    
    //step-8   check res usercreate or not
    if(!createdUser){
        throw new ApiError(500 , "something went wrond while registring the user")
    }





    //step-9  send the response
    return res.status(201).json(
        new ApiResponse(200,createdUser , "user registered successfully")
    )
})

const loginUser = asyncHandler(async (req,res) =>{
    //req.body -> data lao
    //username or email
    //find the user
    //if user find then check password
    //generate access , refresh token     -----access token matlab hota h kitni der tak user login rahega 
    //send token in cookies
    //send reponse that successfully login


    //step - 1  take the data from user 
    const {email , username , password} = req.body;
    if(!username && !email){    //BOTH username and email is mandatory
        throw new ApiError(400 , "username or email is required");
    }

    //step - 2
    const user = await User.findOne({
        $or : [{username} , {email}]
    })


    //step - 3
    if(!user){
        throw new ApiError(404 , "User doesn't exist")
    }

    
    //step -4 password check
    const isCorrectPassword =await user.isCorrectPassword(password);
    if(!isCorrectPassword){
        throw new ApiError(401 , "Invalid user credential")
    }

   // sep - 5
   const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)


   //step - 6 take user from db again using id the pass data into cookie
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
    httpOnly : true,   // if both option true ,  cookie only modify by server not frontend
    secure : true
   }

   return res.
   status(200).
   cookie("accessToken", accessToken , options).
   cookie("refreshToken" , refreshToken , options).
   json(
    new ApiResponse(200 , {user : loggedInUser , accessToken, refreshToken} ,"User logged In successfully")
   )
})

const logoutUser = asyncHandler(async (req,res) => {
    //how to logout the use => take the user from token , using client side cookie  (for this go in auth middleware and add user to req)

    // steps:-
    //step-1 : - remove refreshToken from db
    //step-2 : - clear cookies from client side

    //now we can easily fetch the user from req because i already add the user in req using auth middleware
    //remove refreshtoken from db
    await User.findByIdAndUpdate(           //find the user from db using id
        req.user.id, 
        {
            $set : {
                refreshToken : undefined   //remove refreshtoken from db
            }
        },
        {
            new : true  //provide the res with new updated value otherwise refresh token also will fetch
        }
    )

    //now clear or remove the cookie from client side
    const options = {
        httpOnly : true,   // if both option true ,  cookie only modify by server not frontend
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200 , {} , "User logged out"))
})


const refreshAccessToken = asyncHandler(async (req,res) => {

    //TAKE refresh token from client side cookie or body(in case of mobile app)
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new ApiError(401 , "Unautorized requrest")
    }


   try{
        //now ecrpyt and verify the incoming token becuae we need to compare it to refresh token in db
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        //now fetch the refresh token from db based of  id come from client side token
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401 , "Invalid refresh Token")
        }
    
        //now we have both refresh token (one from db and one from clinet side cookie) 
        //check both equal or not if yes then generate new token
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "refresh token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure :true
        }
    
        //generate new access token and refresh token using id
        const {newAccessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        //send the res and new token to user using cookie
        return res
        .status(200)
        .cookie("accessToken", newAccessToken , options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {newAccessToken,newRefreshToken} ,
                "access token refresh"
            )
        )
    } 
    catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh Token")
    }
})





export {registerUser} 
export {loginUser} 
export {logoutUser}
export {refreshAccessToken}

