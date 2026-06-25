import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { CoursePlace } from "@/types/database";

interface StatusBadgeProps {
  status: CoursePlace["status"] | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" },
    approved: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2, label: "Approved" },
    rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Rejected" },
  }[status] || { bg: "bg-gray-100", text: "text-gray-700", icon: AlertCircle, label: status };

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-full`}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
}
