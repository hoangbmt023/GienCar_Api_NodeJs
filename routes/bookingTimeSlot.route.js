var express = require("express");
var router = express.Router();

const controller = require("../controllers/bookingTimeSlot.controller");
const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const resultDTO = require("../untils/results/result.dto");
const { CheckLogin, CheckRole } = require("../untils/authHandler");

// GET ALL
router.get("/", /* CheckLogin, CheckRole("ADMIN, SALE"), */ async function (req, res, next) {
    try {
        let result = await controller.getAll(req.query);
        return res.send(resultList.success(result.data, "Lấy danh sách khung giờ thành công", result.pagination));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// GET ACTIVE
router.get("/active", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        let result = await controller.getAllActive();
        return res.send(resultList.success(result.data, "Lấy danh sách khung giờ hoạt động thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// CREATE
router.post("/", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        let result = await controller.create(req.body);
        return res.send(resultDTO.success(result, "Tạo khung giờ thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// UPDATE
router.put("/:id", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        let result = await controller.update(req.params.id, req.body);
        return res.send(resultDTO.success(result, "Cập nhật khung giờ thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// DELETE
router.delete("/:id", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        await controller.delete(req.params.id);
        return res.send(resultDTO.success(null, "Xóa khung giờ thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

module.exports = router;