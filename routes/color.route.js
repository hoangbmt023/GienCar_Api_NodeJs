var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(),
});

const mediaUtil = require("../utils/media.util");

const colorController = require("../controllers/color.controller");
const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const slugify = require("slugify");
const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const { toColorResponse, toColorListResponse } = require("../mappers/color.mapper");


// ================= GET ALL =================
router.get("/", async function (req, res) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let [colors, total] = await Promise.all([
            colorController.findColors({}, sort, skip, size),
            colorController.count({})
        ]);

        if (!colors.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toColorListResponse(colors),
                "Lấy danh sách màu sắc thành công",
                createPagination({ page, size, total })
            )
        );

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});


// ================= GET BY ID =================
router.get("/:id", async function (req, res) {
    try {
        let color = await colorController.findById(req.params.id);

        return res.send(
            resultDTO.success(toColorResponse(color), "Lấy màu thành công")
        );

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});


// ================= GET BY SLUG =================
router.get("/slug/:slug", async function (req, res) {
    try {
        let color = await colorController.findOne({ slug: req.params.slug });
        if (!color) throw ApiError.notFound("Color không tồn tại");

        return res.send(
            resultDTO.success(toColorResponse(color), "Lấy màu thành công")
        );

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});


// ================= CREATE =================
router.post("/", upload.single("imageFile"), async function (req, res) {
    try {
        let { name, description } = req.body;

        if (!name) {
            throw ApiError.badRequest("Thiếu name");
        }

        let slug = slugify(name, { lower: true, strict: true });

        let existed = await colorController.findOne({ slug });
        if (existed) throw ApiError.duplicate("Slug đã tồn tại");

        let imageUrl = null;

        if (req.file) {
            imageUrl = await mediaUtil.upload(req.file, "colors", "image");
        }

        await colorController.create({
            name,
            description,
            slug,
            imageUrl
        });

        return res.send(resultNoData.success("Thêm màu sắc thành công"));

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});


// ================= UPDATE =================
router.put("/:id", upload.single("imageFile"), async function (req, res) {
    try {
        let color = await colorController.findById(req.params.id);

        let newName = req.body.name || color.name;
        let slug = slugify(newName, { lower: true, strict: true });

        let existed = await colorController.findOne({
            slug,
            _id: { $ne: color._id }
        });

        if (existed) throw ApiError.duplicate("Slug đã tồn tại");

        color.name = newName;
        color.description = req.body.description ?? color.description;

        // ✅ upload + delete old image
        if (req.file) {
            if (color.imageUrl) {
                await mediaUtil.deleteByUrl(color.imageUrl, "image");
            }

            color.imageUrl = await mediaUtil.upload(req.file, "colors", "image");
        }

        await colorController.save(color);

        return res.send(
            resultDTO.success(toColorResponse(color), "Cập nhật màu thành công")
        );

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});


// ================= DELETE =================
router.delete("/:id", async function (req, res) {
    try {
        let color = await colorController.findById(req.params.id);

        // delete image cloud
        if (color.imageUrl) {
            await mediaUtil.deleteByUrl(color.imageUrl, "image");
        }

        await colorController.deleteById(req.params.id);

        return res.send(resultNoData.success("Xóa màu thành công"));

    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

module.exports = router;