var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(),
});

const mediaUtil = require("../utils/media.util");

const controller = require("../controllers/car-series.controller");

const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const slugify = require("slugify");

const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const { toCarSeriesResponse, toCarSeriesListResponse } = require("../mappers/car-series.mapper");

const { CheckLogin, CheckRole } = require("../utils/authHandler");

// relation
const Brand = require("../schemas/brand.schema");

// ================= GET ALL =================
router.get("/", async (req, res, next) => {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let [list, total] = await Promise.all([
            controller.findSeries({}, sort, skip, size),
            controller.count({})
        ]);

        if (!list.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toCarSeriesListResponse(list),
                "Lấy danh sách CarSeries",
                createPagination({ page, size, total })
            )
        );

    } catch (e) {
        next(e);
    }
});


// ================= FILTER =================
router.get("/filter", async (req, res, next) => {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let filter = {};

        if (req.query.status) filter.status = req.query.status;
        if (req.query.highlight !== undefined) {
            filter.highlight = req.query.highlight === "true";
        }

        let [list, total] = await Promise.all([
            controller.findSeries(filter, sort, skip, size),
            controller.count(filter)
        ]);

        if (!list.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toCarSeriesListResponse(list),
                "Lọc thành công",
                createPagination({ page, size, total })
            )
        );

    } catch (e) {
        next(e);
    }
});


// ================= GET BY ID =================
router.get("/:id", async (req, res, next) => {
    try {
        let s = await controller.findById(req.params.id);

        return res.send(
            resultDTO.success(toCarSeriesResponse(s), "Lấy thành công")
        );

    } catch (e) {
        next(e);
    }
});


// ================= CREATE =================
router.post("/", CheckLogin, CheckRole("ADMIN"), upload.single("imageFile"), async (req, res, next) => {
    try {
        let { name, description, brandId, priceFrom, highlight } = req.body;

        if (!name || !brandId) {
            throw ApiError.badRequest("Thiếu name hoặc brandId");
        }

        let slug = slugify(name, { lower: true, strict: true });

        let existed = await controller.findOne({ slug });
        if (existed) throw ApiError.duplicate("Slug đã tồn tại");

        let brand = await Brand.findById(brandId);
        if (!brand) throw ApiError.notFound("Brand không tồn tại");

        let imageUrl = null;

        if (req.file) {
            imageUrl = await mediaUtil.upload(req.file, "car-series", "image");
        }

        let max = await controller.findMaxOrder();
        let orderIndex = max.length ? max[0].orderIndex + 1 : 1;

        await controller.create({
            name,
            description,
            brandId,
            imageUrl,
            priceFrom,
            highlight,
            slug,
            orderIndex
        });

        return res.send(resultNoData.success("Tạo thành công"));

    } catch (e) {
        next(e);
    }
});


// ================= UPDATE =================
router.put("/:id", CheckLogin, CheckRole("ADMIN"), upload.single("imageFile"), async (req, res, next) => {
    try {
        let s = await controller.findById(req.params.id);

        let newName = req.body.name || s.name;
        let slug = slugify(newName, { lower: true, strict: true });

        let existed = await controller.findOne({
            slug,
            _id: { $ne: s._id }
        });

        if (existed) throw ApiError.duplicate("Slug đã tồn tại");

        if (req.body.brandId) {
            let brand = await Brand.findById(req.body.brandId);
            if (!brand) throw ApiError.notFound("Brand không tồn tại");
            s.brandId = req.body.brandId;
        }

        // upload + delete old image
        if (req.file) {
            if (s.imageUrl) {
                await mediaUtil.deleteByUrl(s.imageUrl, "image");
            }

            s.imageUrl = await mediaUtil.upload(req.file, "car-series", "image");
        }

        s.name = newName;
        s.description = req.body.description ?? s.description;
        s.priceFrom = req.body.priceFrom ?? s.priceFrom;
        s.highlight = req.body.highlight ?? s.highlight;
        s.slug = slug;

        await controller.save(s);

        return res.send(
            resultDTO.success(toCarSeriesResponse(s), "Cập nhật thành công")
        );

    } catch (e) {
        next(e);
    }
});


// ================= MOVE =================
router.patch("/move", CheckLogin, CheckRole("ADMIN"), async (req, res, next) => {
    try {
        let { id, newIndex } = req.body;

        let s = await controller.findById(id);

        let target = await controller.findByOrder(newIndex);
        if (!target) throw ApiError.badRequest("Index không hợp lệ");

        let oldIndex = s.orderIndex;

        s.orderIndex = newIndex;
        target.orderIndex = oldIndex;

        await controller.save(s);
        await controller.save(target);

        return res.send(resultNoData.success("Move thành công"));

    } catch (e) {
        next(e);
    }
});


// ================= DELETE =================
router.delete("/:id", CheckLogin, CheckRole("ADMIN"), async (req, res, next) => {
    try {
        let s = await controller.findById(req.params.id);

        let deletedIndex = s.orderIndex;

        await controller.deleteById(req.params.id);

        let list = await controller.findAll();

        for (let item of list) {
            if (item.orderIndex > deletedIndex) {
                item.orderIndex -= 1;
                await controller.save(item);
            }
        }

        return res.send(resultNoData.success("Xóa thành công"));

    } catch (e) {
        next(e);
    }
});

module.exports = router;