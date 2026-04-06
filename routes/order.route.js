var express = require("express");
var router = express.Router();

const mongoose = require("mongoose");

const controller = require("../controllers/order.controller");

const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");

const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const { toOrderResponse, toOrderListResponse } = require("../mappers/order.mapper");

const Car = require("../schemas/car.schema");
const Branch = require("../schemas/branch.schema");

const OrderStatus = require("../model/order/enums/order-status.enum");

const { v4: uuidv4 } = require("uuid");


// ================= CREATE ORDER =================
router.post("/", async function (req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            userId,
            userName,
            userPhone,
            userEmail,
            userAddress,
            description,
            items
        } = req.body || {};

        if (!userName || !userPhone || !userEmail) {
            throw ApiError.badRequest("Thiếu thông tin người dùng");
        }

        if (!items?.length) {
            throw ApiError.badRequest("Danh sách sản phẩm rỗng");
        }

        for (let i of items) {
            if (!i.carId || !i.colorId || i.quantity <= 0) {
                throw ApiError.badRequest("Item không hợp lệ");
            }
        }

        const carIds = items.map(i => i.carId);
        const cars = await Car.find({ _id: { $in: carIds } }).session(session);
        const carMap = new Map(cars.map(c => [c._id.toString(), c]));

        let orderItems = [];
        let totalPrice = 0;
        let totalDeposit = 0;

        for (let itemReq of items) {
            let car = carMap.get(itemReq.carId);
            if (!car) throw ApiError.notFound("Car không tồn tại");

            if (car.quantity < itemReq.quantity) {
                throw ApiError.badRequest("Không đủ số lượng");
            }

            car.quantity -= itemReq.quantity;
            await car.save({ session });

            let color = car.exteriorColors.find(
                c => String(c.colorId) === String(itemReq.colorId)
            );

            if (!color) throw ApiError.badRequest("Color không hợp lệ");

            let price = car.price;
            let subtotal = price * itemReq.quantity;

            let deposit = null;

            if (car.depositPercentage > 0) {
                let amount = price * car.depositPercentage * itemReq.quantity;

                deposit = {
                    percentage: car.depositPercentage,
                    amount
                };

                totalDeposit += amount;
            }

            totalPrice += subtotal;

            orderItems.push({
                carId: car._id,
                carName: car.name,
                carColor: {
                    colorId: color.colorId,
                    imageUrl: color.imageUrl
                },
                quantity: itemReq.quantity,
                price,
                subtotal,
                deposit
            });
        }

        let order = await controller.create({
            orderCode: "ORD-" + uuidv4(),

            userId,
            userName,
            userPhone,
            userEmail,
            userAddress,
            description,

            orderItems,
            totalPrice,
            totalDeposit,

            orderDate: new Date(),
            status: OrderStatus.PENDING
        }, session);

        await session.commitTransaction();

        return res.send(
            resultDTO.success(toOrderResponse(order), "Tạo đơn hàng thành công")
        );

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});


