const { body, query } = require("express-validator");
const BannerPosition = require("../../model/banner/enum/banner-position.enum");

module.exports = {
    // ================= CREATE =================
    CreateBannerRequestValidator: [
        body("title")
            .notEmpty()
            .withMessage("Title không được trống"),

        body("description")
            .optional()
            .isString()
            .withMessage("Description phải là chuỗi"),

        // file upload (multer) → chỉ check nếu có
        body("imageFile").optional(),
        body("videoFile").optional(),

        body("ctaText")
            .optional()
            .isString()
            .withMessage("CTA Text phải là chuỗi"),

        body("ctaLink")
            .optional()
            .isString()
            .withMessage("CTA Link phải là chuỗi"),

        body("position")
            .notEmpty()
            .withMessage("Position không được trống")
            .isIn(Object.values(BannerPosition))
            .withMessage("Position không hợp lệ"),

        body("isActive")
            .notEmpty()
            .withMessage("isActive không được trống")
            .isBoolean()
            .withMessage("isActive phải là boolean"),

        body("startDate")
            .notEmpty()
            .withMessage("startDate không được trống")
            .isISO8601()
            .withMessage("startDate không đúng định dạng"),

        body("endDate")
            .notEmpty()
            .withMessage("endDate không được trống")
            .isISO8601()
            .withMessage("endDate không đúng định dạng"),
    ],

    // ================= DELETE =================
    DeleteBannerRequestValidator: [
        body("bannerId")
            .notEmpty()
            .withMessage("BannerId không được trống")
            .bail()
            .isMongoId()
            .withMessage("BannerId không hợp lệ"),
    ],

    // ================= MOVE =================
    MoveBannerRequestValidator: [
        body("bannerId")
            .notEmpty()
            .withMessage("BannerId không được trống")
            .bail()
            .isMongoId()
            .withMessage("BannerId không hợp lệ"),

        body("position")
            .notEmpty()
            .withMessage("Position không được trống")
            .isIn(Object.values(BannerPosition))
            .withMessage("Position không hợp lệ"),

        body("order")
            .notEmpty()
            .withMessage("Order không được trống")
            .isInt({ min: 1 })
            .withMessage("Order phải >= 1"),
    ],

    // ================= GET =================
    GetBannerRequestValidator: [
        query("position")
            .notEmpty()
            .withMessage("Position không được để trống")
            .isIn(Object.values(BannerPosition))
            .withMessage("Position không hợp lệ"),
    ],
};