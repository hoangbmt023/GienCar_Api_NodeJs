const mongoose = require("mongoose");
const slugify = require("slugify");

const BrandSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        country: { type: String, default: "" },
        logo: { type: String, default: null },
    },
    { timestamps: true }
);

BrandSchema.pre("validate", function () {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

module.exports = mongoose.model("brand", BrandSchema);