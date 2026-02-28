import { cn } from "@/lib/utils";
import { type LeadStatus } from "@shared/schema";

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-mongodb-light-slate text-mongodb-slate-text border-mongodb-border-slate shadow-sm",
  contacted: "bg-mongodb-info/10 text-mongodb-info border-mongodb-info/20",
  qualified: "bg-mongodb-warning/10 text-mongodb-warning border-mongodb-warning/20",
  converted: "bg-mongodb-green/10 text-mongodb-green-dark border-mongodb-green/20",
  closed_lost: "bg-mongodb-error/10 text-mongodb-error border-mongodb-error/20",
};

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Won",
  closed_lost: "Lost",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const safeStatus = (status in statusStyles ? status : "new") as LeadStatus;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        statusStyles[safeStatus],
        className
      )}
    >
      {statusLabels[safeStatus]}
    </span>
  );
}
