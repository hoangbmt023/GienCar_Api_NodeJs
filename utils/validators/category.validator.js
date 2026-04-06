const { body } = require("express-validator");

module.exports = {
    // ================= CREATE =================
    CreateCategoryRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Name không được để trống"),

        body("description")
            .optional()
            .isString()
            .withMessage("Description phải là chuỗi"),
    ],

    // ================= UPDATE =================
    UpdateCategoryRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Name không được để trống"),

        body("description")
            .optional()
            .isString()
            .withMessage("Description phải là chuỗi"),
    ],
};