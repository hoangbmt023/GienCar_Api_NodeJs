const cloudinary = require("../config/cloudinary");
const ApiError = require("./errors/api-error");
const streamifier = require("streamifier");

const DEFAULT_ROOT_FOLDER = "giencar";

const upload = async (file, folder = "default", resourceType = "image") => {
  if (!file || !file.buffer) {
    throw ApiError.badRequest("File không hợp lệ");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${DEFAULT_ROOT_FOLDER}/${folder}/${resourceType}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(ApiError.badRequest("Upload thất bại"));
        }

        if (!result || !result.secure_url) {
          return reject(ApiError.badRequest("Upload thất bại: không có URL"));
        }

        resolve(result.secure_url);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

const extractPublicIdFromUrl = (url) => {
  if (!url) return null;

  const startIndex = url.indexOf("giencar");

  if (startIndex === -1) return null;

  let path = url.substring(startIndex);

  const dotIndex = path.lastIndexOf(".");
  if (dotIndex !== -1) {
    path = path.substring(0, dotIndex);
  }

  return path;
};

const deleteByUrl = async (url, resourceType = "image") => {
  const publicId = extractPublicIdFromUrl(url);

  if (!publicId) {
    throw ApiError.badRequest("URL không hợp lệ.");
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

module.exports = {
  upload,
  deleteByUrl,
};
