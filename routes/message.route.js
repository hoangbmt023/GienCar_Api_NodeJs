var express = require("express");
const { CheckLogin } = require("../utils/authHandler");
const {
  CreateMessageRequestValidator,
} = require("../utils/validators/message.validator");
const resultNoData = require("../utils/results/result-nodata");
const resultDto = require("../utils/results/result.dto");
const resultList = require("../utils/results/result-list");
const validateResult = require("../utils/validators/validate-result");
const MessageController = require("../controllers/message.controller");
const UserController = require("../controllers/user.controller");
const { toMessageResponse, toConversationResponse } = require("../mappers/message.mapper");

var router = express.Router();

// POST / - Tạo tin nhắn mới
router.post(
  "/",
  CreateMessageRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      let data = req.body;
      let msg = await MessageController.createMessage(data);
      return res.send(
        resultDto.success(toMessageResponse(msg), "Tạo tin nhắn thành công"),
      );
    } catch (error) {
      return res.status(400).send(resultNoData.fail(error.message));
    }
  },
);

// GET /me/conversations - Lấy danh sách người đã nhắn tin với mình
router.get(
  "/me/conversations",
  CheckLogin,
  async function (req, res, next) {
    try {
      const myUserId = req.user._id.toString();
      const conversations = await MessageController.getConversations(myUserId);
      return res.send(
        resultDto.success(
          conversations.map(c => toConversationResponse(c, myUserId)),
          "Lấy danh sách hội thoại thành công",
        ),
      );
    } catch (error) {
      return res.status(400).send(resultNoData.fail(error.message));
    }
  },
);

// GET /me/messages/:otherUserId - Lấy danh sách tin nhắn với người kia (có phân trang)
router.get(
  "/me/messages/:otherUserId",
  CheckLogin,
  async function (req, res, next) {
    try {
      const myUserId = req.user._id.toString();
      const { otherUserId } = req.params;

      const result = await MessageController.getMessages(
        myUserId,
        otherUserId,
        req.query,
      );

      return res.send(
        resultList.success(
          result.data.map(toMessageResponse),
          "Lấy danh sách tin nhắn thành công",
          result.pagination,
        ),
      );
    } catch (error) {
      return res.status(400).send(resultNoData.fail(error.message));
    }
  },
);



module.exports = router;
