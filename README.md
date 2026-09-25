# CampusPass
##env file

Make sure to add it


```.env

PORT=3000

MONGODB_URI=mongodb://localhost:27017/campuspass

JWT_SECRET=gjjkjfjkjdflfjudiofdnjkhiogfgmkxchandansinghdfdfjlkdfldlkdf
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

CLIENT_URL=http://localhost:5173

OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10

BOOKING_CODE_PREFIX=CP

QR_FOLDER=campuspass_qr

MAX_FILE_SIZE=5242880

ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@campuspass.com
ADMIN_PASSWORD=Admin@123

```