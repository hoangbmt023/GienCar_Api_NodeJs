var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(),
});

const mediaUtil = require("../utils/media.util");

const brandController = require("../controllers/brand.controller");
const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const slugify = require("slugify");
const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const { toBrandResponse, toBrandListResponse } = require("../mappers/brand.mapper");

const { CheckLogin, CheckRole } = require("../utils/authHandler");

// ================= GET ALL =================
router.get("/", async function (req, res, next) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let [brands, total] = await Promise.all([
            brandController.findBrands({}, sort, skip, size),
            brandController.count({})
        ]);

        if (!brands.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toBrandListResponse(brands),
                "Lấy danh sách brand thành công",
                createPagination({ page, size, total })
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= CREATE =================
router.post("/", CheckLogin, CheckRole("ADMIN"), upload.single("logoFile"), async function (req, res, next) {
    try {
        const { name, country } = req.body;

        if (!name) {
            throw ApiError.badRequest("Thiếu name");
        }

        const slug = slugify(name, { lower: true, strict: true });

        const existed = await brandController.findOne({ slug });
        if (existed) {
            throw ApiError.duplicate("Slug đã tồn tại");
        }

        let logo = null;

        // upload logo lên cloud
        if (req.file) {
            logo = await mediaUtil.upload(req.file, "brands", "image");
        }

        const brand = await brandController.create({
            name,
            country,
            slug,
            logo,
        });

        return res.send(
            resultDTO.success(toBrandResponse(brand), "Tạo brand thành công")
        );
    } catch (error) {
        next(error);
    }
});


// ================= UPDATE =================
router.put("/:id", CheckLogin, CheckRole("ADMIN"), upload.single("logoFile"), async function (req, res, next) {
    try {
        const brand = await brandController.findById(req.params.id);

        const newName = req.body.name || brand.name;
        const slug = slugify(newName, { lower: true, strict: true });

        const existed = await brandController.findOne({
            slug,
            _id: { $ne: brand._id },
        });

        if (existed) {
            throw ApiError.duplicate("Slug đã tồn tại");
        }

        brand.name = newName;
        brand.country = req.body.country ?? brand.country;
        brand.slug = slug;

        // upload logo mới + xóa logo cũ
        if (req.file) {
            if (brand.logo) {
                await mediaUtil.deleteByUrl(brand.logo, "image");
            }

            brand.logo = await mediaUtil.upload(req.file, "brands", "image");
        }

        await brandController.save(brand);

        return res.send(
            resultDTO.success(toBrandResponse(brand), "Cập nhật brand thành công")
        );
    } catch (error) {
        next(error);
    }
});


// ================= DELETE =================
router.delete("/:id", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        await brandController.deleteById(req.params.id);

        return res.send(resultNoData.success("Xóa brand thành công"));

    } catch (error) {
        next(error);
    }
});


module.exports = router;