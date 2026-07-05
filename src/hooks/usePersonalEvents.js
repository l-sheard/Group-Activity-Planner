import { useCallback, useState } from "react";
import { loadPersonalEvents, savePersonalEvents } from "../lib/storage";
import { parseIcs } from "../lib/ics";

// Personal events live ONLY in this browser's localStorage. They never go to Firestore.
export function usePersonalEvents() {
  const [personalEvents, setPersonalEvents] = useState(() => loadPersonalEvents());

  const importIcsFile = useCallback(async (file) => {
    const text = await file.text();
    const parsed = parseIcs(text)
      .filter((e) => e.start && e.title)
      // Trim to a sensible window so localStorage stays small
      .filter((e) => {
        const datePart = e.start.includes("T") ? e.start.split("T")[0] : e.start;
        const d = new Date(datePart + "T00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.round((d - today) / 86_400_000);
        return diffDays >= -30 && diffDays <= 180;
      });
    setPersonalEvents(parsed);
    savePersonalEvents(parsed);
    return parsed.length;
  }, []);

  const clearPersonalEvents = useCallback(() => {
    setPersonalEvents([]);
    savePersonalEvents([]);
  }, []);

  return { personalEvents, importIcsFile, clearPersonalEvents };
}
