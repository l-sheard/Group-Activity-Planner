import { useState } from "react";
import { addWishItem, deleteWishItem } from "../lib/firestoreActions";
import { inputClass, btnPrimary, btnDanger } from "../lib/ui";
import { useToast } from "../context/ToastContext";

export default function Wishlist({ houseCode, displayName, items, onSchedule }) {
  const toast = useToast();
  const [draft, setDraft] = useState("");

  const add = async (title) => {
    const trimmed = (title || "").trim();
    if (!trimmed) return;
    try {
      await addWishItem(houseCode, trimmed, displayName);
    } catch (e) {
      console.error(e);
      toast("Couldn't add idea");
    }
  };

  const remove = async (id) => {
    try {
      await deleteWishItem(houseCode, id);
    } catch (e) {
      console.error(e);
      toast("Couldn't remove");
    }
  };

  return (
    <div className="bg-surface rounded shadow-card p-4">
      <div className="flex gap-1.5 mb-2">
        <input
          className={inputClass + " flex-1 rounded-full py-2.5 px-3.5"}
          placeholder="Add a summer idea…"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const text = draft;
              setDraft("");
              add(text);
            }
          }}
        />
        <button
          className={btnPrimary + " p-0 w-9 h-9 text-lg font-bold leading-none"}
          title="Add idea"
          onClick={() => {
            const text = draft;
            setDraft("");
            add(text);
          }}
        >
          +
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-muted text-[13px] py-1.5 text-center">No ideas yet — what should you do this summer? 🌞</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-2.5 py-2 rounded-[10px] mb-1 bg-bg-tint text-[13px]">
            <div className="flex-1 font-medium break-words">
              {item.title}
              {item.addedBy && <span className="text-muted text-[11px]"> · {item.addedBy}</span>}
            </div>
            <button className={btnPrimary + " px-2.5 py-1 text-xs"} title="Add to calendar" onClick={() => onSchedule(item)}>
              📅
            </button>
            <button className={btnDanger + " px-2.5 py-1 text-xs"} title="Remove" onClick={() => remove(item.id)}>
              ×
            </button>
          </div>
        ))
      )}
    </div>
  );
}
