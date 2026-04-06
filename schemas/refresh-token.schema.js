const { default: mongoose } = require("mongoose");

const RefreshTokenSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // 👈 nên dùng ObjectId
    ref: "user",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiryDate: {
    type: Date,
    required: true,
    index: { expires: 0 } // auto xóa token khi hết hạn
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("refresh_token", RefreshTokenSchema);
