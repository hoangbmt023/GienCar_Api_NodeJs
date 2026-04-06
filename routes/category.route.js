var express = require("express");
var router = express.Router();

const categoryController = require("../controllers/category.controller");
const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const slugify = require("slugify");
const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const { toCategoryResponse, toCategoryListResponse } = require("../mappers/category.mapper");

const { CheckLogin, CheckRole } = require("../utils/authHandler");

// ================= GET ALL =================
router.get("/", async function (req, res, next) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let [categories, total] = await Promise.all([
            categoryController.findCategories({}, sort, skip, size),
            categoryController.count({})
        ]);

        if (!categories.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toCategoryListResponse(categories),
                "Lấy danh sách Category thành công",
                createPagination({ page, size, total })
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= GET BY ID =================
router.get("/:id", async function (req, res, next) {
    try {
        let category = await categoryController.findById(req.params.id);

        return res.send(
            resultDTO.success(toCategoryResponse(category), "Lấy Category thành công")
        );

    } catch (error) {
        next(error);
    }
});


// ================= CREATE =================
router.post("/", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let { name, description } = req.body;

        if (!name) {
            throw ApiError.badRequest("Thiếu name");
        }

        let slug = slugify(name, { lower: true, strict: true });

        let existed = await categoryController.findOne({ slug });
        if (existed) throw ApiError.duplicate(`Slug '${slug}' đã tồn tại`);

        let category = await categoryController.create({
            name,
            description,
            slug
        });

        return res.send(
            resultDTO.success(toCategoryResponse(category), "Thêm mới Category thành công")
        );

    } catch (error) {
        next(error);
    }
});


// ================= UPDATE =================
router.put("/:id", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let category = await categoryController.findById(req.params.id);

        let newName = req.body.name || category.name;
        let slug = slugify(newName, { lower: true, strict: true });

        let existed = await categoryController.findOne({
            slug,
            _id: { $ne: category._id }
        });

        if (existed) throw ApiError.duplicate(`Slug '${slug}' đã tồn tại`);

        category.name = newName;
        category.description = req.body.description ?? category.description;
        category.slug = slug;

        await categoryController.save(category);

        return res.send(
            resultDTO.success(toCategoryResponse(category), "Cập nhật Category thành công")
        );

    } catch (error) {
        next(error);
    }
});


// ================= DELETE =================
router.delete("/:id", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        await categoryController.deleteById(req.params.id);

        return res.send(resultNoData.success("Xóa Category thành công"));

    } catch (error) {
        next(error);
    }
});


module.exports = router;