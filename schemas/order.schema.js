const mongoose = require("mongoose");
const OrderStatus = require("../model/order/enums/order-status.enum");

const OrderDepositSchema = new mongoose.Schema(
  {
    percentage: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false },
);

const OrderItemSchema = new mongoose.Schema(
  {
    carId: { type: mongoose.Schema.Types.ObjectId, ref: "car", required: true },
    carName: { type: String, required: true },

    carColor: {
      colorId: mongoose.Schema.Types.ObjectId,
      imageUrl: String,
    },

    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },

    deposit: OrderDepositSchema,
  },
  { _id: false },
);

const OrderBranchSchema = new mongoose.Schema(
  {
    branchId: mongoose.Schema.Types.ObjectId,
    branchName: String,
    branchAddress: String,
    branchCity: String,
    branchPhone: String,
    branchEmail: String,
    branchMapUrl: String,
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true },

    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    userPhone: String,
    userEmail: String,
    userAddress: String,
    description: String,

    orderItems: [OrderItemSchema],

    deliveryBranch: OrderBranchSchema,

    totalPrice: { type: Number, required: true },
    totalDeposit: { type: Number, required: true },

    orderDate: Date,

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("order", OrderSchema);
