import { FolderOpen } from "lucide-react";

const EmptyState = ({
  title = "No data found",
  description = "There are no records matching your request right now.",
  icon: Icon = FolderOpen,
  action,
}) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/40 p-8 text-center backdrop-blur-xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
        <Icon size={32} />
      </div>

      <h3 className="mt-4 text-xl font-bold text-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
