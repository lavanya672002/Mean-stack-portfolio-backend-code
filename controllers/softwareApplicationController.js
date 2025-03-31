import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js"
import {softwareAppliaction} from "../models/softwareApplicationSchema.js";
import {v2 as cloudinary} from "cloudinary"

export const addNewApplication = catchAsyncErrors(async(req,res,next)=>{
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Software appliaction Icon/svg Required!",400));
    } 
    const {svg} = req.files;
    const {name} =req.body;

    if(!name){
        return next(new ErrorHandler("Software's name is required",400))
    }
    // console.log("AVATAR",avatar)
    const CloudinaryResponse = await cloudinary.uploader.upload(
        svg.tempFilePath,
        {folder: "PROTFOLIO_SOFTWARE_APPLIACTION"}
    );
    if(!CloudinaryResponse || CloudinaryResponse.error){
        console.error("Cloudinary Error:",CloudinaryResponse.error || "Unknown Cloudinary Error" )
    }

    const newsoftwareAppliaction =await softwareAppliaction.create({
        name,
        svg:{
            public_id:CloudinaryResponse.public_id,
            url:CloudinaryResponse.secure_url,
        }
    })
    res.status(200).json({
        success:true,
        message:"new software appliaction added.",
        softwareAppliaction:newsoftwareAppliaction,
    })
})
export const deleteApplication = catchAsyncErrors(async(req,res,next)=>{
    const {id} =req.params;
    const existingSoftwareApplication = await softwareAppliaction.findById(id);
    if(!existingSoftwareApplication){
        return next(new ErrorHandler("software appliaction not found",404))
    }
    const softwareAppliactionSvgId =existingSoftwareApplication.svg.public_id;
    await cloudinary.uploader.destroy(softwareAppliactionSvgId);
    await existingSoftwareApplication.deleteOne();
    res.status(200).json({
        success:true,
        message:"software appliaction deleted",
    })
})
export const getAllApplication = catchAsyncErrors(async(req,res,next)=>{
    const AllsoftwareAppliactions =await softwareAppliaction.find();
    res.status(200).json({
        success:true,
        AllsoftwareAppliactions,
    })
})