const mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
        mapUrl: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("branch", BranchSchema);