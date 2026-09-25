const Notification = require("../models/Notification");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");


// Get all notifications

const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId: req.user.id });

    res.status(200).json(
      apiResponse(
        200,
        "Notifications fetched successfully",
        {
          notifications,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          }
        }
      )
    );
  } catch (error) {
    next(error);
  }
};




// Get unread notification count

const getUnreadCount = async (req, res, next) => {

  try {

    const count =
      await Notification.countDocuments({
        userId: req.user.id,
        isRead: false,
      });


    res
      .status(200)
      .json(
        apiResponse(
          200,
          "Unread count fetched successfully",
          {
            count,
          }
        )
      );


  } catch (error) {
    next(error);
  }

};





// Mark single notification as read

const markAsRead = async (req, res, next) => {

  try {

    const notification =
      await Notification.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });


    if (!notification) {

      throw new ApiError(
        404,
        "Notification not found"
      );

    }


    notification.isRead = true;

    await notification.save();



    res
      .status(200)
      .json(
        apiResponse(
          200,
          "Notification marked as read",
          notification
        )
      );


  } catch (error) {
    next(error);
  }

};





// Mark all notifications as read

const markAllAsRead = async (req, res, next) => {

  try {

    await Notification.updateMany(
      {
        userId: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );


    res
      .status(200)
      .json(
        apiResponse(
          200,
          "All notifications marked as read"
        )
      );


  } catch (error) {
    next(error);
  }

};





// Delete notification

const deleteNotification = async (req, res, next) => {

  try {

    const notification =
      await Notification.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
      });



    if (!notification) {

      throw new ApiError(
        404,
        "Notification not found"
      );

    }



    res
      .status(200)
      .json(
        apiResponse(
          200,
          "Notification deleted successfully"
        )
      );


  } catch (error) {
    next(error);
  }

};





module.exports = {

  getNotifications,

  getUnreadCount,

  markAsRead,

  markAllAsRead,

  deleteNotification,

};