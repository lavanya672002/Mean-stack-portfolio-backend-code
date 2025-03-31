import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/error.js"
import { Project } from "../models/projectSchema.js"
import {v2 as cloudinary}from "cloudinary"

export const addNewProject = catchAsyncErrors(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length===0){
        return next(new ErrorHandler("project banner image required"))
    }
    const {projectBanner} =req.files;
    const { title,
        description,
        gitRepoLink,
        ProjectLink,
        technologies,
        stack,
        deployed,} =req.body;

        console.log(
            title,
        description,
        gitRepoLink,
        ProjectLink,
        technologies,
        stack,
        deployed,
        )

        if(
        !title ||
        !description ||
        !gitRepoLink ||
        !ProjectLink ||
        !technologies ||
        !stack ||
        !deployed
        ){
            return next(new ErrorHandler("please provide all details",400))

        }

        const CloudinaryResponse =await cloudinary.uploader.upload(
            projectBanner.tempFilePath,
        {folder:"PROJECT_IMAGES"}
    );
    if(!CloudinaryResponse || CloudinaryResponse.error){
        console.error("Cloudinary Error:",CloudinaryResponse.error || "Unknown Cloudinary Error" );
        return next(new ErrorHandler("failed to upload projectbanner to cloudinary.",500))
    }
    const project =await Project.create({
        title,
        description,
        gitRepoLink,
        ProjectLink,
        technologies,
        stack,
        deployed,
        projectBanner:{
          public_id:CloudinaryResponse.public_id,
          url:CloudinaryResponse.secure_url,  
        }
    })
    res.status(201).json({
        success:true,
        message:"new project addded",
        project,
    })

});

export const updateProject = catchAsyncErrors(async(req,res,next)=>{
    const newProjectData ={
        title:req.body.title,
        description:req.body.description,
        gitRepoLink:req.body.gitRepoLink,
        ProjectLink:req.body.ProjectLink,
        technologies:req.body.technologies,
        stack:req.body.stack,
        deployed:req.body.deployed,
    };
    if(req.files && req.files.projectBanner){
        const projectBanner = req.files.projectBanner;
        const project =await Project.findById(req.params);
        const projectBannerId = project.projectBanner.public_id;
        await cloudinary.uploader.destroy(projectBannerId);
        const CloudinaryResponse = await cloudinary.uploader.upload(
            projectBanner.tempFilePath,
            {folder: "PROJECT_IMAGES"}
        );
        newProjectData.projectBanner ={
            public_id: CloudinaryResponse.public_id,
            url:CloudinaryResponse.secure_url

        }
    }
    const project =await Project.findByIdAndUpdate(req.params.id, newProjectData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });
    res.status(200).json({
        success:true,
        message:"project updated",
        project,
    })


})

export const deleteProject = catchAsyncErrors(async(req,res,next)=>{
    const {id} =req.params;
    const project =await Project.findById(id);
    if(!project){
        return next(new ErrorHandler("project not found",404))
    }
    await project.deleteOne();
    res.status(200).json({
        success:true,
        message:"project deleted"
    })
})

export const getAllProject = catchAsyncErrors(async(req,res,next)=>{
    const projects =await Project.find();
    res.status(200).json({
        success:true,
        projects,
    })
})

export const getsingleProject = catchAsyncErrors(async(req,res,next)=>{
    const {id} =req.params;
    const project =await Project.findById(id);
    if(!project){
        return next(new ErrorHandler("project not found",404))
    }
    res.status(200).json({
       success:true,
       project, 
    })
})


