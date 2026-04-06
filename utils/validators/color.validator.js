const { body } = require("express-validator");

module.exports = {
    // ================= CREATE =================
    CreateColorRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Tên màu không được để trống")
            .bail()
            .isLength({ min: 2, max: 100 })
            .withMessage("Tên màu từ 2-100 ký tự"),

        body("description")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Mô tả màu tối đa 500 ký tự"),

        // file upload
        body("imageFile").optional(),
    ],

    // ================= UPDATE =================
    UpdateColorRequestValidator: [
        body("name")
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage("Tên màu từ 2-100 ký tự"),

        body("description")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Mô tả màu tối đa 500 ký tự"),

        body("imageFile").optional(),
    ],
};