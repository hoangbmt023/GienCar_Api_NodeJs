const mongoose = require("mongoose");
const slugify = require("slugify");

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// auto generate slug
CategorySchema.pre("validate", function () {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

module.exports = mongoose.model("category", CategorySchema);