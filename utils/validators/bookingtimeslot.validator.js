const { body } = require("express-validator");

module.exports = {
    // ================= CREATE =================
    CreateTimeSlotRequestValidator: [
        body("timeLabel")
            .notEmpty()
            .withMessage("Tên khung giờ không được để trống"),
    ],

    // ================= UPDATE =================
    UpdateTimeSlotRequestValidator: [
        body("timeLabel")
            .notEmpty()
            .withMessage("Tên khung giờ không được để trống"),

        body("isActive")
            .notEmpty()
            .withMessage("Trạng thái không được để trống")
            .isBoolean()
            .withMessage("isActive phải là boolean"),
    ],
};