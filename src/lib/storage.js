// ---------- localStorage helpers ----------
export function getSavedHouseCode() {
  return localStorage.getItem("sp.houseCode") || "";
}
export function saveHouseCode(code) {
  localStorage.setItem("sp.houseCode", code);
}
export function getSavedName() {
  return localStorage.getItem("sp.name") || "";
}
export function saveName(name) {
  localStorage.setItem("sp.name", name);
}

// ---------- Unread-chat tracking (per-device) ----------
export function markSeen(eventId) {
  try {
    localStorage.setItem("sp.lastSeen." + eventId, String(Date.now()));
  } catch {
    /* ignore */
  }
}
function lastSeenMs(eventId) {
  const raw = localStorage.getItem("sp.lastSeen." + eventId);
  return raw ? Number(raw) : 0;
}
export function hasUnread(eventId, data, displayName) {
  if (!data?.lastMessageAt) return false;
  const last = data.lastMessageAt.toMillis ? data.lastMessageAt.toMillis() : 0;
  if (!last) return false;
  // Don't show unread for messages we sent ourselves while offline
  if (data.lastMessageBy === displayName && last - lastSeenMs(eventId) < 60_000) return false;
  return last > lastSeenMs(eventId);
}

// ---------- Personal events (imported .ics, never synced to Firestore) ----------
const PERSONAL_KEY = "sp.personalEvents";
export function loadPersonalEvents() {
  try {
    return JSON.parse(localStorage.getItem(PERSONAL_KEY) || "[]");
  } catch {
    return [];
  }
}
export function savePersonalEvents(events) {
  localStorage.setItem(PERSONAL_KEY, JSON.stringify(events));
}
