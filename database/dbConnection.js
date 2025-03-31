import mongoose  from "mongoose";


const dbConnection = ()=>{
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "NEW_PROTFOLIO"
    }).then(()=>{
        console.log("Connected to database")
    }).catch((error)=>{
        console.log(`Some error occoured while Connecting to Database: ${error}`);
    });
};

export default dbConnection;