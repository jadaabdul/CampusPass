const PageHeader = ({ title, subtitle, action, breadcrumb }) => {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        border-b
        border-border
        pb-6
        md:flex-row
        md:items-center
        md:justify-between
      "
    >
      <div>
        {breadcrumb && (
          <p
            className="
              mb-2
              text-xs
              font-semibold
              uppercase
              tracking-widest
              text-primary
            "
          >
            {breadcrumb}
          </p>
        )}

        <h1
          className="
            text-3xl
            font-extrabold
            tracking-tight
            text-text
            md:text-4xl
          "
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-relaxed
              text-text-muted
            "
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
