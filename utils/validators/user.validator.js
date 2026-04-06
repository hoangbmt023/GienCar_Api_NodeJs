const { body } = require("express-validator");
const { query } = require("express-validator");

module.exports = {
  UserRegisterRequestValidator: [
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

  UserFilterRequestValidator: [
    query("email"),
    query("status").optional().isIn(["active", "pending", "banned"]),
    query("role").optional().isIn(["admin", "user", "sale"]),
  ],

  UpdateUserProfileRequestValidator: [
    body("fullName")
      .isLength({ min: 2, max: 100 })
      .withMessage("Họ tên phải từ 2 đến 100 ký tự"),
    body("phoneNumber")
      .optional()
      .isMobilePhone("vi-VN")
      .withMessage("Số điện thoại không hợp lệ"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Mô tả không được quá 500 ký tự"),
  ],
  AddressRequestValidator: [
    body("street").notEmpty().withMessage("Đường/số nhà không được để trốngg"),
    body("ward").notEmpty().withMessage("Phường/xã không được để trống"),
    body("district").notEmpty().withMessage("Quận/huyện không được để trống"),
    body("city").notEmpty().withMessage("Tỉnh/thành phố không được để trống"),
  ],
  UpdateRolesRequestValidator: [
    body("roles")
      .exists()
      .withMessage("roles là bắt buộc")
      .bail()
      .isArray({ min: 1 })
      .withMessage("roles phải là mảng và không được rỗng"),
  ],
};
