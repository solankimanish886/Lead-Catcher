import { cn } from "@/lib/utils";
import { type LeadStatus } from "@shared/schema";

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  qualified: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  converted: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  closed_lost: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
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