// ================= MY ORDERS =================
router.get("/my-orders", async function (req, res, next) {
    try {
        let userId = req.query.userId;

        if (!userId) throw ApiError.badRequest("Thiếu userId");

        const { page, size, skip, sort } = buildPaging(req.query);

        let [data, total] = await Promise.all([
            controller.findOrders({ userId }, sort, skip, size),
            controller.count({ userId })
        ]);

        return res.send(
            resultList.success(
                toOrderListResponse(data),
                "Lấy đơn hàng của tôi",
                createPagination({ page, size, total })
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= GET MY ORDER =================
router.get("/:id", async function (req, res, next) {
    try {
        let userId = req.query.userId;
        if (!userId) throw ApiError.badRequest("Thiếu userId");

        let order = await controller.findById(req.params.id);

        if (String(order.userId) !== String(userId)) {
            throw ApiError.forbidden("Không có quyền");
        }

        return res.send(
            resultDTO.success(toOrderResponse(order), "Lấy chi tiết")
        );

    } catch (error) {
        next(error);
    }
});


// ================= SALE =================
router.get("/sale", async function (req, res, next) {
    try {
        const { page, size, skip, sort } = buildPaging(req.query);

        let filter = {};

        if (req.query.status) {
            const status = req.query.status.toUpperCase();

            if (!Object.values(OrderStatus).includes(status)) {
                throw ApiError.badRequest("Status không hợp lệ");
            }

            filter.status = status;
        }

        if (req.query.userPhone) filter.userPhone = req.query.userPhone;
        if (req.query.orderCode) filter.orderCode = req.query.orderCode;

        let [data, total] = await Promise.all([
            controller.findOrders(filter, sort, skip, size),
            controller.count(filter)
        ]);

        return res.send(
            resultList.success(
                toOrderListResponse(data),
                "Danh sách đơn",
                createPagination({ page, size, total })
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= PAY =================
router.patch("/:id/pay", async function (req, res, next) {
    try {
        const userId = req.body?.userId;
        if (!userId) throw ApiError.badRequest("Thiếu userId");

        let order = await controller.findById(req.params.id);

        if (String(order.userId) !== String(userId)) {
            throw ApiError.forbidden("Không có quyền");
        }

        if (order.status !== OrderStatus.PENDING) {
            throw ApiError.badRequest("Sai trạng thái");
        }

        order.status = OrderStatus.PAY;

        await controller.save(order);

        return res.send(resultDTO.success(toOrderResponse(order), "Đã gửi thanh toán"));

    } catch (error) {
        next(error);
    }
});


// ================= CONFIRM PAID =================
router.patch("/:id/confirm-paid", async function (req, res, next) {
    try {
        let order = await controller.findById(req.params.id);

        if (order.status !== OrderStatus.PAY) {
            throw ApiError.badRequest("Sai trạng thái");
        }

        order.status = OrderStatus.PAID;

        await controller.save(order);

        return res.send(resultDTO.success(toOrderResponse(order), "Đã xác nhận"));

    } catch (error) {
        next(error);
    }
});


// ================= CONFIRM =================
router.patch("/:id/confirm", async function (req, res, next) {
    try {
        let { branchId } = req.body || {};
        if (!branchId) throw ApiError.badRequest("Thiếu branchId");

        let order = await controller.findById(req.params.id);

        if (order.status !== OrderStatus.PAID) {
            throw ApiError.badRequest("Chưa thanh toán");
        }

        let branch = await Branch.findById(branchId);
        if (!branch) throw ApiError.notFound("Branch không tồn tại");

        order.deliveryBranch = {
            branchId: branch._id,
            branchName: branch.name,
            branchAddress: branch.address,
            branchCity: branch.city,
            branchPhone: branch.phone,
            branchEmail: branch.email,
            branchMapUrl: branch.mapUrl
        };

        order.status = OrderStatus.CONFIRMED;

        await controller.save(order);

        return res.send(resultDTO.success(toOrderResponse(order), "Hoàn tất"));

    } catch (error) {
        next(error);
    }
});


// ================= CANCEL =================
router.patch("/:id/cancel", async function (req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.body?.userId;
        const isSale = req.body?.isSale;

        let order = await controller.findById(req.params.id);

        if (!isSale && String(order.userId) !== String(userId)) {
            throw ApiError.forbidden("Không có quyền");
        }

        if (![OrderStatus.PENDING, OrderStatus.PAY].includes(order.status)) {
            throw ApiError.badRequest("Không thể hủy");
        }

        for (let item of order.orderItems) {
            let car = await Car.findById(item.carId).session(session);
            if (car) {
                car.quantity += item.quantity;
                await car.save({ session });
            }
        }

        order.status = OrderStatus.CANCELLED;

        await controller.save(order, session);

        await session.commitTransaction();

        return res.send(resultDTO.success(toOrderResponse(order), "Hủy thành công"));

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});

module.exports = router;