import { useRef } from "react";
import { downloadIcs } from "../lib/ics";
import { WORKER_URL } from "../firebase";
import { btnBase } from "../lib/ui";
import { useToast } from "../context/ToastContext";

export default function SyncCard({ houseCode, eventsMap, personalEvents, importIcsFile, clearPersonalEvents }) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    if (!eventsMap.size) {
      toast("No events to export yet");
      return;
    }
    downloadIcs(eventsMap, houseCode);
    toast("Downloaded — import it into Apple/Google/Outlook Calendar");
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const count = await importIcsFile(file);
      toast(`Imported ${count} personal event${count === 1 ? "" : "s"}`);
    } catch (err) {
      console.error(err);
      toast("Couldn't parse that .ics file");
    }
  };

  const handleClearPersonal = () => {
    if (confirm("Remove your imported personal events from this device?")) {
      clearPersonalEvents();
      toast("Personal events cleared");
    }
  };

  const handleSubscribe = async () => {
    const base = (WORKER_URL || "").trim().replace(/\/$/, "");
    if (!base) {
      toast("Worker URL not set — see README");
      return;
    }
    const httpUrl = `${base}/feed?house=${encodeURIComponent(houseCode)}`;
    const webcalUrl = httpUrl.replace(/^https?:/, "webcal:");
    try {
      await navigator.clipboard.writeText(webcalUrl);
      toast("Subscribe link copied — paste into your calendar app");
    } catch {
      prompt("Copy this subscribe link and paste into your calendar app:", webcalUrl);
    }
  };

  return (
    <div className="bg-surface rounded shadow-card p-4">
      <div className="text-muted text-xs mb-2.5">
        Sync the group calendar to your phone, or import your personal calendar so private events show up on top (just for you).
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={btnBase + " text-[13px] px-3.5 py-1.5"} onClick={handleExport}>
          📤 Export group
        </button>
        {WORKER_URL && (
          <button className={btnBase + " text-[13px] px-3.5 py-1.5"} onClick={handleSubscribe}>
            📡 Live subscribe
          </button>
        )}
        <label className={btnBase + " text-[13px] px-3.5 py-1.5 inline-flex items-center gap-1.5 cursor-pointer"}>
          📥 Import mine
          <input ref={fileInputRef} type="file" accept=".ics,text/calendar" className="hidden" onChange={handleImportFile} />
        </label>
      </div>
      {personalEvents.length > 0 && (
        <div className="text-muted text-xs mt-2">
          🔒 {personalEvents.length} personal event{personalEvents.length === 1 ? "" : "s"} loaded (only visible to you) ·{" "}
          <a href="#" className="text-pastel-pink-fg" onClick={(e) => { e.preventDefault(); handleClearPersonal(); }}>
            Clear
          </a>
        </div>
      )}
    </div>
  );
}
