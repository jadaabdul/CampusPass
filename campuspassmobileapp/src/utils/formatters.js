// Date and currency formatting utilities

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "TBD";

  const defaultOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
};

export const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  if (num === 0) return "Free";
  return `₹${num.toLocaleString("en-IN")}`;
};

export const getInitials = (name) => {
  if (!name) return "CP";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Converted to return React Native style objects instead of Tailwind strings
export const getStatusStyle = (status) => {
  const normalized = (status || "").toLowerCase().trim();
  
  const baseStyle = { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 };

  switch (normalized) {
    case "published":
    case "active":
    case "confirmed":
    case "approved":
    case "paid":
      return { 
        container: { ...baseStyle, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
        text: { color: '#34d399' }
      };
    case "draft":
    case "pending":
      return { 
        container: { ...baseStyle, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' },
        text: { color: '#fbbf24' }
      };
    case "cancelled":
    case "rejected":
    case "blocked":
    case "failed":
      return { 
        container: { ...baseStyle, backgroundColor: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.2)' },
        text: { color: '#fb7185' }
      };
    case "completed":
      return { 
        container: { ...baseStyle, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' },
        text: { color: '#60a5fa' }
      };
    case "sold_out":
    case "expired":
      return { 
        container: { ...baseStyle, backgroundColor: 'rgba(249, 115, 22, 0.1)', borderColor: 'rgba(249, 115, 22, 0.2)' },
        text: { color: '#fb923c' }
      };
    default:
      return { 
        container: { ...baseStyle, backgroundColor: 'rgba(107, 114, 128, 0.1)', borderColor: 'rgba(107, 114, 128, 0.2)' },
        text: { color: '#9ca3af' }
      };
  }
};
