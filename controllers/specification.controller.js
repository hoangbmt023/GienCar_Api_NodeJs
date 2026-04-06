const Specification = require("../schemas/specification.schema");
const ApiError = require("../utils/errors/api-error");

const SpecificationController = {

    findOne: async function (filter) {
        return await Specification.findOne(filter);
    },

    findByCarId: async function (carId) {
        let spec = await Specification.findOne({ carId });
        if (!spec) throw ApiError.notFound("Specification không tồn tại");
        return spec;
    },

    create: async function (data) {
        let spec = new Specification(data);
        return await spec.save();
    },

    save: async function (spec) {
        return await spec.save();
    },

    deleteByCarId: async function (carId) {
        let spec = await Specification.findOne({ carId });
        if (!spec) throw ApiError.notFound("Specification không tồn tại");

        return await Specification.deleteOne({ carId });
    }
};

module.exports = SpecificationController;