const mongoose = require("mongoose");
const slugify = require("slugify");

const CarSeriesSchema = new mongoose.Schema(
    {
        brandId: { type: mongoose.Schema.Types.ObjectId, ref: "brand", required: true },

        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },

        description: { type: String, default: "" },
        imageUrl: { type: String, default: null },

        priceFrom: { type: Number, default: 0 },

        orderIndex: { type: Number, default: 0 },

        highlight: { type: Boolean, default: false },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE",
        },
    },
    { timestamps: true }
);

// auto slug
CarSeriesSchema.pre("validate", function () {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

module.exports = mongoose.model("car-series", CarSeriesSchema);