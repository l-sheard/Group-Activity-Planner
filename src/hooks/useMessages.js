import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { markSeen } from "../lib/storage";

// Subscribes to a single event's chat subcollection (oldest first), for whichever
// event is currently shown in the side panel. Re-subscribes whenever eventId changes,
// and marks new messages as seen since the user is actively looking at this chat.
export function useMessages(houseCode, eventId, onError) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([]);
    if (!db || !houseCode || !eventId) return;
    const ref = collection(db, "houses", houseCode, "events", eventId, "messages");
    const q = query(ref, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = [];
        snap.forEach((d) => next.push({ id: d.id, ...d.data() }));
        setMessages(next);
        markSeen(eventId);
      },
      (err) => {
        console.error(err);
        onError?.("Couldn't load chat — update your Firestore rules");
      }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houseCode, eventId]);

  return messages;
}
