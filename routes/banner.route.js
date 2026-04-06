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

const BannerPosition = require("../model/banner/enum/banner-position.enum");
const { toBannerListResponse } = require("../mappers/banner.mapper");


// ================= GET ACTIVE =================
router.get("/", async function (req, res, next) {
    try {
        const { position } = req.query;
        const now = new Date();

        let filter = { isActive: true };

        if (position) {
            if (!Object.values(BannerPosition).includes(position)) {
                throw ApiError.badRequest("Position không hợp lệ");
            }
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
        next(error);
    }
});


// ================= CREATE =================
router.post(
    "/",
    upload.fields([
        { name: "imageFile", maxCount: 1 },
        { name: "videoFile", maxCount: 1 },
    ]),
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
            } = req.body;

            if (!Object.values(BannerPosition).includes(position)) {
                throw ApiError.badRequest("Position không hợp lệ");
            }

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
                isActive: true,
            });

            return res.send(resultNoData.success("Tạo banner thành công"));
        } catch (error) {
            next(error);
        }
    }
);


// ================= MOVE =================
router.put("/move", async function (req, res, next) {
    try {
        const { bannerId, newIndex } = req.body;

        const banner = await bannerController.findById(bannerId);
        let siblings = await bannerController.findSiblings(banner.position);

        siblings = siblings.filter(b => String(b._id) !== String(bannerId));

        if (newIndex < 1 || newIndex > siblings.length + 1) {
            throw ApiError.badRequest("Vị trí không hợp lệ");
        }

        siblings.splice(newIndex - 1, 0, banner);

        for (let i = 0; i < siblings.length; i++) {
            siblings[i].order = i + 1;
            await bannerController.save(siblings[i]);
        }

        return res.send(resultNoData.success("Di chuyển banner thành công"));
    } catch (error) {
        next(error);
    }
});


// ================= DELETE =================
router.delete("/", async function (req, res, next) {
    try {
        const { id } = req.body;

        const banner = await bannerController.findById(id);

        if (banner.imageUrl) {
            await mediaUtil.deleteByUrl(banner.imageUrl, "image");
        }

        if (banner.videoUrl) {
            await mediaUtil.deleteByUrl(banner.videoUrl, "video");
        }

        const deletedOrder = banner.order;
        const position = banner.position;

        await bannerController.deleteById(id);

        const affected = await bannerController.findAffected(position, deletedOrder);

        for (const b of affected) {
            b.order -= 1;
            await bannerController.save(b);
        }

        return res.send(resultNoData.success("Xóa banner thành công"));
    } catch (error) {
        next(error);
    }
});

module.exports = router;