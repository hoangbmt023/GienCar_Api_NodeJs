const BookingTimeSlot = require("../schemas/bookingTimeSlot.schema");
const ApiError = require("../utils/errors/api-error");

const BookingTimeSlotController = {

    findSlots: async function (filter, sort, skip, limit) {
        return await BookingTimeSlot.find(filter).sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await BookingTimeSlot.countDocuments(filter);
    },

    findById: async function (id) {
        let slot = await BookingTimeSlot.findById(id);
        if (!slot) throw ApiError.notFound("Time slot không tồn tại");
        return slot;
    },

    findOne: async function (filter) {
        return await BookingTimeSlot.findOne(filter);
    },

    create: async function (data) {
        let slot = new BookingTimeSlot(data);
        return await slot.save();
    },

    save: async function (slot) {
        return await slot.save();
    },

    deleteById: async function (id) {
        let slot = await BookingTimeSlot.findById(id);
        if (!slot) throw ApiError.notFound("Time slot không tồn tại");

        return await BookingTimeSlot.findByIdAndDelete(id);
    }
};

module.exports = BookingTimeSlotController;