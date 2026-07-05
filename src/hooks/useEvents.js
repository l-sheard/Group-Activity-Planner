import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Subscribes to every event doc in the house and keeps a Map<id, data> in sync.
export function useEvents(houseCode, enabled, onError) {
  const [eventsMap, setEventsMap] = useState(new Map());

  useEffect(() => {
    if (!enabled || !db || !houseCode) return;
    const ref = collection(db, "houses", houseCode, "events");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const next = new Map();
        snap.forEach((d) => next.set(d.id, d.data()));
        setEventsMap(next);
      },
      (err) => {
        console.error(err);
        onError?.("Couldn't load events — check Firestore rules");
      }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houseCode, enabled]);

  return eventsMap;
}
