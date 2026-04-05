const mongoose = require("mongoose");

const BookingTimeSlotSchema = new mongoose.Schema(
    {
        timeLabel: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("booking_time_slot", BookingTimeSlotSchema);