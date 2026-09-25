import { X } from "lucide-react";
import { useEffect } from "react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} transform overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-2xl transition-all duration-300 backdrop-blur-xl md:p-8`}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-xl font-bold text-text">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted transition hover:bg-surface-secondary hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
