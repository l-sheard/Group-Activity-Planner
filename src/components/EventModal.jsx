import { useEffect, useState } from "react";
import Modal from "./Modal";
import { splitDateTime, todayISO } from "../lib/dateUtils";
import { btnDanger, btnGhost, btnPrimary, fieldClass, inputClass, labelClass } from "../lib/ui";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  title: "",
  date: "",
  endDate: "",
  startTime: "",
  endTime: "",
  category: "social",
  cost: "",
  location: "",
  invitees: "",
  notes: "",
  isDinner: false,
  menu: "",
};

export default function EventModal({ open, editingId, data, presetDate, presetTitle, onSave, onCancel, onDelete }) {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;
    const startParts = splitDateTime(data?.start);
    const endParts = splitDateTime(data?.end);
    setForm({
      title: data?.title || presetTitle || "",
      date: startParts.date || presetDate || todayISO(),
      endDate: endParts.date && endParts.date !== startParts.date ? endParts.date : "",
      startTime: startParts.time || "",
      endTime: endParts.time || "",
      category: data?.category || "social",
      cost: data?.cost ?? "",
      location: data?.location || "",
      invitees: (data?.invitees || []).join(", "),
      notes: data?.notes || "",
      isDinner: !!data?.isDinner,
      menu: data?.menu || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingId]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSave = () => {
    const { date, endDate: endDateRaw, startTime, endTime } = form;
    const endDate = endDateRaw || date;
    const startStr = startTime ? `${date}T${startTime}` : date;

    let endStr = null;
    const multiDay = endDate && endDate !== date;
    if (startTime) {
      if (multiDay || endTime) endStr = `${endDate}T${endTime || startTime}`;
    } else if (multiDay) {
      endStr = endDate;
    }

    if (endStr) {
      const startCmp = startTime ? new Date(startStr) : new Date(date + "T00:00");
      const endCmp = startTime ? new Date(endStr) : new Date(endDate + "T00:00");
      if (endCmp < startCmp) {
        toast("End is before start");
        return;
      }
    }

    if (!form.title.trim()) {
      toast("Give it a title");
      return;
    }
    if (!date) {
      toast("Pick a date");
      return;
    }

    onSave({
      title: form.title.trim(),
      start: startStr,
      end: endStr,
      category: form.category,
      cost: parseFloat(form.cost) || 0,
      location: form.location.trim(),
      invitees: form.invitees.split(",").map((s) => s.trim()).filter(Boolean),
      notes: form.notes.trim(),
      isDinner: form.isDinner,
      menu: form.isDinner ? form.menu.trim() : "",
    });
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <div className="[&>*+*]:mt-2.5">
        <h1 className="m-0 mb-1.5 text-[22px] font-bold tracking-tight">{editingId ? "Edit event" : "New event"}</h1>

        <div className={fieldClass}>
          <label className={labelClass}>Title</label>
          <input className={inputClass} placeholder="Beach day, pub quiz, etc." value={form.title} onChange={set("title")} autoFocus />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={fieldClass}>
            <label className={labelClass}>Start date</label>
            <input type="date" className={inputClass} value={form.date} onChange={set("date")} />
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>
              End date <span className="normal-case tracking-normal font-normal text-muted">(blank = single day)</span>
            </label>
            <input type="date" className={inputClass} value={form.endDate} onChange={set("endDate")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={fieldClass}>
            <label className={labelClass}>
              Start time <span className="normal-case tracking-normal font-normal text-muted">(blank = all-day)</span>
            </label>
            <input type="time" className={inputClass} value={form.startTime} onChange={set("startTime")} />
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>
              End time <span className="normal-case tracking-normal font-normal text-muted">(optional)</span>
            </label>
            <input type="time" className={inputClass} value={form.endTime} onChange={set("endTime")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={fieldClass}>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={form.category} onChange={set("category")}>
              <option value="social">Social</option>
              <option value="trip">Day trip</option>
              <option value="food">Food / cooking</option>
              <option value="night">Night out</option>
              <option value="chill">Chill</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Cost per person (£)</label>
            <input type="number" min="0" step="0.5" placeholder="0" className={inputClass} value={form.cost} onChange={set("cost")} />
          </div>
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Location</label>
          <input className={inputClass} placeholder="Optional" value={form.location} onChange={set("location")} />
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Who's coming (comma-separated)</label>
          <input className={inputClass} placeholder="Lara, Sam, Priya..." value={form.invitees} onChange={set("invitees")} />
        </div>

        <div className={fieldClass + " mt-1"}>
          <label className="flex items-center gap-2 cursor-pointer normal-case tracking-normal text-sm text-text font-normal">
            <input type="checkbox" className="w-auto m-0" checked={form.isDinner} onChange={set("isDinner")} />
            🍝 This is a house dinner (track menu + headcount)
          </label>
        </div>

        {form.isDinner && (
          <div className={fieldClass}>
            <label className={labelClass}>Menu</label>
            <textarea
              className={inputClass + " min-h-[70px] resize-y"}
              placeholder="What's being cooked? Any sides, drinks, dietary notes…"
              value={form.menu}
              onChange={set("menu")}
            />
          </div>
        )}

        <div className={fieldClass}>
          <label className={labelClass}>Notes</label>
          <textarea
            className={inputClass + " min-h-[70px] resize-y"}
            placeholder="Anything else to remember"
            value={form.notes}
            onChange={set("notes")}
          />
        </div>

        <div className="flex gap-2 mt-4 sticky bottom-0 -mx-7 px-7 py-3.5 bg-surface border-t border-border">
          <button className={btnGhost} onClick={onCancel}>
            Cancel
          </button>
          {editingId && (
            <button className={btnDanger} onClick={() => onDelete(editingId)}>
              Delete
            </button>
          )}
          <button className={btnPrimary + " ml-auto"} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
