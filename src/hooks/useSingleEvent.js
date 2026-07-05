import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Guest mode: subscribes to exactly one event doc instead of the whole collection.
export function useSingleEvent(houseCode, eventId, enabled, onError) {
  const [data, setData] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    if (!enabled || !db || !houseCode || !eventId) return;
    const ref = doc(db, "houses", houseCode, "events", eventId);
    const unsub = onSnapshot(
      ref,
      (snap) => setData(snap.exists() ? snap.data() : null),
      (err) => {
        console.error(err);
        onError?.("Couldn't load event");
      }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houseCode, eventId, enabled]);

  return data;
}
