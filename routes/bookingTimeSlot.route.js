var express = require("express");
var router = express.Router();

const controller = require("../controllers/bookingTimeSlot.controller");
const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const {
    toTimeSlotResponse,
    toTimeSlotListResponse,
} = require("../mappers/bookingTimeSlot.mapper");

const { CheckLogin, CheckRole } = require("../utils/authHandler");

const {
    CreateTimeSlotRequestValidator,
    UpdateTimeSlotRequestValidator,
} = require("../utils/validators/bookingtimeslot.validator");

const validateResult = require("../utils/validators/validate-result");

// ================= GET ALL =================
router.get("/", async function (req, res, next) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let filter = {};
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === "true";
        }

        let [slots, total] = await Promise.all([
            controller.findSlots(filter, sort, skip, size),
            controller.count(filter),
        ]);

        if (!slots.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toTimeSlotListResponse(slots),
                "Lấy danh sách khung giờ thành công",
                createPagination({ page, size, total })
            )
        );
    } catch (error) {
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});

// ================= GET ACTIVE =================
router.get("/active", async function (req, res, next) {
    try {
        let slots = await controller.findSlots({ isActive: true });

        if (!slots.length) {
            return res.send(resultList.success([], "Danh sách rỗng"));
        }

        return res.send(
            resultList.success(
                toTimeSlotListResponse(slots),
                "Lấy danh sách khung giờ hoạt động thành công"
            )
        );
    } catch (error) {
        return res
            .status(error.status || 500)
            .send(resultNoData.fail(error.message));
    }
});

// ================= CREATE =================
router.post(
    "/",
    CheckLogin,
    CheckRole("ADMIN"),
    CreateTimeSlotRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            const { timeLabel } = req.body;

            let existed = await controller.findOne({ timeLabel });
            if (existed) {
                throw ApiError.duplicate("Time slot đã tồn tại");
            }

            let slot = await controller.create({
                timeLabel,
                isActive: true,
            });

            return res.send(
                resultDTO.success(
                    toTimeSlotResponse(slot),
                    "Tạo khung giờ thành công"
                )
            );
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

// ================= UPDATE =================
router.put(
    "/:id",
    CheckLogin,
    CheckRole("ADMIN"),
    UpdateTimeSlotRequestValidator,
    validateResult,
    async function (req, res, next) {
        try {
            let slot = await controller.findById(req.params.id);

            // check duplicate nếu đổi tên
            if (
                req.body.timeLabel &&
                req.body.timeLabel !== slot.timeLabel
            ) {
                let existed = await controller.findOne({
                    timeLabel: req.body.timeLabel,
                });
                if (existed) {
                    throw ApiError.duplicate("Time slot đã tồn tại");
                }
            }

            slot.timeLabel = req.body.timeLabel ?? slot.timeLabel;
            slot.isActive = req.body.isActive ?? slot.isActive;

            await controller.save(slot);

            return res.send(
                resultDTO.success(
                    toTimeSlotResponse(slot),
                    "Cập nhật khung giờ thành công"
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
    "/:id",
    CheckLogin,
    CheckRole("ADMIN"),
    async function (req, res, next) {
        try {
            await controller.deleteById(req.params.id);

            return res.send(
                resultNoData.success("Xóa khung giờ thành công")
            );
        } catch (error) {
            return res
                .status(error.status || 500)
                .send(resultNoData.fail(error.message));
        }
    }
);

module.exports = router;