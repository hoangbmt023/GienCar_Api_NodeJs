const { body } = require("express-validator");

module.exports = {
  UserLoginRequestValidator: [
    body("email")
      .notEmpty()
      .withMessage("email khong duoc rong")
      .bail()
      .isEmail()
      .withMessage("email sai dinh dang")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("password khong duoc rong")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage("Mật khẩu phải có chữ hoa, chữ thường và số"),
  ],
  RefreshTokenRequestValidator: [
    body("refreshToken")
      .notEmpty()
      .withMessage("Refresh Token không được để trống"),
  ],

  LogoutRequestValidator: [
    body("refreshToken")
      .notEmpty()
      .withMessage("Refresh Token không được để trống"),
  ],

  RevokeTokenRequestValidator: [
    body("refreshToken")
      .notEmpty()
      .withMessage("Refresh Token không được để trống"),
  ],

  SendActivateOtpRequestValidator: [
    body("email")
      .notEmpty()
      .withMessage("email khong duoc rong")
      .bail()
      .isEmail()
      .withMessage("email sai dinh dang")
      .normalizeEmail(),
  ],
  ActivateAccountRequestValidator: [
    body("email")
      .notEmpty()
      .withMessage("email khong duoc rong")
      .bail()
      .isEmail()
      .withMessage("email sai dinh dang")
      .normalizeEmail(),
    body("otp")
      .notEmpty()
      .withMessage("Mã OTP không được để trống")
      .bail()
      .isLength({ min: 6, max: 6 })
      .withMessage("Mã OTP phải có đúng 6 ký tự")
      .bail()
      .matches(/^[a-zA-Z0-9]{6}$/)
      .withMessage("Mã OTP phải là chuỗi gồm 6 ký tự chữ hoặc số"),
  ],
  ForgotPasswordRequestValidator: [
    body("email")
      .notEmpty()
      .withMessage("email khong duoc rong")
      .bail()
      .isEmail()
      .withMessage("email sai dinh dang")
      .normalizeEmail(),
  ],
  VerifyForgotPasswordRequestValidator: [
    body("email")
      .notEmpty()
      .withMessage("email khong duoc rong")
      .bail()
      .isEmail()
      .withMessage("email sai dinh dang")
      .normalizeEmail(),
    body("otp")
      .notEmpty()
      .withMessage("Mã OTP không được để trống")
      .bail()
      .isLength({ min: 6, max: 6 })
      .withMessage("Mã OTP phải có đúng 6 ký tự")
      .bail()
      .matches(/^[a-zA-Z0-9]{6}$/)
      .withMessage("Mã OTP phải là chuỗi gồm 6 ký tự chữ hoặc số"),
  ],
  ResetPasswordRequestValidator: [
    body("email")
      .notEmpty()
      .withMessage("email khong duoc rong")
      .bail()
      .isEmail()
      .withMessage("email sai dinh dang")
      .normalizeEmail(),
    body("otp")
      .notEmpty()
      .withMessage("Mã OTP không được để trống")
      .bail()
      .isLength({ min: 6, max: 6 })
      .withMessage("Mã OTP phải có đúng 6 ký tự")
      .bail()
      .matches(/^[a-zA-Z0-9]{6}$/)
      .withMessage("Mã OTP phải là chuỗi gồm 6 ký tự chữ hoặc số"),
    body("newPassword")
      .notEmpty()
      .withMessage("password khong duoc rong")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage("Mật khẩu phải có chữ hoa, chữ thường và số"),
    body("logoutAllDevices")
      .optional()
      .isBoolean()
      .withMessage("logoutAllDevices phải là boolean"),
  ],
};

