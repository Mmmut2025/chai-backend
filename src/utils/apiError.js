
//this code is used to handle the api error

class ApiError extends Error{
    constructor(statusCode , message = "something went wrong", errors = [] , statck = ""){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        //statusCode tells about status of response that server send res


        // To detect the error easily in many files ,  it is suitable for deveoper to detect and correct the error
        if (statck) {
            this.stack = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}