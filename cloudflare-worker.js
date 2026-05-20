// =============================================================
//  Summer Planner — live calendar feed
//
//  Deploy this file as a Cloudflare Worker. See the README's
//  "Live calendar subscription" section for step-by-step setup.
//
//  Once deployed, the worker URL becomes a live .ics endpoint:
//    https://<your-worker>.workers.dev/feed?house=YOUR-HOUSE-CODE
//
//  Subscribe to that in Apple/Google/Outlook Calendar and house
//  events auto-refresh every hour or so on your phone.
// =============================================================

// Fill these in with the SAME values you used in config.js
const FIREBASE_API_KEY = "AIzaSyCkY_N8U8_WnA_YJcc9RtoUqxmeZuF9dx8";
const FIREBASE_PROJECT = "summer-planner-ddeda";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const houseCode = (url.searchParams.get("house") || "").trim().toLowerCase();
    if (!houseCode) {
      return new Response("Missing ?house=YOUR-HOUSE-CODE", {
        status: 400, headers: { "content-type": "text/plain" }
      });
    }

    try {
      // 1) Anonymous Firebase sign-in to get an ID token
      const signInRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        { method: "POST", headers: { "content-type": "application/json" }, body: '{"returnSecureToken":true}' }
      );
      const signInJson = await signInRes.json();
      const idToken = signInJson?.idToken;
      if (!idToken) {
        return new Response("Firebase auth failed: " + JSON.stringify(signInJson), { status: 500 });
      }

      // 2) Fetch all events for this house
      const fsUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/houses/${encodeURIComponent(houseCode)}/events`;
      const evRes = await fetch(fsUrl, { headers: { Authorization: `Bearer ${idToken}` } });
      if (!evRes.ok) {
        const t = await evRes.text();
        return new Response(`Firestore error ${evRes.status}: ${t}`, { status: 500 });
      }
      const data = await evRes.json();
      const docs = data.documents || [];

      // 3) Convert to ICS and serve
      const ics = buildIcs(docs, houseCode);
      return new Response(ics, {
        headers: {
          "content-type": "text/calendar; charset=utf-8",
          // 15-minute edge cache — calendar apps re-fetch every few hours anyway
          "cache-control": "public, max-age=900",
          "access-control-allow-origin": "*",
        },
      });
    } catch (e) {
      return new Response("Worker error: " + e.message, { status: 500 });
    }
  }
};

// ---------- Helpers ----------
function fieldStr(fields, name) { return fields?.[name]?.stringValue || ""; }

function buildIcs(docs, houseCode) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Summer Planner//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:Summer Planner (${houseCode})`,
    `X-WR-CALDESC:Live shared calendar for the ${houseCode} house`,
  ];
  const stamp = icsNowUtc();
  for (const doc of docs) {
    const id = doc.name.split("/").pop();
    const f = doc.fields || {};
    const start = fieldStr(f, "start");
    if (!start) continue;
    const title    = fieldStr(f, "title") || "Untitled";
    const location = fieldStr(f, "location");
    const notes    = fieldStr(f, "notes");
    const menu     = fieldStr(f, "menu");
    const end      = fieldStr(f, "end");
    const allDay   = !start.includes("T");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${id}@summerplanner-${houseCode}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`SUMMARY:${icsEscape(title)}`);
    if (location) lines.push(`LOCATION:${icsEscape(location)}`);
    const desc = [notes, menu ? "Menu: " + menu : ""].filter(Boolean).join("\n\n");
    if (desc) lines.push(`DESCRIPTION:${icsEscape(desc)}`);
    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${start.replace(/-/g, "")}`);
      const endInclusive = end && !end.includes("T") ? end : start;
      const endExclusive = addDaysISO(endInclusive, 1);
      lines.push(`DTEND;VALUE=DATE:${endExclusive.replace(/-/g, "")}`);
    } else {
      lines.push(`DTSTART:${icsLocalDateTime(start)}`);
      if (end) lines.push(`DTEND:${icsLocalDateTime(end)}`);
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function pad2(n) { return String(n).padStart(2, "0"); }
function icsEscape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
function icsLocalDateTime(iso) {
  const [d, t] = iso.split("T");
  return `${d.replace(/-/g, "")}T${(t || "00:00").replace(":", "")}00`;
}
function icsNowUtc() {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth()+1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}
function addDaysISO(iso, days) {
  const hasTime = iso.includes("T");
  const datePart = hasTime ? iso.split("T")[0] : iso;
  const d = new Date(datePart + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  const out = `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`;
  return hasTime ? `${out}T${iso.split("T")[1]}` : out;
}
