var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const controller = require("../controllers/car.controller");

const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const resultDTO = require("../untils/results/result.dto");
const { CheckLogin, CheckRole } = require("../untils/authHandler");

// ================= FILTER =================
router.get("/", async (req, res, next) => {
    try {
        let result = await controller.getByFilter(req.query);
        return res.send(resultList.success(result.data, "Lấy danh sách xe", result.pagination));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= SEARCH =================
router.get("/search", async (req, res, next) => {
    try {
        let result = await controller.search(req.query);
        return res.send(resultList.success(result.data, "Tìm kiếm thành công", result.pagination));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= GET BY SLUG =================
router.get("/slug/:slug", async (req, res, next) => {
    try {
        let result = await controller.getBySlug(req.params.slug);
        return res.send(resultDTO.success(result, "Lấy thành công"));
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
router.post("/", /* CheckLogin, CheckRole("ADMIN"), */ upload.array("imageFiles"), async (req, res, next) => {
    try {
        await controller.create(req.body, req.files);
        return res.send(resultNoData.success("Tạo xe thành công"));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= UPDATE =================
router.put("/:id", /* CheckLogin, CheckRole("ADMIN"), */ upload.array("imageFiles"), async (req, res, next) => {
    try {
        let result = await controller.update(req.params.id, req.body, req.files);
        return res.send(resultDTO.success(result, "Cập nhật thành công"));
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

// ================= ADD COLOR =================
router.post("/:id/colors", /* CheckLogin, CheckRole("ADMIN"), */ upload.array("imageFiles"), async (req, res, next) => {
    try {
        let result = await controller.addExteriorColor(req.params.id, req.body, req.files);
        return res.send(resultDTO.success(result, "Thêm màu thành công"));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= REMOVE COLOR =================
router.delete("/:id/colors/:colorId", /* CheckLogin, CheckRole("ADMIN"), */ async (req, res, next) => {
    try {
        let result = await controller.removeExteriorColor(req.params.id, req.params.colorId);
        return res.send(resultDTO.success(result, "Xóa màu thành công"));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

// ================= MOVE IMAGE =================
router.patch("/:id/images/move", /* CheckLogin, CheckRole("ADMIN"), */ async (req, res, next) => {
    try {
        await controller.moveImage(
            req.params.id,
            req.query.oldIndex,
            req.query.newIndex
        );
        return res.send(resultNoData.success("Move thành công"));
    } catch (e) {
        return res.status(e.status || 500).send(resultNoData.fail(e.message));
    }
});

module.exports = router;