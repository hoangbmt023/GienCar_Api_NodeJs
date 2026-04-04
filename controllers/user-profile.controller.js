let userProfileModel = require("../schemas/user-profile.schema");

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
    await userProfile.populate('userId');
    return userProfile;
  },
};

module.exports = UserProfileController;
