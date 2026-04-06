const mongoose = require("mongoose");
const slugify = require("slugify");

const ColorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, default: "" },
        imageUrl: { type: String, default: null },
    },
    { timestamps: true }
);

ColorSchema.pre("validate", function () {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

module.exports = mongoose.model("color", ColorSchema);