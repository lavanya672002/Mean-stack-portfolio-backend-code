import mongoose from "mongoose";

const projectSchema =new mongoose.Schema({
    title:String,
    description:String,
    gitRepoLink:String,
    ProjectLink:String,
    technologies:String,
    stack:String,
    deployed:String,
    projectBanner:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    }
})

export const Project =mongoose.model("project",projectSchema);