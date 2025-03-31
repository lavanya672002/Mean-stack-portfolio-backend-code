import mongoose  from "mongoose";

const softwareAppliactionSchema = new mongoose.Schema({
    name:String,
    svg:{
        public_id:{
            type:String,
            required:true
        },
        url:{ 
            type:String,
            required:true
        }
    }
});

export const softwareAppliaction =mongoose.model("softwareAppliaction",softwareAppliactionSchema)