const CarSeries = require("../schemas/car-series.schema");
const ApiError = require("../utils/errors/api-error");

const CarSeriesController = {

    findSeries: async function (filter, sort, skip, limit) {
        return await CarSeries.find(filter).sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await CarSeries.countDocuments(filter);
    },

    findById: async function (id) {
        let s = await CarSeries.findById(id);
        if (!s) throw ApiError.notFound("CarSeries không tồn tại");
        return s;
    },

    findOne: async function (filter) {
        return await CarSeries.findOne(filter);
    },

    findMaxOrder: async function () {
        return await CarSeries.find().sort({ orderIndex: -1 }).limit(1);
    },

    findByOrder: async function (orderIndex) {
        return await CarSeries.findOne({ orderIndex });
    },

    findAll: async function () {
        return await CarSeries.find();
    },

    create: async function (data) {
        let s = new CarSeries(data);
        return await s.save();
    },

    save: async function (s) {
        return await s.save();
    },

    deleteById: async function (id) {
        let s = await CarSeries.findById(id);
        if (!s) throw ApiError.notFound("CarSeries không tồn tại");

        return await CarSeries.findByIdAndDelete(id);
    }
};

module.exports = CarSeriesController;