const { body } = require("express-validator");

module.exports = {
    // ================= CREATE =================
    CreateBookingRequestValidator: [
        body("name")
            .notEmpty()
            .withMessage("Họ tên không được để trống"),

        body("phone")
            .notEmpty()
            .withMessage("Số điện thoại không được để trống")
            .bail()
            .matches(/^(0|\+84)[0-9]{8,10}$/)
            .withMessage("Số điện thoại không hợp lệ"),

        body("email")
            .notEmpty()
            .withMessage("Email không được để trống")
            .bail()
            .isEmail()
            .withMessage("Email không hợp lệ"),

        body("carModelId")
            .notEmpty()
            .withMessage("Mã mẫu xe không được để trống")
            .bail()
            .isMongoId()
            .withMessage("carModelId không hợp lệ"),

        body("bookingDate")
            .notEmpty()
            .withMessage("Ngày lái thử không được để trống")
            .bail()
            .isISO8601()
            .withMessage("Ngày không đúng định dạng")
            .bail()
            .custom((value) => {
                const inputDate = new Date(value);
                const now = new Date();

                // reset giờ để so sánh theo ngày
                inputDate.setHours(0, 0, 0, 0);
                now.setHours(0, 0, 0, 0);

                if (inputDate <= now) {
                    throw new Error("Ngày lái thử phải là trong tương lai");
                }

                return true;
            }),
    ],

    // ================= CONFIRM =================
    ConfirmBookingRequestValidator: [
        body("timeSlotId")
            .notEmpty()
            .withMessage("Khung giờ xác nhận không được để trống")
            .bail()
            .isMongoId()
            .withMessage("timeSlotId không hợp lệ"),
    ],

    // ================= CANCEL =================
    CancelBookingRequestValidator: [
        body("reason")
            .notEmpty()
            .withMessage("Lý do hủy không được để trống")
            .bail()
            .isLength({ min: 5 })
            .withMessage("Lý do hủy quá ngắn"),
    ],
};