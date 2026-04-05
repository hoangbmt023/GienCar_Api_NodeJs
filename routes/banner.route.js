var express = require("express");
var router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const bannerController = require("../controllers/banner.controller");

const resultNoData = require("../untils/results/result-nodata");
const resultList = require("../untils/results/result-list");
const { CheckLogin, CheckRole } = require("../untils/authHandler");

// GET ACTIVE BANNERS
router.get("/", async function (req, res, next) {
    try {
        let result = await bannerController.getActiveBanners(req.query);
        return res.send(resultList.success(result, "Lấy danh sách banner thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
});

// CREATE
router.post("/", /* CheckLogin, CheckRole("ADMIN"), */ upload.single("imageFile"), async function (req, res, next) {
    try {
        await bannerController.create(req.body, req.file);
        return res.send(resultNoData.success("Tạo banner thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
}
);

// MOVE
router.put("/move", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        await bannerController.move(req.body);
        return res.send(resultNoData.success("Di chuyển banner thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
}
);

// DELETE
router.delete("/", /* CheckLogin, CheckRole("ADMIN"), */ async function (req, res, next) {
    try {
        await bannerController.delete(req.body);
        return res.send(resultNoData.success("Xóa banner thành công"));
    } catch (error) {
        return res.status(error.status || 500).send(resultNoData.fail(error.message));
    }
}
);

module.exports = router;