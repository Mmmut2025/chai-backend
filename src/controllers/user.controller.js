import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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
    console.log("email" , email);

    


    
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
    const existedUser = User.findOne({
        $or : [{ username },{ email }]
    })
    
    if(existedUser){
        throw new ApiError(409 , "User with email or username already exist")
    }


    //step - 4  check for images
    //take file path from local storage
    const avatarLocalPath = req.files?.avatar[0]?.path;      //used for file and image //(?) questin mark esliye lagate h ki ho sakta h files ho ya n ho so its used for optional
    const coverImageLocalPath = req.files?.coverImage[0].path;

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


export {registerUser}

