var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const controller = require("../controllers/car-series.controller");
const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const resultDTO = require("../untils/results/result.dto");
const { CheckLogin, CheckRole } = require("../untils/authHandler");

// ================= GET ALL =================
router.get("/", async (req, res, next) => {
    try {
        let result = await controller.getAll(req.query);
        return res.send(resultList.success(result.data, "Lấy danh sách CarSeries", result.pagination));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= FILTER =================
router.get("/filter", async (req, res, next) => {
    try {
        let result = await controller.getByFilter(req.query);
        return res.send(resultList.success(result.data, "Lọc thành công", result.pagination));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= GET BY ID =================
router.get("/:id", async (req, res, next) => {
    try {
        let result = await controller.getById(req.params.id);
        return res.send(resultDTO.success(result, "Lấy thành công"));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= CREATE =================
router.post("/", /* CheckLogin, CheckRole("ADMIN"), */ upload.single("imageFile"), async (req, res, next) => {
    try {
        await controller.create(req.body, req.file);
        return res.send(resultNoData.success("Tạo thành công"));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= UPDATE =================
router.put("/:id", /* CheckLogin, CheckRole("ADMIN"), */ upload.single("imageFile"), async (req, res, next) => {
    try {
        let result = await controller.update(req.params.id, req.body, req.file);
        return res.send(resultDTO.success(result, "Cập nhật thành công"));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= MOVE =================
router.patch("/move", /* CheckLogin, CheckRole("ADMIN"), */ async (req, res, next) => {
    try {
        await controller.move(req.body);
        return res.send(resultNoData.success("Move thành công"));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= DELETE =================
router.delete("/:id", /* CheckLogin, CheckRole("ADMIN"), */ async (req, res, next) => {
    try {
        await controller.delete(req.params.id);
        return res.send(resultNoData.success("Xóa thành công"));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

module.exports = router;