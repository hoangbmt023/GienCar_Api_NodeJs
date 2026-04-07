const messageModel = require("../schemas/message.schema");
const userProfileModel = require("../schemas/user-profile.schema");
const ApiError = require("../utils/errors/api-error");
const buildPaging = require("../utils/requests/paging-request");
const createPagination = require("../utils/results/result-pagination");

const MessageController = {
  // Tạo tin nhắn mới
  createMessage: async function (data, session) {
    if (data == null) {
      throw ApiError.badRequest("dữ liệu không được để trống");
    }

    data.type = (data.type || "TEXT").toUpperCase();
    const message = new messageModel(data);
    await message.save({ session });
    return message;
  },

  // Lấy danh sách người đã nhắn tin với mình
  getConversations: async function (myUserId) {
    // Lấy danh sách roomId mà mình đã tham gia
    const roomIds = await messageModel.distinct("roomId", {
      $or: [{ from: myUserId }, { to: myUserId }],
    });

    const result = await Promise.all(
      roomIds.map(async (roomId) => {
        // Lấy tin nhắn cuối cùng trong phòng, populate thông tin user
        const lastMessage = await messageModel
          .findOne({ roomId })
          .sort({ createdAt: -1 })
          .populate("from", "email lastSeen")
          .populate("to", "email lastSeen");

        // Đếm số tin nhắn chưa đọc mà người kia gửi đến mình
        const unreadCount = await messageModel.countDocuments({
          roomId,
          to: myUserId,
          isSeen: false,
        });

        // Xác định ID người đang chat cùng
        const fromId = lastMessage.from && lastMessage.from._id ? lastMessage.from._id.toString() : lastMessage.from?.toString();
        const otherUserId = fromId === myUserId.toString() ? (lastMessage.to._id || lastMessage.to) : (lastMessage.from._id || lastMessage.from);

        // Lấy profile (avatar, fullName) của người kia
        const otherProfile = await userProfileModel.findOne({ userId: otherUserId }).select("fullName avatar");

        return { lastMessage, unreadCount, otherProfile };
      })
    );

    // Sắp xếp theo tin nhắn cuối mới nhất
    result.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    return result;
  },

  // Lấy lịch sử tin nhắn giữa mình và người kia (có phân trang)
  getMessages: async function (myUserId, otherUserId, query) {
    const { page, size, skip } = buildPaging(query);

    const filter = {
      $or: [
        { from: myUserId, to: otherUserId },
        { from: otherUserId, to: myUserId },
      ],
    };

    const [data, total] = await Promise.all([
      messageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size)
        .populate("from", "email lastSeen")
        .populate("to", "email lastSeen"),
      messageModel.countDocuments(filter),
    ]);

    // Đánh dấu đã đọc các tin nhắn mình nhận từ người kia
    await messageModel.updateMany(
      { from: otherUserId, to: myUserId, isSeen: false },
      { $set: { isSeen: true } }
    );

    return {
      data: data.reverse(), // trả về thứ tự tăng dần (cũ → mới)
      pagination: createPagination({ page, size, total }),
    };
  },
};

module.exports = MessageController;
