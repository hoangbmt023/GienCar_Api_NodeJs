const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const Role = require("../model/users/enum/role.enum");
const UserStatus = require("../model/users/enum/user-status.enum");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Mật khẩu mã hóa là bắt buộc"],
    },
    roles: {
      type: [String],
      enum: Object.values(Role),
      default: [Role.USER],
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", function () {
  if (this.isModified("password")) {
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }
});

module.exports = mongoose.model("user", UserSchema);
