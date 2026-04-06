var express = require("express");
const { default: mongoose, isObjectIdOrHexString } = require("mongoose");
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
    AddressRequestValidator,
} = require("../utils/validators/user.validator");
const { CheckLogin, CheckRole } = require("../utils/authHandler");
const UserProfileController = require("../controllers/user-profile.controller");
const ApiError = require("../utils/errors/api-error");
const { toUserProfileResponse } = require("../mappers/user-profile.mapper");
const UserController = require("../controllers/user.controller");
var router = express.Router();

router.post(
    "/register",
    UserRegisterRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            let { email, password } = req.body;

            let user = await userController.register(email, password);

            await userProfileController.createUserProfile(
                user._id,
                null,
                null,
                null,
                null,
                null
            );

            res.send(resultNoData.success("Tài khoản đã được đăng ký thành công."));
        } catch (error) {
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
    "/:userId/ban",
    CheckLogin,
    CheckRole("ADMIN"),
    async function (req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await UserController.findById(userId);

            await UserController.banUser(user);

            return res.send(resultNoData.success("Khóa người dùng thành công"));
        } catch (error) {
            return res.status(400).send(resultNoData.success(error.message));
        }
    },
);

router.put(
    "/:userId/unban",
    CheckLogin,
    CheckRole("ADMIN"),
    async function (req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await UserController.findById(userId);

            await UserController.unBanUser(user);

            return res.send(resultNoData.success("Mở khóa người dùng thành công"));
        } catch (error) {
            return res.status(400).send(resultNoData.success(error.message));
        }
    },
);

router.put(
    "/:userId/roles",
    CheckLogin,
    CheckRole("ADMIN"),
    async function (req, res, next) {
        try {
            const userId = req.params.userId;
            const roles = req.body.roles;

            const user = await UserController.findById(userId);

            await UserController.updateRole(user, roles);

            return res.send(
                resultNoData.success("Update roles người dùng thành công"),
            );
        } catch (error) {
            return res.status(400).send(resultNoData.success(error.message));
        }
    },
);

router.delete(
    "/:userId",
    CheckLogin,
    CheckRole("ADMIN"),
    async function (req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await UserController.findById(userId);

            await UserController.deleteUser(user._id);

            return res.send(resultNoData.success("Xóa người dùng thành công"));
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

router.get("/me/profile", CheckLogin, async function (req, res, next) {
    try {
        const userId = req.user._id;

        const userProfile = await UserProfileController.findByUserId(userId);

        return res.send(
            resultDTO.success(
                toUserProfileResponse(userProfile),
                "Cập nhật hồ sơ thành công",
            ),
        );
    } catch (error) {
        return res.status(400).send(resultNoData.success(error.message));
    }
});

router.post(
    "/me/addresses",
    CheckLogin,
    AddressRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            const userId = req.user._id;

            const userProfile = await UserProfileController.findByUserId(userId);

            const addressList = Array.isArray(req.body) ? req.body : [req.body];

            const saveUserProfile = await UserProfileController.saveUserAddress(
                userProfile,
                addressList,
            );

            return res.send(
                resultDTO.success(
                    toUserProfileResponse(saveUserProfile),
                    "Cập nhật địa chỉ thành công",
                ),
            );
        } catch (error) {
            return res.status(400).send(resultNoData.success(error.message));
        }
    },
);

router.put(
    "/me/addresses/:addressId",
    CheckLogin,
    AddressRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            const addressId = req.params.addressId;
            const userId = req.user._id;

            const userProfile = await UserProfileController.findByUserId(userId);

            const addressInput = req.body;

            const saveUserProfile = await UserProfileController.updateUserAddress(
                userProfile,
                addressId,
                addressInput,
            );

            return res.send(
                resultDTO.success(
                    toUserProfileResponse(saveUserProfile),
                    "Cập nhật địa chỉ thành công",
                ),
            );
        } catch (error) {
            return res.status(400).send(resultNoData.success(error.message));
        }
    },
);

router.delete(
    "/me/addresses/:addressId",
    CheckLogin,
    async function (req, res, next) {
        try {
            const addressId = req.params.addressId;
            const userId = req.user._id;

            const userProfile = await UserProfileController.findByUserId(userId);

            const deleteUserAddress = await UserProfileController.deleteUserAddress(
                userProfile,
                addressId,
            );

            return res.send(
                resultDTO.success(
                    toUserProfileResponse(deleteUserAddress),
                    "Xóa địa chỉ thành công",
                ),
            );
        } catch (error) {
            return res.status(400).send(resultNoData.success(error.message));
        }
    },
);

module.exports = router;
