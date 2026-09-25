const generateBookingCode = () => {
  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `CP-${randomNumber}`;
};

module.exports = generateBookingCode;