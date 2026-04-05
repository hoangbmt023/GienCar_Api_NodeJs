const BookingTimeSlot = require("../schemas/bookingTimeSlot.schema");
const ApiError = require("../untils/errors/api-error");
const buildPaging = require("../untils/requests/paging-request");
const createPagination = require("../untils/results/result-pagination");
const { toTimeSlotResponse, toTimeSlotListResponse } = require("../mappers/bookingTimeSlot.mapper");

const BookingTimeSlotController = {

    // GET ALL (admin)
    getAll: async function (query) {
        const { isActive } = query;
        const { page, size, skip, sort } = buildPaging(query);

        let filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        let [data, total] = await Promise.all([
            BookingTimeSlot.find(filter).sort(sort).skip(skip).limit(size),
            BookingTimeSlot.countDocuments(filter),
        ]);

        return {
            data: toTimeSlotListResponse(data),
            pagination: createPagination({ page, size, total }),
        };
    },

    // GET ACTIVE (public)
    getAllActive: async function () {
        let data = await BookingTimeSlot.find({ isActive: true });

        return {
            data: toTimeSlotListResponse(data),
        };
    },

    // CREATE
    create: async function (body) {
        let { timeLabel } = body;

        if (await BookingTimeSlot.exists({ timeLabel })) {
            throw ApiError.duplicate("Time slot đã tồn tại");
        }

        let slot = new BookingTimeSlot({ timeLabel });

        await slot.save();

        return toTimeSlotResponse(slot);
    },

    // UPDATE
    update: async function (id, body) {
        let slot = await BookingTimeSlot.findById(id);
        if (!slot) throw ApiError.notFound("Time slot không tồn tại");

        if (
            body.timeLabel &&
            body.timeLabel !== slot.timeLabel &&
            await BookingTimeSlot.exists({ timeLabel: body.timeLabel })
        ) {
            throw ApiError.duplicate("Time slot đã tồn tại");
        }

        slot.timeLabel = body.timeLabel ?? slot.timeLabel;
        slot.isActive = body.isActive ?? slot.isActive;

        await slot.save();

        return toTimeSlotResponse(slot);
    },

    // DELETE
    delete: async function (id) {
        let exists = await BookingTimeSlot.findById(id);
        if (!exists) throw ApiError.notFound("Time slot không tồn tại");

        await BookingTimeSlot.findByIdAndDelete(id);
    },
};

module.exports = BookingTimeSlotController;