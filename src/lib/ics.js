import { pad2, isAllDayStart, addDaysISO } from "./dateUtils";

export function icsEscape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function icsUnescape(s) {
  return String(s).replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

export function icsLocalDateTime(iso) {
  // "YYYY-MM-DDTHH:MM" → "YYYYMMDDTHHMMSS" (floating local time)
  const [d, t] = iso.split("T");
  return `${d.replace(/-/g, "")}T${(t || "00:00").replace(":", "")}00`;
}

export function icsNowUtc() {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

export function buildIcs(eventsMap, houseCodeStr) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Summer Planner//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:Summer Planner (${houseCodeStr})`,
  ];
  const stamp = icsNowUtc();
  for (const [id, data] of eventsMap) {
    if (!data.start) continue;
    const allDay = isAllDayStart(data.start);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${id}@summerplanner-${houseCodeStr}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`SUMMARY:${icsEscape(data.title || "Untitled")}`);
    if (data.location) lines.push(`LOCATION:${icsEscape(data.location)}`);
    const desc = [data.notes, data.menu ? "Menu: " + data.menu : ""].filter(Boolean).join("\n\n");
    if (desc) lines.push(`DESCRIPTION:${icsEscape(desc)}`);

    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${data.start.replace(/-/g, "")}`);
      const endInclusive = data.end && isAllDayStart(data.end) ? data.end : data.start;
      const endExclusive = addDaysISO(endInclusive, 1);
      lines.push(`DTEND;VALUE=DATE:${endExclusive.replace(/-/g, "")}`);
    } else {
      lines.push(`DTSTART:${icsLocalDateTime(data.start)}`);
      if (data.end) lines.push(`DTEND:${icsLocalDateTime(data.end)}`);
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(eventsMap, houseCode) {
  const ics = buildIcs(eventsMap, houseCode);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `summer-planner-${houseCode}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---- Import: parse a .ics file's VEVENTs ----
export function parseIcs(text) {
  // RFC 5545 line unfolding (lines continued by leading space/tab)
  text = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const lines = text.split(/\r?\n/);
  const events = [];
  let cur = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT") {
      if (cur) events.push(cur);
      cur = null;
    } else if (cur) {
      const i = line.indexOf(":");
      if (i < 0) continue;
      const k = line.slice(0, i),
        v = line.slice(i + 1);
      const baseKey = k.split(";")[0];
      const isDateOnly = /VALUE=DATE(?!-TIME)/i.test(k);
      if (baseKey === "SUMMARY") cur.title = icsUnescape(v);
      else if (baseKey === "LOCATION") cur.location = icsUnescape(v);
      else if (baseKey === "DESCRIPTION") cur.notes = icsUnescape(v);
      else if (baseKey === "DTSTART") cur.start = parseIcsDate(v, isDateOnly);
      else if (baseKey === "DTEND") cur.end = parseIcsDate(v, isDateOnly);
      else if (baseKey === "UID") cur.uid = v;
    }
  }
  return events;
}

function parseIcsDate(val, isDateOnly) {
  if (isDateOnly || /^\d{8}$/.test(val)) {
    return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`;
  }
  // YYYYMMDDTHHMMSS[Z]
  const utc = val.endsWith("Z");
  const clean = val.replace("Z", "");
  if (!/^\d{8}T\d{4,6}$/.test(clean)) return null;
  const yyyy = clean.slice(0, 4),
    MM = clean.slice(4, 6),
    dd = clean.slice(6, 8);
  const HH = clean.slice(9, 11),
    mm = clean.slice(11, 13);
  if (utc) {
    const d = new Date(`${yyyy}-${MM}-${dd}T${HH}:${mm}:00Z`);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
}
