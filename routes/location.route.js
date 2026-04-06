var express = require("express");
var router = express.Router();

const controller = require("../controllers/location.controller");

// PROVINCES
router.get("/provinces", async function (req, res, next) {
    try {
        let data = await controller.getProvinces();
        return res.send(data);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

// DISTRICTS
router.get("/districts/:code", async function (req, res, next) {
    try {
        let data = await controller.getDistricts(req.params.code);
        return res.send(data);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

// WARDS
router.get("/wards/:code", async function (req, res, next) {
    try {
        let data = await controller.getWards(req.params.code);
        return res.send(data);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

module.exports = router;