var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(),
});

const bannerController = require("../controllers/banner.controller");
const mediaUtil = require("../utils/media.util");

const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const ApiError = require("../utils/errors/api-error");

const { toBannerListResponse } = require("../mappers/banner.mapper");

const { CheckLogin, CheckRole } = require("../utils/authHandler");

const {
    CreateBannerRequestValidator,
    DeleteBannerRequestValidator,
    MoveBannerRequestValidator,
    GetBannerRequestValidator,
} = require("../utils/validators/banner.validator");

const validateResult = require("../utils/validators/validate-result");

// ================= GET ACTIVE =================
router.get(
    "/",
    GetBannerRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            const { position } = req.query;
            const now = new Date();

            let filter = { isActive: true };

            if (position) {
                filter.position = position;
            }

            filter.$and = [
                {
                    $or: [{ startDate: null }, { startDate: { $lte: now } }],
                },
                {
                    $or: [{ endDate: null }, { endDate: { $gte: now } }],
                },
            ];

            const banners = await bannerController.findBanners(filter, { order: 1 });

            if (!banners.length) {
                return res.send(resultList.success([], "Danh sách rỗng"));
            }

            return res.send(
                resultList.success(
                    toBannerListResponse(banners),
                    "Lấy danh sách banner thành công"
                )
            );
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

// ================= CREATE =================
router.post(
    "/",
    CheckLogin,
    CheckRole("ADMIN"),
    upload.fields([
        { name: "imageFile", maxCount: 1 },
        { name: "videoFile", maxCount: 1 },
    ]),
    CreateBannerRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            const {
                title,
                description,
                ctaText,
                ctaLink,
                position,
                startDate,
                endDate,
                isActive,
            } = req.body;

            const imageFile = req.files?.imageFile?.[0];
            const videoFile = req.files?.videoFile?.[0];

            let imageUrl = null;
            let videoUrl = null;

            if (imageFile) {
                imageUrl = await mediaUtil.upload(
                    imageFile,
                    `banners/${position.toLowerCase()}`,
                    "image"
                );
            }

            if (videoFile) {
                videoUrl = await mediaUtil.upload(
                    videoFile,
                    `banners/${position.toLowerCase()}`,
                    "video"
                );
            }

            const max = await bannerController.findMaxOrder(position);
            const order = max.length ? max[0].order + 1 : 1;

            // business logic
            if (new Date(startDate) > new Date(endDate)) {
                throw ApiError.badRequest("startDate phải nhỏ hơn endDate");
            }

            await bannerController.create({
                title,
                description,
                imageUrl,
                videoUrl,
                ctaText,
                ctaLink,
                position,
                order,
                startDate,
                endDate,
                isActive,
            });

            return res.send(resultNoData.success("Tạo banner thành công"));
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

// ================= MOVE =================
router.put(
    "/move",
    CheckLogin,
    CheckRole("ADMIN"),
    MoveBannerRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            const { bannerId, order } = req.body;

            const banner = await bannerController.findById(bannerId);
            let siblings = await bannerController.findSiblings(banner.position);

            siblings = siblings.filter((b) => String(b._id) !== String(bannerId));

            if (order < 1 || order > siblings.length + 1) {
                throw ApiError.badRequest("Vị trí không hợp lệ");
            }

            siblings.splice(order - 1, 0, banner);

            for (let i = 0; i < siblings.length; i++) {
                siblings[i].order = i + 1;
                await bannerController.save(siblings[i]);
            }

            return res.send(resultNoData.success("Di chuyển banner thành công"));
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

// ================= DELETE =================
router.delete(
    "/",
    CheckLogin,
    CheckRole("ADMIN"),
    DeleteBannerRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            const { bannerId } = req.body;

            const banner = await bannerController.findById(bannerId);

            if (banner.imageUrl) {
                await mediaUtil.deleteByUrl(banner.imageUrl, "image");
            }

            if (banner.videoUrl) {
                await mediaUtil.deleteByUrl(banner.videoUrl, "video");
            }

            const deletedOrder = banner.order;
            const position = banner.position;

            await bannerController.deleteById(bannerId);

            const affected = await bannerController.findAffected(
                position,
                deletedOrder
            );

            for (const b of affected) {
                b.order -= 1;
                await bannerController.save(b);
            }

            return res.send(resultNoData.success("Xóa banner thành công"));
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

module.exports = router;