const Booking = require("../schemas/booking.schema");
const ApiError = require("../utils/errors/api-error");
const TimeSlot = require("../schemas/timeSlot.schema");
const Car = require("../schemas/car.schema");
const emailUtil = require("../utils/email.util");
const mongoose = require("mongoose");

const BookingController = {

    // ================= FIND =================
    findBookings: async function (filter, sort, skip, limit) {
        return await Booking.find(filter).populate("timeSlot").sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await Booking.countDocuments(filter);
    },

    findOne: async function (filter) {
        return await Booking.findOne(filter);
    },

    findById: async function (id) {
        let booking = await Booking.findById(id).populate("timeSlot");;
        if (!booking) throw ApiError.notFound("Booking không tồn tại");
        return booking;
    },

    // ================= CREATE =================
    create: async function (data) {
        let booking = new Booking(data);
        return await booking.save();
    },

    confirmBooking: async function (bookingId, timeSlotInput) {

        const slot = timeSlotInput;

        if (!slot) {
            throw ApiError.badRequest("Thiếu timeSlot");
        }

        let timeSlotDoc = null;

        if (mongoose.Types.ObjectId.isValid(slot)) {
            timeSlotDoc = await TimeSlot.findById(slot);
        }

        if (!timeSlotDoc && typeof slot === "string") {
            const [startTime, endTime] = slot.split(" - ").map(s => s.trim());

            if (startTime && endTime) {
                timeSlotDoc = await TimeSlot.findOne({
                    startTime,
                    endTime
                });
            }
        }

        if (!timeSlotDoc) {
            throw ApiError.notFound("TimeSlot không tồn tại");
        }

        // ================= TRANSACTION =================
        const session = await mongoose.startSession();

        let populatedBooking;

        try {
            session.startTransaction();

            let booking = await Booking.findById(bookingId).session(session);

            if (!booking) {
                throw ApiError.notFound("Booking không tồn tại");
            }

            if (booking.status !== "PENDING") {
                throw ApiError.badRequest("Chỉ có thể xác nhận booking đang PENDING");
            }

            booking.status = "CONFIRMED";
            booking.timeSlot = timeSlotDoc._id;

            await booking.save({ session });

            await session.commitTransaction();

            // ===== LẤY DATA SAU KHI COMMIT =====
            populatedBooking = await Booking.findById(booking._id).populate("timeSlot");

        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }

        // ================= EMAIL (NON-BLOCKING) =================

        // lấy car info
        let car = await Car.findById(populatedBooking.carModelId);

        const carName = car?.name || "";
        const carImageUrl = car?.images?.[0]?.imageUrl || "";

        const bookingDTO = {
            id: populatedBooking._id.toString(),
            name: populatedBooking.name,
            phone: populatedBooking.phone,
            email: populatedBooking.email,
            carModelId: populatedBooking.carModelId?.toString(),
            bookingDate: populatedBooking.bookingDate
                ? populatedBooking.bookingDate.toISOString().split("T")[0]
                : null,
            timeSlot: populatedBooking.timeSlot?.timeLabel || null,
            status: populatedBooking.status,
            createdAt: populatedBooking.createdAt
        };

        // KHÔNG await (tránh block API)
        emailUtil.sendBookingConfirmedEmail(
            populatedBooking.email,
            bookingDTO,
            carName,
            carImageUrl
        ).catch(err => {
            console.error("Send email failed:", err.message);
        });

        return populatedBooking;
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