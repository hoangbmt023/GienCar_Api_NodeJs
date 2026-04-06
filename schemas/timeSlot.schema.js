const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema(
    {
        timeLabel: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    },
    {
        collection: "booking_time_slots"
    }
);

module.exports = mongoose.model("timeSlot", TimeSlotSchema);