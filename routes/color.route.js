var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const colorController = require("../controllers/color.controller");
const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const resultDTO = require("../untils/results/result.dto");
const { CheckLogin, CheckRole } = require("../untils/authHandler");

// GET ALL
router.get("/", async function (req, res, next) {
    try {
        let result = await colorController.getAll(req.query);
        return res.send(resultList.success(result.data, "Lấy danh sách màu sắc thành công", result.pagination));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// GET BY ID
router.get("/:id", async function (req, res, next) {
    try {
        let result = await colorController.getById(req.params.id);
        return res.send(resultDTO.success(result, "Lấy màu thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// GET BY SLUG
router.get("/slug/:slug", async function (req, res, next) {
    try {
        let result = await colorController.getBySlug(req.params.slug);
        return res.send(resultDTO.success(result, "Lấy màu thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// CREATE
router.post("/",  /* CheckLogin, CheckRole("ADMIN"), */ upload.single("imageFile"), async function (req, res, next) {
    try {
        await colorController.create(req.body, req.file);
        return res.send(resultNoData.success("Thêm màu sắc thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// UPDATE
router.put("/:id",  /* CheckLogin, CheckRole("ADMIN"), */ upload.single("imageFile"), async function (req, res, next) {
    try {
        let result = await colorController.update(req.params.id, req.body, req.file);
        return res.send(resultDTO.success(result, "Cập nhật màu thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// DELETE
router.delete("/:id",  /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        await colorController.delete(req.params.id);
        return res.send(resultNoData.success("Xóa màu thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

module.exports = router;