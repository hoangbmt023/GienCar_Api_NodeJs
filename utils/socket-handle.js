const jwtUtils = require("./jwt/jwt.util");
const UserController = require("../controllers/user.controller");
const MessageController = require("../controllers/message.controller");
const { toMessageResponse } = require("../mappers/message.mapper");
const { Server } = require("socket.io");

module.exports = {
  SocketServer: function (server) {
    let io = new Server(server);

    // ONLINE STATUS TRACKING
    // Map để track user online status: userId -> { socket, lastHeartbeat, heartbeatTimer }
    const onlineUsers = new Map();
    const HEARTBEAT_TIMEOUT = 60000; 

    const getRoomId = (id1, id2) => {
      return [id1, id2].sort().join("_");
    };

    const setUserOnline = (userId, socket) => {
      const existingUser = onlineUsers.get(userId);

      if (existingUser?.heartbeatTimer) {
        clearTimeout(existingUser.heartbeatTimer);
      }

      console.log("setUserOnline:", userId);

      // Set timeout để mark offline nếu không nhận heartbeat
      const heartbeatTimer = setTimeout(() => {
        onlineUsers.delete(userId);
        io.emit("user_offline", {
          userId: userId,
          lastSeen: new Date(),
        });
      }, HEARTBEAT_TIMEOUT);

      onlineUsers.set(userId, {
        socket,
        lastHeartbeat: new Date(),
        heartbeatTimer,
      });

      io.emit("user_online", {
        userId: userId,
      });
    };

    const removeUserOnline = (userId) => {
      const user = onlineUsers.get(userId);
      if (user?.heartbeatTimer) {
        clearTimeout(user.heartbeatTimer);
      }
      onlineUsers.delete(userId);
    };

    // handshake: server và user kết nối đầu tiên gửi dữ liệu
    io.on("connection", async (socket) => {
      try {
        let token =
          socket.handshake.auth.token || socket.handshake.headers.token;

        let { valid, decoded } = jwtUtils.verifyAccessToken(token);

        if (!valid) {
          socket.emit("error", "Token không hợp lệ");
          return socket.disconnect();
        }

        let user = await UserController.findById(decoded.sub);
        if (!user) {
          socket.emit("error", "User không tồn tại");
          return socket.disconnect();
        }

        socket.userId = user._id.toString();
        socket.join(socket.userId);

        console.log("Socket connected:", socket.userId);

        // Mark user as online
        setUserOnline(socket.userId, socket);

        socket.on("joinChat", (data) => {
          if (!data || !data.otherUserId) return;

          const roomId = getRoomId(socket.userId, data.otherUserId);
          socket.join(roomId);
        });

        // HEARTBEAT HANDLER
        // Nhận heartbeat từ client mỗi 10 giây
        socket.on("heartbeat", (data) => {
          try {
            if (!socket.userId) return;

            // Refresh online status (reset timeout)
            setUserOnline(socket.userId, socket);

            // Optional: Emit back để confirm client
            socket.emit("heartbeat_ack", {
              userId: socket.userId,
              timestamp: new Date(),
            });
          } catch (err) {
            console.error("Heartbeat error:", err);
          }
        });

        socket.on("newMessage", async (data) => {
          try {
            if (!data?.to || !data?.content) {
              return socket.emit("error", "Thiếu dữ liệu gửi tin nhắn");
            }

            const toUser = await UserController.findById(data.to);
            if (!toUser) {
              return socket.emit("error", "Người nhận không tồn tại");
            }

            const roomId = getRoomId(socket.userId, data.to);

            const type =
              data?.type?.toUpperCase() === "IMAGE" ? "IMAGE" : "TEXT";

            let message = await MessageController.createMessage({
              from: socket.userId,
              to: data.to,
              content: data.content,
              roomId,
              type,
            });

            io.to(roomId).emit("newMessage", toMessageResponse(message));
          } catch (error) {
            console.error("newMessage error:", error);
            socket.emit("error", "Gửi tin nhắn thất bại");
          }
        });

        socket.on("disconnect", async () => {
          try {
            if (!socket.userId) return;

            console.log("Socket disconnected:", socket.userId);

            // Remove from online tracking
            removeUserOnline(socket.userId);

            // Update last seen in database
            await UserController.updateLastSeen(socket.userId);

            io.emit("user_offline", {
              userId: socket.userId,
              lastSeen: new Date(),
            });
          } catch (err) {
            console.error("disconnect error:", err);
          }
        });
      } catch (error) {
        console.log("Connection error:", error.message);
        socket.emit("error", "Connection failed");
        socket.disconnect();
      }
    });

    // ================= UTILITY FUNCTIONS =================
    // Lấy danh sách users đang online
    io.getOnlineUsers = function () {
      return Array.from(onlineUsers.keys());
    };

    // Check user có online hay không
    // has kiểm tra tồn tại 
    io.isUserOnline = function (userId) {
      return onlineUsers.has(userId);
    };

    // Get socket của user
    io.getUserSocket = function (userId) {
      return onlineUsers.get(userId)?.socket;
    };

    return io;
  },
};
