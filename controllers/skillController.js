import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js"
import {skill} from "../models/skillSchema.js";
import {v2 as cloudinary} from "cloudinary"


export const addNewSkill = catchAsyncErrors(async(req,res,next)=>{
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Skill svg Required!",400));
    } 
    const {svg} = req.files;
    const {title,proficiency} =req.body;
    if(!title || !proficiency){
        return next(new ErrorHandler("please fill full form",400))
    }

   
    // console.log("AVATAR",avatar)
    const CloudinaryResponse = await cloudinary.uploader.upload(
        svg.tempFilePath,
        {folder: "PROTFOLIO_SKILLS_SVG"}
    );
    if(!CloudinaryResponse || CloudinaryResponse.error){
        console.error("Cloudinary Error:",CloudinaryResponse.error || "Unknown Cloudinary Error" )
    }

    const Skill = await skill.create({title,proficiency,svg:{
        public_id:CloudinaryResponse.public_id,
        url:CloudinaryResponse.secure_url,
    }});
    res.status(200).json({
        success:true,
        message:"new skill added",
        Skill,
    })

})

export const deleteSkill = catchAsyncErrors(async(req,res,next)=>{
    const {id} =req.params;
    const dskill = await skill.findById(id);
    if(!dskill){
        return next(new ErrorHandler("skill not found",404))
    }
    const skillSvgId =dskill.svg.public_id;
    await cloudinary.uploader.destroy(skillSvgId);
    await dskill.deleteOne();
    res.status(200).json({
        success:true,
        message:"skill deleted",
    })
})

export const updateSkill = catchAsyncErrors(async(req,res,next)=>{
    const {id} =req.params;
    let uskill = await skill.findById(id);
    if(!uskill){
        return next(new ErrorHandler("skill not found",404))
    }
    const {proficiency} = req.body;
    uskill =await skill.findByIdAndUpdate(id, {proficiency}, {
        new:true,
        runValidators:true,
        userFindAndModify:false,
    });
    res.status(200).json({
        success:true,
        message:"skill is updated successfully",
        skill:uskill,
    })
})

export const getAllSkills = catchAsyncErrors(async(req,res,next)=>{
    const allSkills =await skill.find();
    res.status(200).json({
        success:true,
        skills:allSkills,
    })
})
