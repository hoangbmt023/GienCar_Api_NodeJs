const { body } = require("express-validator");

module.exports = {
    CreateMenuRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Name menu không được để trống"),

        body("locale")
            .isArray({ min: 1 })
            .withMessage("Locale không được để trống"),

        body("type")
            .isArray({ min: 1 })
            .withMessage("Type không được để trống"),

        body("target")
            .isArray({ min: 1 })
            .withMessage("Target không được để trống"),

        body("parentId")
            .optional({ values: "falsy" })
            .isMongoId()
            .withMessage("parentId không hợp lệ"),
    ],

    DeleteMenuRequestValidator: [
        body("id")
            .notEmpty()
            .withMessage("Id menu không được để trống")
            .bail()
            .isMongoId()
            .withMessage("Id không hợp lệ"),
    ],

    MoveMenuRequestValidator: [
        body("menuId")
            .notEmpty()
            .withMessage("MenuId không được để trống")
            .bail()
            .isMongoId()
            .withMessage("MenuId không hợp lệ"),

        body("newIndex")
            .isInt({ min: 1 })
            .withMessage("newIndex phải >= 1"),
    ],
};