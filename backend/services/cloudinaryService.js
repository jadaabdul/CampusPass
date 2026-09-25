const cloudinary = require("../configs/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = async (file, folder = "campuspass") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

module.exports = {
  uploadToCloudinary,
};
