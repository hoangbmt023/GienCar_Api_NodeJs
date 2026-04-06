const mongoose = require("mongoose");
const slugify = require("slugify");

// ================= SUB SCHEMA =================

// Car Image
const CarImageSchema = new mongoose.Schema(
    {
        imageUrl: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

// Car Color
const CarColorSchema = new mongoose.Schema(
    {
        colorId: { type: mongoose.Schema.Types.ObjectId, ref: "color", required: true },
        imageUrl: { type: String, default: null },
    },
    { _id: false }
);

// ================= MAIN SCHEMA =================

const CarSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },

        quantity: { type: Number, default: 0 },

        brandIds: [
            { type: mongoose.Schema.Types.ObjectId, ref: "brand" }
        ],

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            required: true,
        },

        seriesId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "car-series",
            required: true,
        },

        price: { type: Number, default: 0 },

        depositPercentage: { type: Number, default: 0 },

        yearProduce: { type: Number, default: null },

        images: [CarImageSchema],

        exteriorColors: [CarColorSchema],

        description: { type: String, default: "" },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE",
        },
    },
    { timestamps: true }
);

// ================= HOOK =================
CarSchema.pre("validate", function () {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

module.exports = mongoose.model("car", CarSchema);