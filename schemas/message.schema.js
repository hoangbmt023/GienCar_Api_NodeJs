const mongoose = require("mongoose");
const TypeMessage = require("../model/message/enum/type-message.enum");

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    roomId: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(TypeMessage),
      default: TypeMessage.TEXT,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // tự tạo createdAt, updatedAt
  },
);

module.exports = mongoose.model("message", messageSchema);
