const { body } = require("express-validator");

module.exports = {
  CreateMessageRequestValidator: [
    body("from")
        .notEmpty()
        .withMessage("Id người gửi không được rỗng"),
    body("to")
        .notEmpty()
        .withMessage("RoomId không được rỗng"),
    body("content")
        .notEmpty()
        .withMessage("Nội dung không được rỗng"),
    body("roomId")
        .notEmpty()
        .withMessage("RoomId không được rỗng"),
    body("type")
        .notEmpty({ min: 1 })
        .withMessage("Type không được để trống"),
  ],
};
