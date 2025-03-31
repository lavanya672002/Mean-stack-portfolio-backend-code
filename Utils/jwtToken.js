export const generateToken = (user, message, statusCode, res) => {
    const token =user.generateJsonWebToken();
    console.log("Generated Token:", token); 
    res.status(statusCode).cookie("token",token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES *24*60*60*1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Add this for HTTPS environments
            sameSite: "lax", // Cross-site cookie security
    })
    .json({
        success:true,
        message,
        token,
        user,
    })
};