import { getStatusStyle } from "../utils/formatters";

const StatusBadge = ({ status, className = "" }) => {
  if (!status) return null;
  const styleClasses = getStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide capitalize backdrop-blur-md transition-all ${styleClasses} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {status}
    </span>
  );
};

export default StatusBadge;
