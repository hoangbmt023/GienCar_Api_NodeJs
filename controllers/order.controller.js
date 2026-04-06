const Order = require("../schemas/order.schema");
const ApiError = require("../utils/errors/api-error");

const OrderController = {

    // ================= FIND =================
    findOrders: async function (filter, sort, skip, limit) {
        return await Order.find(filter).sort(sort).skip(skip).limit(limit);
    },

    count: async function (filter) {
        return await Order.countDocuments(filter);
    },

    findOne: async function (filter) {
        return await Order.findOne(filter);
    },

    findById: async function (id) {
        let order = await Order.findById(id);
        if (!order) throw ApiError.notFound("Order không tồn tại");
        return order;
    },

    // ================= CREATE =================
    create: async function (data) {
        let order = new Order(data);
        return await order.save();
    },

    // ================= SAVE =================
    save: async function (order) {
        return await order.save();
    }
};

module.exports = OrderController;