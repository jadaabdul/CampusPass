const Category = require("../models/Category");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

const cloudinary = require("../configs/cloudinary");

const {
  uploadToCloudinary,
} = require("../services/cloudinaryService");


// CREATE CATEGORY

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;


    const existingCategory =
      await Category.findOne({ name });


    if (existingCategory) {
      throw new ApiError(
        400,
        "Category already exists"
      );
    }


    let icon = {
      url: "",
      publicId: "",
    };


    if (req.file) {

      const result =
        await uploadToCloudinary(
          req.file,
          "campuspass/categories"
        );


      icon = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }


    const category =
      await Category.create({
        name,
        icon,
      });


    res.status(201).json(
      apiResponse(
        201,
        "Category created successfully",
        category
      )
    );


  } catch(error) {
    next(error);
  }
};




// UPDATE CATEGORY

const updateCategory = async (
  req,
  res,
  next
) => {

  try {

    const { id } = req.params;

    const { name } = req.body;


    const category =
      await Category.findById(id);


    if(!category){
      throw new ApiError(
        404,
        "Category not found"
      );
    }



    if(name){
      category.name = name;
    }



    if(req.file){


      // delete old image

      if(
        category.icon &&
        category.icon.publicId
      ){

        await cloudinary.uploader.destroy(
          category.icon.publicId
        );

      }



      // upload new image

      const result =
        await uploadToCloudinary(
          req.file,
          "campuspass/categories"
        );



      category.icon = {

        url:
          result.secure_url,

        publicId:
          result.public_id,

      };

    }



    await category.save();



    res.status(200).json(

      apiResponse(
        200,
        "Category updated successfully",
        category
      )

    );


  } catch(error){

    next(error);

  }

};




// DELETE CATEGORY


const deleteCategory = async (
  req,
  res,
  next
)=>{

  try{

    const {id}=req.params;


    const category =
      await Category.findById(id);



    if(!category){

      throw new ApiError(
        404,
        "Category not found"
      );

    }



    // delete cloudinary image

    if(
      category.icon &&
      category.icon.publicId
    ){

      await cloudinary.uploader.destroy(
        category.icon.publicId
      );

    }



    await Category.findByIdAndDelete(id);



    res.status(200).json(

      apiResponse(
        200,
        "Category deleted successfully"
      )

    );


  }catch(error){

    next(error);

  }

};




// GET ALL CATEGORY


const getAllCategories = async (
 req,
 res,
 next
)=>{

 try{


  const page =
    Math.max(
      Number(req.query.page) || 1,
      1
    );


  const limit =
    Math.max(
      Number(req.query.limit) || 10,
      1
    );


  const search =
    req.query.search?.trim() || "";



  const skip =
    (page - 1) * limit;



  const filter={};



  if(search){

    filter.name={
      $regex:search,
      $options:"i",
    };

  }



  const [
    categories,
    totalCategories
  ] =
  await Promise.all([


    Category.find(filter)
    .sort({
      createdAt:-1
    })
    .skip(skip)
    .limit(limit),



    Category.countDocuments(filter)

  ]);



  res.status(200).json(

    apiResponse(
      200,
      "Categories fetched successfully",
      {

        categories,

        pagination:{

          page,

          limit,

          totalCategories,

          totalPages:
            Math.ceil(
              totalCategories / limit
            ),

        }

      }
    )

  );



 }catch(error){

   next(error);

 }

};




// GET SINGLE CATEGORY


const getCategoryById = async(
 req,
 res,
 next
)=>{

 try{


  const category =
    await Category.findById(
      req.params.id
    );


  if(!category){

    throw new ApiError(
      404,
      "Category not found"
    );

  }


  res.status(200).json(

    apiResponse(
      200,
      "Category fetched successfully",
      category
    )

  );


 }catch(error){

   next(error);

 }

};



module.exports = {

 createCategory,

 updateCategory,

 deleteCategory,

 getAllCategories,

 getCategoryById,

};