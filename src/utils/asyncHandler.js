const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler())
        .catch((err) => next(err))   //next is like a flag that indicate that now we can execute next middleware function 
    }
}

export {asyncHandler}


//Promises are used for handling asynchronous operations. 
//A Promise is an object that represents the eventual completion or failure of an asynchronous operation.


// Creating the Promise
// The new Promise() constructor takes a function (called the executor) that has two parameters: resolve and reject.
// resolve: You call this function if the asynchronous operation was successful.
// reject: You call this function if the asynchronous operation failed.



// Handling the Promise:
// .then(): If the promise is fulfilled, the then() method is called with the result.
// .catch(): If the promise is rejected, the catch() method is called with the error or reason.







// const asyncHandler = (func) => async (req,res,next) => {
//     try {
//         await func(req , res , next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }