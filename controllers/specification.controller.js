const Specification = require("../schemas/specification.schema");
const Car = require("../schemas/car.schema");
const ApiError = require("../untils/errors/api-error");

const { toSpecificationResponse } = require("../mappers/specification.mapper");

const SpecificationController = {

    // ================= GET =================
    getByCarId: async function (carId) {
        let spec = await Specification.findOne({ carId });

        if (!spec) {
            throw ApiError.notFound("Specification không tồn tại");
        }

        return toSpecificationResponse(spec);
    },

    // ================= UPSERT =================
    upsert: async function (carId, body) {

        // check car tồn tại
        let car = await Car.findById(carId);
        if (!car) throw ApiError.notFound("Car không tồn tại");

        let spec = await Specification.findOne({ carId });

        let data = {
            carId,
            engine: body.engine,
            efficiency: body.efficiency,
            body: body.body,
            consumption: body.consumption,
        };

        if (!spec) {
            // CREATE
            spec = new Specification(data);
        } else {
            // UPDATE
            Object.assign(spec, data);
        }

        await spec.save();

        return toSpecificationResponse(spec);
    },

    // ================= DELETE =================
    deleteByCarId: async function (carId) {
        let exists = await Specification.exists({ carId });

        if (!exists) {
            throw ApiError.notFound("Specification không tồn tại");
        }

        await Specification.deleteOne({ carId });
    },
};

module.exports = SpecificationController;