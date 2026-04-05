var express = require("express");
var router = express.Router();

const categoryController = require("../controllers/category.controller");
const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const resultDTO = require("../untils/results/result.dto");
const { CheckLogin, CheckRole } = require("../untils/authHandler");

// GET ALL
router.get("/", async function (req, res, next) {
    try {
        let result = await categoryController.getAll(req.query);
        return res.send(resultList.success(result.data, "Lấy danh sách Category thành công", result.pagination));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// GET BY ID
router.get("/:id", async function (req, res, next) {
    try {
        let category = await categoryController.getById(req.params.id);
        return res.send(resultDTO.success(category, "Lấy Category thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// CREATE
router.post("/", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        let { name, description } = req.body;
        let category = await categoryController.create(name, description);
        return res.send(resultDTO.success(category, "Thêm mới Category thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// UPDATE
router.put("/:id", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        let { name, description } = req.body;
        let updated = await categoryController.update(req.params.id, name, description);
        return res.send(resultDTO.success(updated, "Cập nhật Category thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// DELETE
router.delete("/:id", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        await categoryController.delete(req.params.id);
        return res.send(resultNoData.success("Xóa Category thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

module.exports = router;