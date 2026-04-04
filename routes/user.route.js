var express = require("express");
const { default: mongoose } = require("mongoose");
const validateResult = require("../untils/validators/validate-result");
const userController = require("../controllers/user.controller");
const userProfileController = require("../controllers/user-profile.controller");
const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const {
  UserFilterRequest,
  UserRegisterRequestValidator,
} = require("../untils/validators/user/user.validator");
const { CheckLogin, CheckRole } = require("../untils/authHandler");
var router = express.Router();

router.post(
  "/register",
  UserRegisterRequestValidator,
  validateResult,
  async function (req, res, next) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
      let { email, password } = req.body;
      let user = await userController.register(email, password, session);

      await userProfileController.createUserProfile(
        user._id,
        null,
        null,
        null,
        null,
        null,
        session,
      );

      await session.commitTransaction();
      await session.endSession();

      res.send(resultNoData.success("Tài khoản đã được đăng ký thành công."));
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      return res
        .status(error.status || 500)
        .send(resultNoData.fail(error.message));
    }
  },
);

router.get(
  "/",
  CheckLogin,
  CheckRole("ADMIN"),
  UserFilterRequest,
  validateResult,
  async function (req, res, next) {
    try {
      let result = await userController.getAllUser(req.query);

      return res.send(
        resultList.success(
          result.data,
          "Lấy danh sách người dùng thành công",
          result.pagination,
        ),
      );
    } catch (error) {
      return res.status(400).send(resultNoData.success(error.message));
    }
  },
);

module.exports = router;
