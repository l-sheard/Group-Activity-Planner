import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../firebase";

// Signs in anonymously and reports back the authenticated user (or null until ready).
export function useAuth(enabled, onError) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!enabled || !auth) return;
    signInAnonymously(auth).catch((err) => {
      console.error(err);
      onError?.("Auth failed — enable Anonymous sign-in in Firebase");
    });
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return user;
}
