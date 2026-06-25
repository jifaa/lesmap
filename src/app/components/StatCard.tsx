interface StatCardProps {
  title: string;
  value: number | string;
  colorClass?: string;
  progressPercentage?: number;
  progressBgClass?: string;
  progressFillClass?: string;
}

export function StatCard({
  title,
  value,
  colorClass = "text-slate-900",
  progressPercentage,
  progressBgClass,
  progressFillClass
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-sm font-medium text-slate-500 mb-2">{title}</div>
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
      {progressPercentage !== undefined && progressBgClass && progressFillClass && (
        <div className={`mt-2 h-1.5 ${progressBgClass} rounded-full overflow-hidden`}>
          <div
            className={`h-full ${progressFillClass} rounded-full`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
