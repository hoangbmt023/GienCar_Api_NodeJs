const { body } = require("express-validator");

module.exports = {
    // ================= CREATE =================
    CreateBrandRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Tên thương hiệu không được để trống"),

        body("country")
            .notEmpty()
            .withMessage("Quốc gia không được để trống"),

        // file upload (multer)
        body("logoFile").optional(),
    ],

    // ================= UPDATE =================
    UpdateBrandRequestValidator: [
        body("name")
            .optional()
            .isLength({ min: 1 })
            .withMessage("Tên thương hiệu không được rỗng"),

        body("country")
            .optional()
            .isLength({ min: 1 })
            .withMessage("Quốc gia không được rỗng"),

        body("logoFile").optional(),
    ],
};