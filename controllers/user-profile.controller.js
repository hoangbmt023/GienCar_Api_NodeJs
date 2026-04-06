let userProfileModel = require("../schemas/user-profile.schema");
let userAddressModel = require("../schemas/user-address.schema");
const ApiError = require("../utils/errors/api-error");
const { Types } = require("mongoose");

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

  saveUserAddress: async function (userProfile, addressesInput, session) {
    if (!userProfile) {
      throw ApiError.notFound("User profile không tồn tại");
    }

    const addressList = Array.isArray(addressesInput)
      ? addressesInput
      : [addressesInput];

    const newAddresses = addressList.map((addr) => ({
      _id: addr.id ? addr.id : new Types.ObjectId(),
      street: addr.street,
      ward: addr.ward,
      district: addr.district,
      city: addr.city,
    }));

    if (!userProfile.addresses) {
      userProfile.addresses = [];
    }
    // ... để newAddresses bị lồng array
    userProfile.addresses.push(...newAddresses);

    await userProfile.save({ session });

    return userProfile;
  },

  updateUserAddress: async function (
    userProfile,
    addressId,
    addressesInput,
    session,
  ) {
    if (!userProfile) {
      throw ApiError.notFound("User profile không tồn tại");
    }

    const address = userProfile.addresses?.find(
      (a) => a._id.toString() === addressId,
    );

    if (!address) {
      throw ApiError.notFound("Địa chỉ không tồn tại");
    }

    // update field (giống Object.assign bên bạn)
    address.street = addressesInput.street ?? address.street;
    address.ward = addressesInput.ward ?? address.ward;
    address.district = addressesInput.district ?? address.district;
    address.city = addressesInput.city ?? address.city;

    await userProfile.save({ session });

    return userProfile;
  },

  deleteUserAddress: async function (userProfile, addressId, session) {
    if (!userProfile) {
      throw ApiError.notFound("User profile không tồn tại");
    }

    const index = userProfile.addresses?.findIndex(
      (a) => a._id.toString() === addressId,
    );

    if (index === -1) {
      throw ApiError.notFound("Địa chỉ không tồn tại");
    }

    // array splice: remove phần tử tại vị trí index  (vị trí bắt đầu xóa, số phần tử cần xóa)
    userProfile.addresses.splice(index, 1);

    await userProfile.save({ session });

    return userProfile;
  },
};

module.exports = UserProfileController;
