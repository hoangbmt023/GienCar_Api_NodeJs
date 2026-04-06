const mongoose = require("mongoose");
const slugify = require("slugify");

const MenuSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        orderIndex: { type: Number, default: 1 },
        isActive: { type: Boolean, default: true },

        locale: [{ type: String, enum: ["VI", "EN"] }],
        type: [{ type: String, enum: ["HEADER", "FOOTER"] }],

        url: { type: String, default: "" },
        target: [{ type: String }],

        parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    { timestamps: true }
);

// auto slug
MenuSchema.pre("validate", function () {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

module.exports = mongoose.model("menu", MenuSchema);