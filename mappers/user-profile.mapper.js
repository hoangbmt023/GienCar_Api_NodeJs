const toUserProfileResponse = (userProfile) => ({
  id: userProfile._id,
  userId: userProfile.userId,
  fullName: userProfile.fullName,
  description: userProfile.description,
  avatar: userProfile.avatar,
  phoneNumber: userProfile.phoneNumber,
  addresses: userProfile.addresses ?? [],

});


module.exports = { toUserProfileResponse };
