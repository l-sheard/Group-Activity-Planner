export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// A start string is "all day" if it's just YYYY-MM-DD (no "T")
export function isAllDayStart(s) {
  return typeof s === "string" && !s.includes("T");
}

// Split a stored start/end into {date, time} for the modal inputs
export function splitDateTime(s) {
  if (!s) return { date: "", time: "" };
  if (s.includes("T")) {
    const [d, t] = s.split("T");
    return { date: d, time: (t || "").slice(0, 5) }; // HH:MM
  }
  return { date: s, time: "" };
}

// Format a JS Date for Firestore as either "YYYY-MM-DD" (all-day) or "YYYY-MM-DDTHH:MM"
export function serializeDateTime(d, allDay) {
  if (!d) return null;
  const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  if (allDay) return date;
  return `${date}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// Shift a date-only (or date-time) string by N days
export function addDaysISO(iso, days) {
  if (!iso) return iso;
  const hasTime = iso.includes("T");
  const datePart = hasTime ? iso.split("T")[0] : iso;
  const d = new Date(datePart + "T00:00");
  d.setDate(d.getDate() + days);
  const out = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  return hasTime ? `${out}T${iso.split("T")[1]}` : out;
}

// Human-readable date/time for the side panel (UK format: day before month, 24h time)
const UK_DATE = { weekday: "long", day: "numeric", month: "long" };
const UK_DATE_SHORT = { weekday: "short", day: "numeric", month: "short" };
const UK_TIME = { hour: "2-digit", minute: "2-digit", hour12: false };

export function formatWhen(start, end) {
  if (!start) return "";
  const startAllDay = isAllDayStart(start);
  const startDate = new Date(startAllDay ? start + "T00:00" : start);
  const startDateStr = start.split("T")[0];

  if (startAllDay) {
    const dateLabel = startDate.toLocaleDateString("en-GB", UK_DATE);
    if (!end || end === startDateStr) return `${dateLabel} · all day`;
    const endDateObj = new Date(end + "T00:00");
    const days = Math.round((endDateObj - startDate) / 86_400_000) + 1;
    return `${startDate.toLocaleDateString("en-GB", UK_DATE_SHORT)} – ${endDateObj.toLocaleDateString("en-GB", UK_DATE_SHORT)} · ${days} days`;
  }

  const startT = startDate.toLocaleTimeString("en-GB", UK_TIME);
  if (!end) {
    return `${startDate.toLocaleDateString("en-GB", UK_DATE)} · ${startT}`;
  }
  const endDate = new Date(end);
  const endT = endDate.toLocaleTimeString("en-GB", UK_TIME);
  const endDateStr = end.split("T")[0];
  if (endDateStr === startDateStr) {
    return `${startDate.toLocaleDateString("en-GB", UK_DATE)} · ${startT} – ${endT}`;
  }
  return `${startDate.toLocaleDateString("en-GB", UK_DATE_SHORT)} ${startT} – ${endDate.toLocaleDateString("en-GB", UK_DATE_SHORT)} ${endT}`;
}
