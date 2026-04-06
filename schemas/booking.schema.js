const OrderStatus = require("../model/order/enums/order-status.enum");

const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },

        carModelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "car",
            required: true
        },

        bookingDate: { type: Date, required: true },

        timeSlot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "timeSlot",
            default: null
        },

        status: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "CANCELLED"],
            default: "PENDING"
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("booking", BookingSchema);