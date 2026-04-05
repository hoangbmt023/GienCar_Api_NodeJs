var express = require("express");
var router = express.Router();

const branchController = require("../controllers/branch.controller");

const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const resultDTO = require("../untils/results/result.dto");
const { CheckLogin, CheckRole } = require("../untils/authHandler");

// GET ALL ACTIVE
router.get("/", async function (req, res, next) {
    try {
        let result = await branchController.getAllActive(req.query);
        return res.send(resultList.success(result.data, "Lấy danh sách cơ sở hoạt động thành công", result.pagination));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// GET BY ID
router.get("/:id", async function (req, res, next) {
    try {
        let result = await branchController.getById(req.params.id);
        return res.send(resultDTO.success(result, "Lấy chi tiết cơ sở thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// GET ALL ADMIN
router.get("/admin", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        let result = await branchController.getAll(req.query);
        return res.send(resultList.success(result.data, "Lấy toàn bộ cơ sở thành công", result.pagination));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// CREATE
router.post("/", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        await branchController.create(req.body);
        return res.send(resultNoData.success("Tạo cơ sở thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// UPDATE
router.put("/:id", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        let result = await branchController.update(req.params.id, req.body);
        return res.send(resultDTO.success(result, "Cập nhật cơ sở thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// DELETE
router.delete("/:id", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        await branchController.delete(req.params.id);
        return res.send(resultNoData.success("Xóa cơ sở thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// TOGGLE ACTIVE
router.patch("/:id/toggle", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        let result = await branchController.toggleActive(req.params.id);
        return res.send(resultDTO.success(result, "Cập nhật trạng thái thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

module.exports = router;