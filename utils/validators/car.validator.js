const { body, query } = require("express-validator");

module.exports = {
    // ================= CREATE =================
    CreateCarRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Tên xe không được để trống")
            .bail()
            .isLength({ min: 2, max: 150 })
            .withMessage("Tên phải từ 2-150 ký tự"),

        body("categoryId")
            .notEmpty()
            .withMessage("CategoryId không được để trống")
            .bail()
            .isMongoId()
            .withMessage("CategoryId không hợp lệ"),

        body("price")
            .notEmpty()
            .withMessage("Giá không được để trống")
            .bail()
            .isInt({ gt: 0 })
            .withMessage("Giá phải lớn hơn 0"),

        body("quantity")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("Số lượng phải lớn hơn 0"),

        body("brandIds")
            .optional()
            .customSanitizer((value) => {
                if (!value) return [];
                return Array.isArray(value) ? value : [value];
            }),

        body("brandIds.*")
            .optional()
            .isMongoId()
            .withMessage("brandId không hợp lệ"),

        body("depositPercentage")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Deposit phải là số"),

        body("yearProduce")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("Năm sản xuất không hợp lệ"),

        body("seriesId")
            .notEmpty()
            .withMessage("SeriesId không được để trống")
            .bail()
            .isMongoId()
            .withMessage("SeriesId không hợp lệ"),

        body("description")
            .optional()
            .isLength({ max: 2000 })
            .withMessage("Mô tả tối đa 2000 ký tự"),

        body("imageFiles").optional(),
    ],

    // ================= UPDATE =================
    UpdateCarRequestValidator: [
        body("name")
            .optional()
            .isLength({ min: 2, max: 150 })
            .withMessage("Tên phải từ 2-150 ký tự"),

        body("categoryId")
            .optional()
            .isMongoId()
            .withMessage("CategoryId không hợp lệ"),

        body("price")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("Giá phải lớn hơn 0"),

        body("quantity")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Số lượng không hợp lệ"),

        body("brandIds")
            .optional()
            .customSanitizer((value) => {
                if (!value) return [];
                return Array.isArray(value) ? value : [value];
            }),

        body("brandIds.*")
            .optional()
            .isMongoId()
            .withMessage("brandId không hợp lệ"),

        body("depositPercentage")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Deposit phải là số"),

        body("yearProduce")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("Năm sản xuất không hợp lệ"),

        body("seriesId")
            .optional()
            .isMongoId()
            .withMessage("SeriesId không hợp lệ"),

        body("description")
            .optional()
            .isLength({ max: 2000 })
            .withMessage("Mô tả tối đa 2000 ký tự"),

        body("status")
            .optional()
            .customSanitizer((value) => {
                if (!value) return value;

                const map = {
                    available: "ACTIVE",
                    sold_out: "INACTIVE",
                    pending: "PENDING",
                };

                return map[value] || value;
            })
            .isIn(["ACTIVE", "INACTIVE", "PENDING"])
            .withMessage("Status không hợp lệ"),

        body("imageFiles").optional(),
    ],

    // ================= FILTER =================
    CarFilterRequestValidator: [
        query("seriesId")
            .optional()
            .isMongoId()
            .withMessage("seriesId không hợp lệ"),

        query("categoryId")
            .optional()
            .isMongoId()
            .withMessage("categoryId không hợp lệ"),

        query("minPrice")
            .optional()
            .isInt({ min: 0 })
            .withMessage("minPrice không hợp lệ"),

        query("maxPrice")
            .optional()
            .isInt({ min: 0 })
            .withMessage("maxPrice không hợp lệ"),

        query("minPowerKw")
            .optional()
            .isInt({ min: 0 })
            .withMessage("minPowerKw không hợp lệ"),

        query("maxPowerKw")
            .optional()
            .isInt({ min: 0 })
            .withMessage("maxPowerKw không hợp lệ"),

        query("status")
            .optional()
            .isIn(["available", "sold_out", "pending"])
            .withMessage("Status không hợp lệ"),
    ],

    // ================= MOVE IMAGE =================
    MoveCarImageRequestValidator: [
        body("carId")
            .notEmpty()
            .withMessage("carId không được để trống")
            .bail()
            .isMongoId()
            .withMessage("carId không hợp lệ"),

        body("oldIndex")
            .notEmpty()
            .withMessage("oldIndex không được để trống")
            .bail()
            .isInt({ min: 0 })
            .withMessage("oldIndex không hợp lệ"),

        body("newIndex")
            .notEmpty()
            .withMessage("newIndex không được để trống")
            .bail()
            .isInt({ min: 0 })
            .withMessage("newIndex không hợp lệ"),
    ],
};