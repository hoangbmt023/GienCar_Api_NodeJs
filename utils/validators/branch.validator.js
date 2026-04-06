const { body } = require("express-validator");

module.exports = {
    // ================= CREATE =================
    CreateBranchRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Tên cơ sở không được để trống"),

        body("address")
            .notEmpty()
            .withMessage("Địa chỉ không được để trống"),

        body("city")
            .notEmpty()
            .withMessage("Thành phố không được để trống"),

        body("phone")
            .notEmpty()
            .withMessage("Số điện thoại không được để trống")
            .bail()
            .isMobilePhone("vi-VN")
            .withMessage("Số điện thoại không hợp lệ"),

        body("email")
            .notEmpty()
            .withMessage("Email không được để trống")
            .bail()
            .isEmail()
            .withMessage("Email không đúng định dạng"),

        body("mapUrl")
            .optional()
            .isString()
            .withMessage("Map URL phải là chuỗi"),

        body("isActive")
            .notEmpty()
            .withMessage("Trạng thái hoạt động không được null")
            .isBoolean()
            .withMessage("isActive phải là boolean"),
    ],

    // ================= UPDATE =================
    UpdateBranchRequestValidator: [
        body("name")
            .optional()
            .isLength({ min: 1 })
            .withMessage("Tên cơ sở không được rỗng"),

        body("address")
            .optional()
            .isLength({ min: 1 })
            .withMessage("Địa chỉ không được rỗng"),

        body("city")
            .optional()
            .isLength({ min: 1 })
            .withMessage("Thành phố không được rỗng"),

        body("phone")
            .optional()
            .isMobilePhone("vi-VN")
            .withMessage("Số điện thoại không hợp lệ"),

        body("email")
            .optional()
            .isEmail()
            .withMessage("Email không đúng định dạng"),

        body("mapUrl")
            .optional()
            .isString()
            .withMessage("Map URL phải là chuỗi"),

        body("isActive")
            .optional()
            .isBoolean()
            .withMessage("isActive phải là boolean"),
    ],
};