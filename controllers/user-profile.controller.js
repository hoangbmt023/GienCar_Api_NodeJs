let userProfileModel = require("../schemas/user-profile.schema");
const ApiError = require("../utils/errors/api-error");

const UserProfileController = {
  createUserProfile: async function (
    userId,
    fullName,
    description,
    avatar,
    phoneNumber,
    addresses,
    session,
  ) {
    let userProfile = new userProfileModel({
      userId: userId,
      fullName: fullName,
      description: description,
      avatar: avatar,
      phoneNumber: phoneNumber,
      addresses: addresses,
    });

    await userProfile.save({ session });
    await userProfile.populate("userId");
    return userProfile;
  },
  existsByPhoneNumberAndUserIdNot: async function (phoneNumber, userId) {
    return await userProfileModel.exists({
      phoneNumber: phoneNumber,
      userId: { $ne: userId }, // not equal (không bằng) khác với giá trị này
    });
  },
  saveUserProfile: async function (userId, data, session) {
    let userProfile = await userProfileModel
      .findOne({ userId: userId })
      .session(session);

    if (!userProfile) {
      throw ApiError.badRequest("Hồ sơ người dùng không tồn tại.");
    }

    // Update fields
    Object.assign(userProfile, data);

    await userProfile.save({ session });
    
    return userProfile;
  },
  findByUserId: async function (userId) {
    let userProfile = await userProfileModel.findOne({ userId: userId });
    if (!userProfile) {
      throw ApiError.notFound("Profile không tồn tại");
    }

    return userProfile;
  },
};

module.exports = UserProfileController;
