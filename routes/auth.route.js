var express = require("express");
const resultNoData = require("../untils/results/result-nodata");
const resultDTO = require("../untils/results/result.dto");
const jwtUntil = require("../untils/jwt/jwt.util");
const generatorOtp = require("../untils/otp/otp-generator.util");
const otpModel = require("../model/otp");
const otpMemory = require("../untils/cache/otp-memory-store");
const otpRateLimiter = require("../untils/otp/otp-rate-limiter");
const sendEmail = require("../untils/email.util");
const {
  UserLoginRequestValidator,
  RefreshTokenRequestValidator,
  LogoutRequestValidator,
  RevokeTokenRequestValidator,
  SendActivateOtpRequestValidator,
  ActivateAccountRequestValidator,
  ForgotPasswordRequestValidator,
  VerifyForgotPasswordRequestValidator,
  ResetPasswordRequestValidator,
} = require("../untils/validators/user/auth.validator");
const validateResult = require("../untils/validators/validate-result");
const AuthController = require("../controllers/auth.controller");
const ApiError = require("../untils/errors/api-error");
const UserController = require("../controllers/user.controller");
const { CheckLogin, CheckRole } = require("../untils/authHandler");
var router = express.Router();

router.post(
  "/login",
  UserLoginRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { email, password } = req.body;
      let login = await AuthController.login(email, password);

      let refresh = await AuthController.createRefreshToken(email);
      let data = {
        accessToken: login,
        refreshToken: refresh,
      };
      res.status(200).send(resultDTO.success(data, "Đăng nhập thành công"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

router.post(
  "/refresh-token",
  RefreshTokenRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { refreshToken } = req.body;

      let decoded;
      try {
        decoded = jwtUntil.verifyRefreshToken(refreshToken);
      } catch (err) {
        throw ApiError.unauthorized("Token không hợp lệ");
      }

      let userId = decoded.sub;

      let tokenDoc = await AuthController.findRefreshTokenByToken(refreshToken);
      if (!tokenDoc) {
        throw ApiError.notFound("Refresh token không tồn tại");
      }

      if (tokenDoc.expiryDate < new Date()) {
        await AuthController.deleteOneRefreshToken(tokenDoc._id);
        throw ApiError.unauthorized("Refresh token đã hết hạn");
      }

      let user = await UserController.findById(userId);
      if (!user) {
        throw ApiError.notFound("User không tồn tại");
      }

      if (user.status !== "ACTIVE") {
        throw ApiError.forbidden("Tài khoản không hợp lệ");
      }

      let accessToken = jwtUntil.generateToken(user);

      let data = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      res.status(200).send(resultDTO.success(data, "Đăng nhập thành công"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

router.post(
  "/logout",
  LogoutRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { refreshToken } = req.body;

      let token = await AuthController.findRefreshTokenByToken(refreshToken);
      if (!token) {
        throw ApiError.notFound("Refresh token không tồn tại");
      }

      await AuthController.deleteOneRefreshToken(token._id);
      res.status(200).send(resultNoData.success("Đăng xuất thành công"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

router.post(
  "/revoke-token",
  CheckLogin,
  CheckRole("ADMIN"),
  RevokeTokenRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { refreshToken } = req.body;

      let token = await AuthController.findRefreshTokenByToken(refreshToken);
      if (!token) {
        throw ApiError.notFound("Refresh token không tồn tại");
      }

      await AuthController.deleteOneRefreshToken(token._id);
      res
        .status(200)
        .send(resultNoData.success("Refresh token đã được thu hồi thành công"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

router.post(
  "/send-activate-otp",
  SendActivateOtpRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { email } = req.body;

      let user = await UserController.findByEmail(email);

      if (user.status !== "PENDING") {
        throw ApiError.badRequest("Tài khoản đã được kích hoạt.");
      }

      if (!otpRateLimiter.canSend(user.email)) {
        throw ApiError.badRequest("Vui lòng đợi 1 phút trước khi gửi lại OTP");
      }

      let otpCode = generatorOtp.generateOtp(6);

      let otp = otpModel.createOtp(otpCode, 300);

      otpMemory.save(user.email, otp);

      sendEmail.sendOtpEmail(user.email, otp);

      otpRateLimiter.recordSend(user.email);

      res
        .status(200)
        .send(resultNoData.success("OTP kích hoạt đã được gửi đến email"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

router.post(
  "/activate-account",
  ActivateAccountRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { email, otp } = req.body;

      let user = await UserController.findByEmail(email);

      let otpLocal = otpMemory.get(user.email);

      if (!otpLocal) {
        throw ApiError.badRequest("OTP không hợp lệ hoặc đã hết hạn");
      }

      otpModel.verifyOtp(otpLocal, otp);

      otpMemory.remove(user.email);

      await UserController.saveUser(user._id, {
        status: "ACTIVE",
      });

      res
        .status(200)
        .send(resultNoData.success("kích hoạt tài khoản thành công"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

router.post(
  "/forgot-password",
  ForgotPasswordRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { email } = req.body;

      let user = await UserController.findByEmail(email);

      if (user.status !== "ACTIVE") {
        throw ApiError.badRequest(
          "Tài khoản chưa được kích hoạt hoặc bị khóa.",
        );
      }

      if (!otpRateLimiter.canSend(user.email)) {
        throw ApiError.badRequest("Vui lòng đợi 1 phút trước khi gửi lại OTP");
      }

      let otpCode = generatorOtp.generateOtp(6);

      let otp = otpModel.createOtp(otpCode, 300);

      otpMemory.save(user.email, otp);

      sendEmail.sendOtpEmail(user.email, otp);

      otpRateLimiter.recordSend(user.email);

      res
        .status(200)
        .send(resultNoData.success("OTP Quên mật khẩu đã được gửi đến email"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

router.post(
  "/verify-forgot-password",
  VerifyForgotPasswordRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { email, otp } = req.body;

      let user = await UserController.findByEmail(email);

      let otpLocal = otpMemory.get(user.email);
      if (!otpLocal) {
        throw ApiError.badRequest("OTP không hợp lệ hoặc đã hết hạn");
      }

      otpModel.verifyOtp(otpLocal, otp);

      res.status(200).send(resultNoData.success("OTP quên mật khẩu hợp lệ"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

router.post(
  "/reset-password",
  ResetPasswordRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let { email, otp, newPassword, logoutAllDevices } = req.body;

      let user = await UserController.findByEmail(email);

      let otpLocal = otpMemory.get(user.email);

      if (!otpLocal) {
        throw ApiError.badRequest("OTP không hợp lệ hoặc đã hết hạn");
      }

      otpModel.verifyOtp(otpLocal, otp);

      otpMemory.remove(user.email);

      await UserController.saveUser(user._id, {
        status: "ACTIVE",
      });

      await UserController.changePassword(user, newPassword);

      if (logoutAllDevices) {
        await AuthController.deleteAllRefreshByUserId(user._id);
      }
      res
        .status(200)
        .send(resultNoData.success("Đổi mật khẩu cho tài khoản thành công"));
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

module.exports = router;
