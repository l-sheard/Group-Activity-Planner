import { useMemo } from "react";
import { hasUnread } from "../lib/storage";

export default function MonthSummary({ eventsMap, displayName }) {
  const { count, total, unread } = useMemo(() => {
    const now = new Date();
    const month = now.getMonth(),
      year = now.getFullYear();
    let count = 0,
      total = 0,
      unread = 0;
    for (const [id, data] of eventsMap) {
      if (!data.start) continue;
      const datePart = data.start.includes("T") ? data.start.split("T")[0] : data.start;
      const d = new Date(datePart + "T00:00");
      if (d.getMonth() === month && d.getFullYear() === year) {
        count++;
        total += Number(data.cost) || 0;
      }
      if (hasUnread(id, data, displayName)) unread++;
    }
    return { count, total, unread };
  }, [eventsMap, displayName]);

  return (
    <div className="bg-surface rounded shadow-card p-4 text-muted text-[13px]">
      {count === 0 ? (
        "No events yet this month."
      ) : (
        <>
          <strong>{count}</strong> event{count === 1 ? "" : "s"} planned · <span className="tabular-nums">£{total.toFixed(2)}</span> total
          per-person budget
        </>
      )}
      {unread > 0 && (
        <div className="mt-1.5">
          <span className="text-[#ef4444] font-bold">●</span> {unread} event{unread === 1 ? "" : "s"} with new chat
        </div>
      )}
    </div>
  );
}
