const Car = require("../schemas/car.schema");
const ApiError = require("../utils/errors/api-error");

const CarController = {

    // ================= FIND =================
    findCars: async function (filter, sort, skip, limit) {
        return await Car.find(filter).sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await Car.countDocuments(filter);
    },

    findOne: async function (filter) {
        return await Car.findOne(filter);
    },

    findById: async function (id) {
        let car = await Car.findById(id);
        if (!car) throw ApiError.notFound("Car không tồn tại");
        return car;
    },

    findAll: async function () {
        return await Car.find();
    },

    // ================= CREATE =================
    create: async function (data) {
        let car = new Car(data);
        return await car.save();
    },

    // ================= SAVE =================
    save: async function (car) {
        return await car.save();
    },

    // ================= DELETE =================
    deleteById: async function (id) {
        let car = await Car.findById(id);
        if (!car) throw ApiError.notFound("Car không tồn tại");

        return await Car.findByIdAndDelete(id);
    }
};

module.exports = CarController;