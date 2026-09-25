import { Loader2 } from "lucide-react";

const Button = ({
  children,
  type = "button",
  loading = false,
  disabled = false,
  onClick,
  className = "",
  ...rest
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;