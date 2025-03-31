class ErrorHandler extends Error {
    constructor(message, statuscode){
        super(message);
        this.statuscode = statuscode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
   err.message = err.message || "internal server error";
   err.statuscode = err.statuscode || 500;

   if(err.code === 11000){
    const message = `Duplicate $(Object.keys(err.keyValue)) Entered`;
    err = new ErrorHandler(message, 400);
   }
   if(err.name === "JsonWebTokenError"){
    const message = `Json web token is invalid. Try Again!!`;
    err = new ErrorHandler(message, 400);
   }
   if(err.code === "TokenExpiredError"){
    const message = `Json web Token is expired. Try to login Again!`;
    err = new ErrorHandler(message, 400);
   }
   if(err.code === "CastError"){
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
   }
console.log(err)

   const errorMessage = err.errors
   ? Object.values(err.errors)
   .map(error => error.message)
   .join(" ")
   :err.message;

   return res.status(err.statuscode).json({
    success: false,
    message: errorMessage,
   })
}


export default ErrorHandler;