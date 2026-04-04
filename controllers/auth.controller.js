let userModel = require("../schemas/user.schema");
let refreshTokenModel = require("../schemas/refresh-token.schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../untils/errors/api-error");
const {
  generateToken,
  generateRefreshToken,
} = require("../untils/jwt/jwt.util");

const MAX_REFRESH_TOKEN = 5;

const AuthController = {
  login: async function (email, password) {
    email = email.toLowerCase().trim();

    const user = await userModel.findOne({ email });
    if (!user) {
      throw ApiError.unauthorized("Tài khoản hoặc mật khẩu không đúng");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized("Tài khoản hoặc mật khẩu không đúng");
    }
    if (user.status === "BANNED") {
      throw ApiError.forbidden("Tài khoản đã bị khóa");
    }

    if (user.status !== "ACTIVE") {
      throw ApiError.forbidden("Tài khoản chưa kích hoạt");
    }
    const token = generateToken(user);

    return token;
  },

  createRefreshToken: async function (email) {
    const user = await userModel.findOne({ email });
    if (!user) {
      throw ApiError.notFound("Email không tồn tại");
    }

    const token = generateRefreshToken(user._id);

    const decoded = jwt.decode(token);
    const expiryDate = new Date(decoded.exp * 1000);

    const count = await refreshTokenModel.countDocuments({ userId: user._id });

    if (count >= MAX_REFRESH_TOKEN) {
      const oldest = await refreshTokenModel
        .findOne({ userId: user._id })
        .sort({ createdAt: 1 });

      if (oldest) {
        await refreshTokenModel.deleteOne({ _id: oldest._id });
      }
    }

    let refresh = new refreshTokenModel({
      userId: user._id,
      token: token,
      expiryDate: expiryDate,
    });

    await refresh.save();

    return token;
  },

  findRefreshTokenByToken: async function (token) {
    let refreshToken = await refreshTokenModel.findOne({ token });
    return refreshToken;
  },

  deleteOneRefreshToken: async function (tokenId) {
    await refreshTokenModel.deleteOne({ _id: tokenId });
  },

  deleteAllRefreshByUserId: async function (userId) {
    await refreshTokenModel.deleteMany({ userId });
  },
};

module.exports = AuthController;
