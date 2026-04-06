const { body, query } = require("express-validator");

module.exports = {
    // ================= CREATE ORDER =================
    CreateOrderRequestValidator: [
        body("userName")
            .notEmpty()
            .withMessage("Tên người mua không được để trống"),

        body("userPhone")
            .notEmpty()
            .withMessage("Số điện thoại không được để trống")
            .bail()
            .isMobilePhone("vi-VN")
            .withMessage("Số điện thoại không hợp lệ"),

        body("userEmail")
            .notEmpty()
            .withMessage("Email không được để trống")
            .bail()
            .isEmail()
            .withMessage("Email không hợp lệ"),

        body("userAddress")
            .notEmpty()
            .withMessage("Địa chỉ không được để trống"),

        body("description")
            .optional()
            .isString()
            .withMessage("Mô tả phải là chuỗi"),

        // ===== ITEMS =====
        body("items")
            .notEmpty()
            .withMessage("Đơn hàng phải có ít nhất 1 sản phẩm")
            .bail()
            .isArray({ min: 1 })
            .withMessage("items phải là mảng và có ít nhất 1 phần tử"),

        body("items.*.carId")
            .notEmpty()
            .withMessage("carId không được để trống")
            .bail()
            .isMongoId()
            .withMessage("carId không hợp lệ"),

        body("items.*.colorId")
            .notEmpty()
            .withMessage("Mã màu xe không được để trống")
            .bail()
            .isMongoId()
            .withMessage("colorId không hợp lệ"),

        body("items.*.quantity")
            .notEmpty()
            .withMessage("Số lượng không được để trống")
            .bail()
            .isInt({ min: 1 })
            .withMessage("Số lượng phải >= 1"),
    ],

    // ================= CONFIRM ORDER =================
    ConfirmOrderRequestValidator: [
        body("branchId")
            .notEmpty()
            .withMessage("Vui lòng chọn cơ sở nhận xe")
            .bail()
            .isMongoId()
            .withMessage("branchId không hợp lệ"),
    ],

    // ================= FILTER =================
    OrderFilterRequestValidator: [
        query("status")
            .optional()
            .customSanitizer((value) => {
                if (!value) return value;

                const map = {
                    pending: "PENDING",
                    confirmed: "CONFIRMED",
                    cancelled: "CANCELLED",
                };

                return map[value] || value;
            })
            .isIn(["PENDING", "CONFIRMED", "CANCELLED"])
            .withMessage("Status không hợp lệ"),

        query("orderCode")
            .optional()
            .isString()
            .withMessage("orderCode không hợp lệ"),

        query("userPhone")
            .optional()
            .isMobilePhone("vi-VN")
            .withMessage("Số điện thoại không hợp lệ"),
    ],
};