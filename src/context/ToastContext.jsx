import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const toast = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] rounded-md bg-accent px-4 py-2.5 text-sm text-white shadow-card transition-opacity duration-200 pointer-events-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
