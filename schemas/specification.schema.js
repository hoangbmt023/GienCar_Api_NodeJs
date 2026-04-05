const mongoose = require("mongoose");

// ================= SUB SCHEMA =================

const EngineSchema = new mongoose.Schema({
    name: String,
    capacityCc: Number,
    layout: String,
    powerKw: Number,
}, { _id: false });

const EfficiencySchema = new mongoose.Schema({
    maxSpeedKmH: Number,
    acceleration0To100: Number,
    acceleration0To160: Number,
}, { _id: false });

const BodySchema = new mongoose.Schema({
    lengthMm: Number,
    widthMm: Number,
    heightMm: Number,
    wheelBaseMm: Number,
    payloadKg: Number,
    luggageCapacityL: Number,
}, { _id: false });

const ConsumptionSchema = new mongoose.Schema({
    urbanLPer100Km: Number,
    extraUrbanLPer100Km: Number,
    combinedLPer100Km: Number,
    co2EmissionsGPerKm: Number,
}, { _id: false });

// ================= MAIN =================

const SpecificationSchema = new mongoose.Schema(
    {
        carId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "car",
            required: true,
            unique: true,
        },

        engine: EngineSchema,
        efficiency: EfficiencySchema,
        body: BodySchema,
        consumption: ConsumptionSchema,
    },
    { timestamps: true }
);

module.exports = mongoose.model("specification", SpecificationSchema);