import { catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {User} from "../models/userSchema.js";
import { v2 as cloudinary} from "cloudinary";
import { generateToken } from "../Utils/jwtToken.js";
import { sendEmail } from "../Utils/sendEmail.js";
import crypto from "crypto"

export const register = catchAsyncErrors(async(req, res, next)=>{
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Avatar And Resume Are Required!",400));
    } 
    const {avatar} = req.files;
    // console.log("AVATAR",avatar)
    const CloudinaryResponseForAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {folder: "AVATARS"}
    );
    if(!CloudinaryResponseForAvatar || CloudinaryResponseForAvatar.error){
        console.error("Cloudinary Error:",CloudinaryResponseForAvatar.error || "Unknown Cloudinary Error" )
    }

    const {resume} = req.files;
    // console.log("MY_RESUME",resume)
    const CloudinaryResponseForResume = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {folder: "MY_RESUME"}
    );
    if(!CloudinaryResponseForResume || CloudinaryResponseForResume.error){
        console.error("Cloudinary Error:",CloudinaryResponseForResume.error || "Unknown Cloudinary Error" )
    }


    const { 
    fullName,
    email,
    phone,
    aboutMe,
    password,
    protfolioUrl,
    githubURL,
    instagramURL,
    facebookURL,
    twitterURL,
    linkedinURL,
} = req.body;

const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    protfolioUrl,
    githubURL,
    instagramURL,
    facebookURL,
    twitterURL,
    linkedinURL,
    avatar:{
        public_id: CloudinaryResponseForAvatar.public_id,
        url: CloudinaryResponseForAvatar.secure_url,
    },
    resume:{
        public_id: CloudinaryResponseForResume.public_id,
        url: CloudinaryResponseForResume.secure_url,
    }
});

generateToken(user, "User Registered", 201, res)


});

export const login = catchAsyncErrors(async(req,res,next)=>{
    const{email, password} = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Email and Password Are Required"));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Email or Password"));
    }
    const isPasswordMatched = await user.comparePassword(password)
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password"));
    }
    generateToken(user,"Logged In",200,res)
})

export const logout = catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("token","",{
        expires: new Date(Date.now()),
        httpOnly:true,
    }).json({
        success:true,
        message: "Logged Out"
    })
});

export const getUser = catchAsyncErrors(async(req,res, next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    });
});

export const updateProfile = catchAsyncErrors(async(req,res,next)=>{
    const newUserdata ={
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        aboutMe: req.body.aboutMe,
        protfolioUrl: req.body.protfolioUrl,
        githubURL: req.body.githubURL,
        instagramURL: req.body.instagramURL,
        facebookURL: req.body.facebookURL,
        twitterURL: req.body.twitterURL,
        linkedinURL: req.body.linkedinURL,

    };
    if(req.files && req.files.avatar){
        const avatar = req.files.avatar;
        const user =await User.findById(req.user.id);
        const profileImageId = user.avatar.public_id;
        await cloudinary.uploader.destroy(profileImageId);
        const CloudinaryResponse = await cloudinary.uploader.upload(
            avatar.tempFilePath,
            {folder: "AVATARS"}
        );
        newUserdata.avatar ={
            public_id: CloudinaryResponse.public_id,
            url:CloudinaryResponse.secure_url

        }
    }

    if(req.files && req.files.resume){
        const resume = req.files.resume;
        const user =await User.findById(req.user.id);
        const resumeId = user.resume.public_id;
        await cloudinary.uploader.destroy(resumeId);
        const CloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            {folder: "MY_RESUME"}
        );
        newUserdata.resume ={
            public_id: CloudinaryResponse.public_id,
            url:CloudinaryResponse.secure_url

        }
    }

    const user =await User.findByIdAndUpdate(req.user.id, newUserdata,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success:true,
        message:"Profile Updated Successfully",
        user,
    })
})

export const updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const{currentPassword, newPassword, confirmPassword} =req.body;
    if(!currentPassword|| !newPassword|| !confirmPassword){
        return next(new ErrorHandler("Please fill all fields",400))
    }
    const user =await User.findById(req.user.id).select("+password");
    const isPasswordMatched =await user.comparePassword(currentPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("CurrentPassword doesnot match",400))
    }
    if(newPassword !== confirmPassword){
        return next(new ErrorHandler("NewPassword and ConfirmPassword do not match.",400))

    }
    user.password =newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message:"Password Updated."
    })
})

export const getUserProtfolio = catchAsyncErrors(async(req,res,next)=>{
    const id ="67a308ccf460b006047df5c4";
    const user =await User.findById(id);
    res.status(200).json({
        success:true,
        user,
    })
})

export const forgotPassword =catchAsyncErrors(async(req,res,next)=>{
    const user =await User.findOne({email:req.body.email})
    if(!user){
        return next(new ErrorHandler("User not found!",404))
    }
    const resetToken =user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    // const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/reset-password/${resetToken}`;

    // const resetPasswordUrl = `http://localhost:4200/reset-password/${resetToken}`;  

    const message = `Your reset password Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested for it pkeease ignore it.`;
    try {
        await sendEmail({
            email:user.email,
            subject:"personal protfolio dashboard recovery email",
            message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordExpire =undefined;
        user.resetPasswordToken = undefined;
        await user.save();
        return next(new ErrorHandler(error.message, 500));
        
    }
});

export const resetPassword = catchAsyncErrors(async(req,res,next)=>{
    const {token} =req.params;
    const resetPasswordToken =crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()},
    });
    if(!user){
        return next(
            new ErrorHandler("Reset password token is invalid or has been expired",400)
        )
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password and confirm Password do not match"))
    }
    user.password =req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken =undefined;
    await user.save();
    generateToken(user, "reset password successfully",200,res);
    
})