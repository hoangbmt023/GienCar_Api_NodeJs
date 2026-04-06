const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: "" },

        imageUrl: { type: String, default: null },
        videoUrl: { type: String, default: null },

        ctaText: { type: String, default: "" },
        ctaLink: { type: String, default: "" },

        position: {
            type: String,
            enum: ["HERO_CAR", "HOME_GRID", "CONTENT_CAR", "FEATURED_CAR"],
            required: true,
        },

        isActive: { type: Boolean, default: true },

        order: { type: Number, default: 0 },

        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("banner", BannerSchema);