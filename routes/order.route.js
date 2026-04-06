var express = require("express");
var router = express.Router();

const mongoose = require("mongoose");

const controller = require("../controllers/order.controller");

const resultNoData = require("../utils/results/result-nodata");
const resultList = require("../utils/results/result-list");
const resultDTO = require("../utils/results/result.dto");
const ApiError = require("../utils/errors/api-error");
const vnPayService = require("../utils/vnpay.util");
const emailUtil = require("../utils/email.util");

const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const { toOrderResponse, toOrderListResponse } = require("../mappers/order.mapper");

const Car = require("../schemas/car.schema");
const Branch = require("../schemas/branch.schema");

const OrderStatus = require("../model/order/enums/order-status.enum");

const { v4: uuidv4 } = require("uuid");

const { CheckLogin, CheckRole } = require("../utils/authHandler");

function getClientIp(req) {
    let ip =
        req.headers["x-forwarded-for"] ||
        req.headers["proxy-client-ip"] ||
        req.socket?.remoteAddress;

    if (ip && ip.includes(",")) {
        ip = ip.split(",")[0].trim();
    }

    return ip || "127.0.0.1";
}

// ================= CREATE =================
router.post("/", CheckLogin, async function (req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user?._id || req.body?.userId;

        const {
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

        return res.send(resultDTO.success(toOrderResponse(order), "Tạo đơn hàng thành công"));

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});


// ================= MY ORDERS =================
router.get("/my-orders", CheckLogin, async function (req, res, next) {
    try {
        const userId = req.user?._id || req.query.userId;

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


// ================= SALE =================
router.get("/sale", CheckLogin, CheckRole("SALE", "ADMIN"), async function (req, res, next) {
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

// ================= VNPAY PAYMENT =================
router.post("/:id/vnpay-payment", CheckLogin, async function (req, res, next) {
    try {
        const userId = req.user?._id || req.body?.userId;

        let order = await controller.findById(req.params.id);

        if (String(order.userId) !== String(userId)) {
            throw ApiError.forbidden("Không có quyền");
        }

        let amount =
            order.totalDeposit && order.totalDeposit > 0
                ? order.totalDeposit
                : order.totalPrice;

        let orderInfo = `Thanh toan don hang ${order.orderCode}`;
        let clientIp = getClientIp(req);

        const paymentUrl = vnPayService.createPaymentUrl({
            orderId: order._id.toString(),
            amount,
            orderInfo,
            ip: clientIp
        });

        return res.send(
            resultDTO.success(
                { paymentUrl },
                "Tạo link thanh toán VNPay thành công"
            )
        );

    } catch (error) {
        next(error);
    }
});


// ================= VNPAY CALLBACK =================
router.get("/vnpay-callback", async function (req, res, next) {
    try {
        const params = req.query;

        const frontendUrl = process.env.VNPAY_FRONTEND_RETURN_URL;

        const isValid = vnPayService.verifyCallback(params);

        if (!isValid) {
            return res.redirect(
                `${frontendUrl}?success=false&message=Chu_ky_khong_hop_le`
            );
        }

        const responseCode = params.vnp_ResponseCode;
        const orderId = params.vnp_TxnRef;

        let order;

        try {
            order = await controller.findById(orderId);
        } catch (e) {
            return res.redirect(
                `${frontendUrl}?success=false&orderId=${orderId}&message=Khong_tim_thay_don`
            );
        }

        if (responseCode === "00") {
            if (order.status === OrderStatus.PENDING) {
                order.status = OrderStatus.PAY;
                await controller.save(order);
            }

            return res.redirect(
                `${frontendUrl}?success=true&orderId=${order._id}&orderCode=${order.orderCode}&message=Thanh_toan_thanh_cong`
            );
        } else {
            order.status = OrderStatus.CANCELLED;
            await controller.save(order);

            return res.redirect(
                `${frontendUrl}?success=false&orderId=${order._id}&orderCode=${order.orderCode}&message=Thanh_toan_that_bai`
            );
        }

    } catch (error) {
        next(error);
    }
});

// ================= GET DETAIL =================
router.get("/:id", CheckLogin, async function (req, res, next) {
    try {
        const userId = req.user?._id || req.query.userId;

        let order = await controller.findById(req.params.id);

        if (userId && String(order.userId) !== String(userId)) {
            throw ApiError.forbidden("Không có quyền");
        }

        return res.send(resultDTO.success(toOrderResponse(order), "Lấy chi tiết"));

    } catch (error) {
        next(error);
    }
});

// ================= PAY =================
router.patch("/:id/pay", CheckLogin, async function (req, res, next) {
    try {
        const userId = req.user?._id || req.body?.userId;

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
router.patch("/:id/confirm-paid", CheckLogin, CheckRole("SALE", "ADMIN"), async function (req, res, next) {
    try {
        let order = await controller.findById(req.params.id);

        if (order.status !== OrderStatus.PAY) {
            throw ApiError.badRequest("Sai trạng thái");
        }

        order.status = OrderStatus.PAID;

        await controller.save(order);

        // gửi email
        if (order.userEmail) {
            emailUtil.sendOrderPaidEmail(order.userEmail, order)
                .catch(err => {
                    console.error("Send paid email failed:", err.message);
                });
        }

        return res.send(
            resultDTO.success(toOrderResponse(order), "Đã xác nhận")
        );

    } catch (error) {
        next(error);
    }
});

// ================= CONFIRM =================
router.patch("/:id/confirm", CheckLogin, CheckRole("SALE", "ADMIN"), async function (req, res, next) {
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

        // gửi email
        if (order.userEmail) {
            emailUtil.sendOrderConfirmedEmail(order.userEmail, order)
                .catch(err => {
                    console.error("Send confirmed email failed:", err.message);
                });
        }

        return res.send(
            resultDTO.success(toOrderResponse(order), "Hoàn tất")
        );

    } catch (error) {
        next(error);
    }
});

// ================= CANCEL =================
router.patch("/:id/cancel", CheckLogin, CheckRole("SALE", "ADMIN"), async function (req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user?._id || req.body?.userId;

        let order = await controller.findById(req.params.id);

        if (String(order.userId) !== String(userId)) {
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