// Format user khi được populate (tương tự toUserProfileResponse)
const toUserInMessage = (user) => {
  if (!user || !user._id) return user; // chưa populate → trả nguyên ObjectId
  return {
    id: user._id,
    email: user.email ?? null,
    lastSeen: user.lastSeen ?? null,
  };
};

const toMessageResponse = (msg) => ({
  id: msg._id,
  from: toUserInMessage(msg.from),
  to: toUserInMessage(msg.to),
  content: msg.content,
  roomId: msg.roomId,
  type: msg.type ? msg.type.toLowerCase().trim() : "text",
  isSeen: msg.isSeen,
  createdAt: msg.createdAt,
  updatedAt: msg.updatedAt,
});

const toConversationResponse = (conv, myUserId) => {
  const lm = conv.lastMessage;
  const profile = conv.otherProfile;
  
  // Lấy ID người gửi và nhận để xác định ai là "người kia"
  const fromId = lm.from && lm.from._id ? lm.from._id.toString() : lm.from?.toString();
  const otherUser = fromId === myUserId.toString() ? lm.to : lm.from;

  let mappedOtherUser = toUserInMessage(otherUser);
  if (profile) {
    mappedOtherUser.fullName = profile.fullName ?? "";
    mappedOtherUser.avatar = profile.avatar ?? "";
  }

  return {
    roomId: lm.roomId,
    otherUser: mappedOtherUser,
    lastMessage: toMessageResponse(lm),
    unreadCount: conv.unreadCount,
  };
};

module.exports = { toMessageResponse, toConversationResponse };
