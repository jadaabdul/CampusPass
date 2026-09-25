const InfoCard = ({ icon: Icon, title, value, iconColor = "text-primary" }) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-surface/70
        p-5
        backdrop-blur-xl
        transition
        hover:bg-surface
      "
    >
      <div className="flex items-center gap-4">
        {/* Icon Box */}
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-primary/10
          "
        >
          <Icon size={22} className={iconColor} />
        </div>

        {/* Content */}
        <div className="min-w-0">
          <p
            className="
              text-sm
              text-text-muted
            "
          >
            {title}
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-text
              break-all
            "
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
