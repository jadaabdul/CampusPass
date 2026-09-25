import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell } from "lucide-react";

import { fetchUnreadCount } from "../redux/notificationSlice";

const NotificationBell = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { unreadCount } = useSelector((state) => state.notification);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, user]);

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="
        relative
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-border
        bg-background
        text-text-muted
        transition
        hover:bg-primary/10
        hover:text-primary
      "
    >
      <Bell size={20} />

      {unreadCount > 0 && (
        <span
          className="
              absolute
              -right-1
              -top-1
              flex
              h-[18px]
              w-[18px]
              items-center
              justify-center
              rounded-full
              bg-red-500
              text-[10px]
              font-bold
              text-white
              ring-2
              ring-background
            "
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
