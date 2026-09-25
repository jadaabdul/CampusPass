const mongoose = require("mongoose");


const venueSchema = new mongoose.Schema(
{

    name:{
        type:String,
        required:true,
        trim:true,
    },


    address:{
        type:String,
        required:true,
        trim:true,
    },


    collegeName:{
        type:String,
        required:true,
        trim:true,
    },


    capacity:{
        type:Number,
        required:true,
    },


    facilities:[
        {
            type:String,
        }
    ],


    latitude:{
        type:Number,
    },


    longitude:{
        type:Number,
    },


    isActive:{
        type:Boolean,
        default:true,
    }

},
{
    timestamps:true,
}
);


module.exports =
mongoose.model(
"Venue",
venueSchema
);