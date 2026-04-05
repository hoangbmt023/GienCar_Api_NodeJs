var express = require("express");
const { default: mongoose } = require("mongoose");
const validateResult = require("../utils/validators/validate-result");
const userController = require("../controllers/user.controller");
const userProfileController = require("../controllers/user-profile.controller");
const resultNoData = require("../utils/results/result-nodata");
const resultDTO = require("../utils/results/result.dto");
const resultList = require("../utils/results/result-list");
const mediaUtils = require("../utils/media.util");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const {
  UserFilterRequestValidator: UserFilterRequest,
  UserRegisterRequestValidator,
  UpdateUserProfileRequestValidator,
} = require("../utils/validators/user.validator");
const { CheckLogin, CheckRole } = require("../utils/authHandler");
const UserProfileController = require("../controllers/user-profile.controller");
const ApiError = require("../utils/errors/api-error");
const { toUserProfileResponse } = require("../mappers/user-profile.mapper");
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

router.put(
  "/me/profile",
  CheckLogin,
  upload.single("avatarFile"),
  UpdateUserProfileRequestValidator,
  validateResult,
  async function (req, res, next) {
    try {
      const userId = req.user._id;

      const { fullName, phoneNumber, description } = req.body;
      if (phoneNumber && phoneNumber.trim() !== "") {
        const exists =
          await UserProfileController.existsByPhoneNumberAndUserIdNot(
            phoneNumber,
            userId,
          );
        if (exists) {
          throw ApiError.duplicate(
            "Số điện thoại '" + phoneNumber + "' đã tồn tại",
          );
        }
      }

      const userProfile = await UserProfileController.findByUserId(userId);

      let avatarUrl = userProfile.avatar;

      // upload avatar mới
      if (req.file) {
        if (userProfile.avatar) {
          await mediaUtils.deleteByUrl(userProfile.avatar);
        }

        avatarUrl = await mediaUtils.upload(req.file, "users/avatars");
      }

      let saveUserProfile = await UserProfileController.saveUserProfile(
        userId,
        {
          fullName: fullName ?? userProfile.fullName,
          phoneNumber: phoneNumber ?? userProfile.phoneNumber,
          description: description ?? userProfile.description,
          avatar: avatarUrl,
        },
      );
      return res.send(
        resultDTO.success(
          toUserProfileResponse(saveUserProfile),
          "Cập nhật hồ sơ thành công",
        ),
      );
    } catch (error) {
      return res.status(400).send(resultNoData.success(error.message));
    }
  },
);

module.exports = router;
