const { default: mongoose } = require("mongoose");
const userAddressSchema = require("./user-address.schema");

const UserProfileSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // 👈 nên dùng ObjectId
    ref: "user",
    required: true,
  },
  fullName: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  addresses: {
    type: [userAddressSchema],
    default: [],
  },
});

module.exports = mongoose.model("user_profile", UserProfileSchema);
