import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export function useWishlist(houseCode, enabled, onError) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!enabled || !db || !houseCode) return;
    const ref = collection(db, "houses", houseCode, "wishlist");
    const q = query(ref, orderBy("addedAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = [];
        snap.forEach((d) => next.push({ id: d.id, ...d.data() }));
        setItems(next);
      },
      (err) => {
        console.error(err);
        onError?.("Couldn't load ideas — update your Firestore rules");
      }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houseCode, enabled]);

  return items;
}
