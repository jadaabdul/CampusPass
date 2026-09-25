const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "from-primary to-primary/70",
  loading = false,
  subtitle,
}) => {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-surface/80
        p-6
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-xl
        hover:shadow-primary/10
      "
    >
      {/* Background Glow */}
      <div
        className={`
          absolute
          -right-10
          -top-10
          h-32
          w-32
          rounded-full
          bg-gradient-to-br
          ${color}
          opacity-10
          blur-3xl
          transition
          group-hover:opacity-20
        `}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-2">
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-text-muted
            "
          >
            {title}
          </p>

          {loading ? (
            <div
              className="
                h-8
                w-24
                animate-pulse
                rounded-lg
                bg-surface-secondary
              "
            />
          ) : (
            <h3
              className="
                text-3xl
                font-extrabold
                tracking-tight
                text-text
              "
            >
              {value}
            </h3>
          )}

          {subtitle && (
            <p
              className="
                text-xs
                text-text-muted
              "
            >
              {subtitle}
            </p>
          )}

          {trend && (
            <div
              className="
                inline-flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-green-400
              "
            >
              <span>{trend}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              ${color}
              text-white
              shadow-lg
              transition-transform
              duration-300
              group-hover:scale-110
            `}
          >
            <Icon size={26} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
