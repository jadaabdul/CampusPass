import { useEffect, useState } from "react";
import {
  Bell,
  Trash2,
  Calendar,
  CreditCard,
  Ticket,
  ShieldCheck,
  CheckCheck,
  PartyPopper,
  AlertCircle,
  Clock,
} from "lucide-react";

import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

import { decrementUnreadCount, resetUnreadCount } from "../../redux/notificationSlice";

import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { useSocket } from "../../context/SocketContext";
import Pagination from "../../components/Pagination";

const Notifications = () => {
  const dispatch = useDispatch();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const socket = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications?page=${pageNum}&limit=10`);
      const newNotifications = response.data.data.notifications || [];
      const pagination = response.data.data.pagination;

      setNotifications(newNotifications);
      setTotalPages(pagination.totalPages || 1);
    } catch {
      toast.error("Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      await fetchNotifications(page);
    };
    loadPage();
  }, [page]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      if (page === 1) {
        setNotifications((prev) => {
          return [notification, ...prev];
        });
      }
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, page]);

  const markAsRead = async (notification) => {
    if (notification.isRead) return;

    try {
      await api.patch(`/notifications/${notification._id}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      dispatch(decrementUnreadCount());
    } catch {
      toast.error("Failed to mark notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      dispatch(resetUnreadCount());

      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const deleteNotification = async (id) => {
    const confirmDelete = window.confirm("Delete this notification?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((prev) => prev.filter((item) => item._id !== id));

      toast.success("Notification deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification);

    if (notification.data?.eventId) {
      navigate(`/event/${notification.data.eventId}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "event":
        return PartyPopper;
      case "booking":
        return Calendar;
      case "payment":
        return CreditCard;
      case "ticket":
        return Ticket;
      case "admin":
        return ShieldCheck;
      case "warning":
        return AlertCircle;
      default:
        return Bell;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        breadcrumb="COMMUNICATION CENTER"
        title="Notifications"
        subtitle="Track bookings, payments, event updates and announcements."
        action={
          notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text transition-all hover:border-primary/40 hover:bg-surface-secondary active:scale-95"
            >
              <CheckCheck size={16} className="text-primary" />
              <span>Mark All Read</span>
            </button>
          )
        }
      />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl border border-border bg-surface-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description="You are all caught up. New activity will appear here."
          icon={Bell}
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const isUnread = !notification.isRead;

            return (
              <div
                key={notification._id}
                className={`group relative flex gap-4 rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 ${
                  isUnread
                    ? "border-primary/40 bg-primary/5 dark:bg-primary/10 shadow-md shadow-primary/5"
                    : "border-border bg-surface/80 opacity-85 hover:opacity-100 hover:border-primary/30"
                }`}
              >
                {/* Unread Indicator Bar */}
                {isUnread && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-full bg-primary" />
                )}

                {/* Icon Container */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                    isUnread
                      ? "border-primary/30 bg-primary/15 text-primary"
                      : "border-border bg-surface-secondary text-text-muted group-hover:border-primary/30 group-hover:text-primary"
                  }`}
                >
                  <Icon size={22} />
                </div>

                {/* Main Content */}
                <div
                  onClick={() => handleNotificationClick(notification)}
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm ${
                        isUnread ? "font-extrabold text-text" : "font-bold text-text"
                      }`}
                    >
                      {notification.title}
                    </h3>

                    {isUnread ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-black uppercase text-black shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                        NEW
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted">
                        <CheckCheck size={13} className="text-primary" />
                        Read
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      isUnread ? "font-medium text-text" : "text-text-muted"
                    }`}
                  >
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-text-muted">
                    <Clock size={12} className="text-text-muted/70" />
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Delete Action */}
                <button
                  onClick={() => deleteNotification(notification._id)}
                  className="h-fit rounded-xl p-2 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                  title="Delete Notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="pt-4 pb-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
