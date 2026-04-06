const { body } = require("express-validator");

module.exports = {
    // ================= CREATE / UPDATE =================
    SpecificationRequestValidator: [
        // ===== ENGINE =====
        body("engine")
            .notEmpty()
            .withMessage("Thông số động cơ không được để trống"),

        body("engine.name")
            .notEmpty()
            .withMessage("Tên động cơ là bắt buộc"),

        body("engine.capacityCc")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Dung tích động cơ phải là số"),

        body("engine.layout")
            .optional()
            .isString()
            .withMessage("Layout phải là chuỗi"),

        body("engine.powerKw")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Công suất phải là số"),

        // ===== EFFICIENCY =====
        body("efficiency")
            .notEmpty()
            .withMessage("Thông số hiệu năng không được để trống"),

        body("efficiency.maxSpeedKmH")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Max speed phải là số"),

        body("efficiency.acceleration0To100")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Acceleration phải là số"),

        body("efficiency.acceleration0To160")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Acceleration phải là số"),

        // ===== BODY =====
        body("body")
            .notEmpty()
            .withMessage("Thông số thân xe không được để trống"),

        body("body.lengthMm")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Chiều dài phải là số"),

        body("body.widthMm")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Chiều rộng phải là số"),

        body("body.heightMm")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Chiều cao phải là số"),

        body("body.wheelBaseMm")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Wheel base phải là số"),

        body("body.payloadKg")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Payload phải là số"),

        body("body.luggageCapacityL")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Dung tích hành lý phải là số"),

        // ===== CONSUMPTION =====
        body("consumption")
            .notEmpty()
            .withMessage("Thông số tiêu thụ không được để trống"),

        body("consumption.urbanLPer100Km")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Urban consumption phải là số"),

        body("consumption.extraUrbanLPer100Km")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Extra urban phải là số"),

        body("consumption.combinedLPer100Km")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Combined phải là số"),

        body("consumption.co2EmissionsGPerKm")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("CO2 phải là số"),
    ],
};