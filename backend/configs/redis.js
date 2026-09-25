// const { createClient } = require("redis");

// const redisClient = createClient({
//   url: process.env.REDIS_URL,
// });

// redisClient.on("connect", () => {
//   console.log("Redis Connected");
// });

// redisClient.on("error", (error) => {
//   console.error("Redis Error:", error.message);
// });

// const connectRedis = async () => {
//   try {
//     await redisClient.connect();
//   } catch (error) {
//     console.error(
//       "Redis Connection Failed:",
//       error.message
//     );
//   }
// };

// module.exports = {
//   redisClient,
//   connectRedis,
// };