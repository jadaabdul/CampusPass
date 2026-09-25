const Venue = require("../models/Venue");
const Event = require("../models/Event");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");




// Create Venue

const createVenue = async(req,res,next)=>{

try{


const {
name,
address,
collegeName,
capacity,
facilities,
latitude,
longitude
}=req.body;



const venue =
await Venue.create({

name,
address,
collegeName,
capacity,
facilities,
latitude,
longitude

});



res
.status(201)
.json(
apiResponse(
201,
"Venue created successfully",
venue
)
);



}catch(error){

next(error);

}

};





// Update Venue


const updateVenue = async(req,res,next)=>{

try{


const venue =
await Venue.findByIdAndUpdate(
req.params.id,
req.body,
{
new:true,
runValidators:true
}
);



if(!venue){

throw new ApiError(
404,
"Venue not found"
);

}



res
.status(200)
.json(
apiResponse(
200,
"Venue updated successfully",
venue
)
);



}catch(error){

next(error);

}

};





// Delete Venue


const deleteVenue = async(req,res,next)=>{

try{


const venue =
await Venue.findById(
req.params.id
);



if(!venue){

throw new ApiError(
404,
"Venue not found"
);

}



const event =
await Event.findOne({
venue:req.params.id
});



if(event){

throw new ApiError(
400,
"Venue is used by events"
);

}



await Venue.findByIdAndDelete(
req.params.id
);



res
.status(200)
.json(
apiResponse(
200,
"Venue deleted successfully"
)
);



}catch(error){

next(error);

}

};





// Get All Venues


const getAllVenues = async(req,res,next)=>{

try{


const venues =
await Venue.find({
isActive:true
})
.sort({
createdAt:-1
});



res
.status(200)
.json(
apiResponse(
200,
"Venues fetched successfully",
venues
)
);



}catch(error){

next(error);

}

};





// Get Venue By Id


const getVenueById = async(req,res,next)=>{

try{


const venue =
await Venue.findById(
req.params.id
);



if(!venue){

throw new ApiError(
404,
"Venue not found"
);

}



res
.status(200)
.json(
apiResponse(
200,
"Venue fetched successfully",
venue
)
);



}catch(error){

next(error);

}

};





module.exports={
createVenue,
updateVenue,
deleteVenue,
getAllVenues,
getVenueById
};