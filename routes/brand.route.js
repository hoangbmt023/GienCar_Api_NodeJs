var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const brandController = require("../controllers/brand.controller");
const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const resultDTO = require("../untils/results/result.dto");
const { CheckLogin, CheckRole } = require("../untils/authHandler");

// GET
router.get("/", async function (req, res, next) {
    try {
        let result = await brandController.getAll(req.query);
        return res.send(resultList.success(result.data, "Lấy danh sách brand thành công", result.pagination));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// CREATE (multipart)
router.post("/", /* CheckLogin, CheckRole("ADMIN"), */ upload.single("logoFile"), async function (req, res, next) {
    try {
        let result = await brandController.create(req.body, req.file);
        return res.send(resultDTO.success(result, "Tạo brand thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// UPDATE
router.put("/:id", /* CheckLogin, CheckRole("ADMIN"), */ upload.single("logoFile"), async function (req, res, next) {
    try {
        let result = await brandController.update(req.params.id, req.body, req.file);
        return res.send(resultDTO.success(result, "Cập nhật brand thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// DELETE
router.delete("/:id", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        await brandController.delete(req.params.id);
        return res.send(resultNoData.success("Xóa brand thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

module.exports = router;