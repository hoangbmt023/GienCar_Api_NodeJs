const { body } = require("express-validator");

module.exports = {
    // ================= CREATE =================
    CreateCarSeriesRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Name không được để trống")
            .bail()
            .isLength({ min: 2, max: 100 })
            .withMessage("Tên phải từ 2-100 ký tự"),

        body("description")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Mô tả tối đa 500 ký tự"),

        body("brandId")
            .notEmpty()
            .withMessage("BrandId không được để trống")
            .bail()
            .isMongoId()
            .withMessage("BrandId không hợp lệ"),

        body("priceFrom")
            .notEmpty()
            .withMessage("Giá không được để trống")
            .bail()
            .isInt({ gt: 0 })
            .withMessage("Giá phải lớn hơn 0"),

        body("highlight")
            .optional()
            .isBoolean()
            .withMessage("highlight phải là boolean"),

        // file upload
        body("imageFile").optional(),
    ],

    // ================= UPDATE =================
    UpdateCarSeriesRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Name không được để trống")
            .bail()
            .isLength({ min: 2, max: 100 })
            .withMessage("Tên phải từ 2-100 ký tự"),

        body("description")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Mô tả tối đa 500 ký tự"),

        body("brandId")
            .notEmpty()
            .withMessage("BrandId không được để trống")
            .bail()
            .isMongoId()
            .withMessage("BrandId không hợp lệ"),

        body("priceFrom")
            .notEmpty()
            .withMessage("Giá không được để trống")
            .bail()
            .isInt({ gt: 0 })
            .withMessage("Giá phải lớn hơn 0"),

        body("orderIndex")
            .notEmpty()
            .withMessage("OrderIndex không được để trống")
            .isInt({ min: 0 })
            .withMessage("OrderIndex phải >= 0"),

        body("highlight")
            .optional()
            .isBoolean()
            .withMessage("highlight phải là boolean"),

        body("imageFile").optional(),
    ],

    // ================= MOVE =================
    MoveCarSeriesRequestValidator: [
        body("id")
            .notEmpty()
            .withMessage("Id không được để trống")
            .bail()
            .isMongoId()
            .withMessage("Id không hợp lệ"),

        body("newIndex")
            .notEmpty()
            .withMessage("Index không được để trống")
            .bail()
            .isInt({ min: 0 })
            .withMessage("Index mới phải lớn hơn hoặc bằng 0"),
    ],
};