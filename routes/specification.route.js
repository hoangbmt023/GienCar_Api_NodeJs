var express = require("express");
var router = express.Router();

const controller = require("../controllers/specification.controller");

const resultNoData = require("../utils/results/result-nodata");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const { toSpecificationResponse } = require("../mappers/specification.mapper");

const { CheckLogin, CheckRole } = require("../utils/authHandler");

const {
    SpecificationRequestValidator,
} = require("../utils/validators/specifications.validator");

const validateResult = require("../utils/validators/validate-result");

// relation
const Car = require("../schemas/car.schema");

// ================= GET =================
router.get("/:carId/specifications", async function (req, res, next) {
    try {
        let spec = await controller.findByCarId(req.params.carId);

        return res.send(
            resultDTO.success(
                toSpecificationResponse(spec),
                "Lấy thông số kỹ thuật thành công"
            )
        );
    } catch (error) {
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});

// ================= UPSERT =================
router.put(
    "/:carId/specifications",
    CheckLogin,
    CheckRole("ADMIN"),
    SpecificationRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            let carId = req.params.carId;

            // business logic
            let car = await Car.findById(carId);
            if (!car) throw ApiError.notFound("Car không tồn tại");

            let { engine, efficiency, body, consumption } = req.body;

            let spec = await controller.findOne({ carId });

            if (!spec) {
                // CREATE
                spec = await controller.create({
                    carId,
                    engine,
                    efficiency,
                    body,
                    consumption,
                });
            } else {
                // UPDATE
                spec.engine = engine;
                spec.efficiency = efficiency;
                spec.body = body;
                spec.consumption = consumption;

                await controller.save(spec);
            }

            return res.send(
                resultDTO.success(
                    toSpecificationResponse(spec),
                    "Lưu thông số kỹ thuật thành công"
                )
            );
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

// ================= DELETE =================
router.delete(
    "/:carId/specifications",
    CheckLogin,
    CheckRole("ADMIN"),
    async function (req, res, next) {
        try {
            await controller.deleteByCarId(req.params.carId);

            return res.send(
                resultNoData.success("Xóa thông số kỹ thuật thành công")
            );
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

module.exports = router;