const { Server } = require("socket.io");

let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: "*", // Adjust this in production
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
      },
    });

    io.on("connection", (socket) => {
      console.log("New socket connection:", socket.id);

      socket.on("register", (userId) => {
        if (userId) {
          socket.join(userId.toString());
          console.log(`Socket ${socket.id} joined room ${userId}`);
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
