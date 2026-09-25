const apiResponse = (statusCode, message, data = null) => {
  return {
    success: true,
    statusCode,
    message,
    data
  };
};

module.exports = apiResponse;