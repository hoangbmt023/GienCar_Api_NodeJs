var express = require("express");
var router = express.Router();

const controller = require("../controllers/booking.controller");

const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const { toBookingResponse } = require("../mappers/booking.mapper");

// relation
const Car = require("../schemas/car.schema");


// ================= CREATE BOOKING (PUBLIC) =================
router.post("/", async function (req, res, next) {
    try {
        let { name, phone, email, carModelId, bookingDate } = req.body;

        if (!name || !phone || !email || !carModelId || !bookingDate) {
            throw ApiError.badRequest("Thiếu dữ liệu");
        }

        // check car tồn tại
        let car = await Car.findById(carModelId);
        if (!car) throw ApiError.notFound("Car không tồn tại");

        // check duplicate (giống Java service)
        let existed = await controller.findOne({
            carModelId,
            bookingDate: new Date(bookingDate),
            status: { $ne: "CANCELLED" }
        });

        if (existed) {
            throw ApiError.duplicate("Ngày này đã có người đặt");
        }

        let booking = await controller.create({
            name,
            phone,
            email,
            carModelId,
            bookingDate
        });

        return res.send(
            resultDTO.success(
                toBookingResponse(booking),
                "Đặt lịch lái thử thành công"
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= GET ALL (SALE/ADMIN) =================
router.get("/manage", async function (req, res, next) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let filter = {};

        if (req.query.status) {
            filter.status = req.query.status.toUpperCase();
        }

        let [data, total] = await Promise.all([
            controller.findBookings(filter, sort, skip, size),
            controller.count(filter)
        ]);

        if (!data.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                data.map(toBookingResponse),
                "Lấy danh sách booking thành công",
                createPagination({ page, size, total })
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= GET BY ID =================
router.get("/manage/:id", async function (req, res, next) {
    try {
        let booking = await controller.findById(req.params.id);

        return res.send(
            resultDTO.success(
                toBookingResponse(booking),
                "Lấy chi tiết booking thành công"
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= CONFIRM BOOKING =================
router.patch("/manage/:id/confirm", async function (req, res, next) {
    try {
        let { timeSlot } = req.body;

        if (!timeSlot) {
            throw ApiError.badRequest("Thiếu timeSlot");
        }

        let booking = await controller.findById(req.params.id);

        if (booking.status !== "PENDING") {
            throw ApiError.badRequest("Chỉ có thể xác nhận booking đang PENDING");
        }

        booking.status = "CONFIRMED";
        booking.timeSlot = timeSlot;

        await controller.save(booking);

        return res.send(
            resultDTO.success(
                toBookingResponse(booking),
                "Xác nhận booking thành công"
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= CANCEL BOOKING =================
router.patch("/manage/:id/cancel", async function (req, res, next) {
    try {
        let booking = await controller.findById(req.params.id);

        if (booking.status === "CANCELLED") {
            throw ApiError.badRequest("Booking đã bị hủy trước đó");
        }

        booking.status = "CANCELLED";

        await controller.save(booking);

        return res.send(
            resultDTO.success(
                toBookingResponse(booking),
                "Hủy booking thành công"
            )
        );

    } catch (error) {
        next(error);
    }
});


module.exports = router;