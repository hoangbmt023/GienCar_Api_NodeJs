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
};
