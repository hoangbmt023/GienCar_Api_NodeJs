const toUserAddressResponse = (address) => ({
  id: address._id,
  street: address.street,
  ward: address.ward,
  district: address.district,
  city: address.city,
});

const toUserProfileResponse = (userProfile) => ({
  id: userProfile._id,
  userId: userProfile.userId,
  fullName: userProfile.fullName,
  description: userProfile.description,
  avatar: userProfile.avatar,
  phoneNumber: userProfile.phoneNumber,
  addresses: (userProfile.addresses ?? []).map(toUserAddressResponse),
});

module.exports = { toUserProfileResponse };
