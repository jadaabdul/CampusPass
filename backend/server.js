const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);


require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./configs/db");
const socketConfig = require("./configs/socket");
const expireBookings = require("./jobs/expireBookings");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  
  // Initialize Socket.IO
  socketConfig.init(server);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Start background jobs
    setInterval(expireBookings, 60 * 1000); // Run every minute
  });
};

startServer();