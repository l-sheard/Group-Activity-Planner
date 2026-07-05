import { useEffect, useRef, useState } from "react";
import { useMessages } from "../hooks/useMessages";
import { sendChatMessage } from "../lib/firestoreActions";
import { btnPrimary, inputClass } from "../lib/ui";
import { useToast } from "../context/ToastContext";

function escapeText(s) {
  return String(s ?? "");
}

export default function ChatSection({ houseCode, eventId, displayName }) {
  const toast = useToast();
  const messages = useMessages(houseCode, eventId, (msg) => toast(msg));
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    try {
      await sendChatMessage(houseCode, eventId, trimmed, displayName);
    } catch (err) {
      console.error(err);
      toast("Couldn't send — check Firestore rules");
    }
  };

  return (
    <>
      <div className="text-xs font-bold text-muted uppercase tracking-wider mt-2">💬 Chat</div>
      <div ref={listRef} className="bg-bg-tint rounded-xl p-2.5 max-h-[260px] overflow-y-auto flex flex-col gap-1.5">
        {messages.length === 0 ? (
          <div className="text-muted text-xs p-1.5 text-center">Be the first to say something 👋</div>
        ) : (
          messages.map((m) => {
            const mine = m.author === displayName;
            const when = m.createdAt?.toDate
              ? m.createdAt.toDate().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
              : "";
            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] px-2.5 py-1.5 rounded-xl text-[13px] leading-snug break-words ${
                  mine
                    ? "self-end bg-pastel-lavender-bg text-pastel-lavender-fg rounded-br-sm"
                    : "self-start bg-surface text-text border border-border rounded-bl-sm"
                }`}
              >
                <span className="text-[10px] opacity-70 mb-0.5 font-semibold">
                  {escapeText(m.author || "anon")}
                  {when ? " · " + when : ""}
                </span>
                <span>{escapeText(m.text || "")}</span>
              </div>
            );
          })
        )}
      </div>
      <div className="flex gap-1.5 mt-2">
        <input
          className={inputClass + " rounded-full py-2.5 px-3.5"}
          placeholder="Message your flatmates…"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const text = draft;
              setDraft("");
              send(text);
            }
          }}
        />
        <button
          className={btnPrimary}
          onClick={() => {
            const text = draft;
            setDraft("");
            send(text);
          }}
        >
          Send
        </button>
      </div>
    </>
  );
}
