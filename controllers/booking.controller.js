const Booking = require("../schemas/booking.schema");
const ApiError = require("../utils/errors/api-error");

const BookingController = {

    // ================= FIND =================
    findBookings: async function (filter, sort, skip, limit) {
        return await Booking.find(filter).sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await Booking.countDocuments(filter);
    },

    findOne: async function (filter) {
        return await Booking.findOne(filter);
    },

    findById: async function (id) {
        let booking = await Booking.findById(id);
        if (!booking) throw ApiError.notFound("Booking không tồn tại");
        return booking;
    },

    // ================= CREATE =================
    create: async function (data) {
        let booking = new Booking(data);
        return await booking.save();
    },

    // ================= SAVE =================
    save: async function (booking) {
        return await booking.save();
    },

    // ================= DELETE =================
    deleteById: async function (id) {
        let booking = await Booking.findById(id);
        if (!booking) throw ApiError.notFound("Booking không tồn tại");

        return await Booking.findByIdAndDelete(id);
    }
};

module.exports = BookingController;