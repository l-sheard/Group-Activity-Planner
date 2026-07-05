import { useState } from "react";
import Modal from "./Modal";
import { btnPrimary, fieldClass, inputClass, labelClass } from "../lib/ui";

export default function SetupModal({ open, isGuestMode, initialName, initialCode, onSubmit }) {
  const [name, setName] = useState(initialName || "");
  const [code, setCode] = useState(initialCode || "");

  const handleGo = () => {
    const trimmedName = name.trim();
    const normalizedCode = isGuestMode ? initialCode : code.trim().toLowerCase().replace(/\s+/g, "-");
    onSubmit(trimmedName, normalizedCode);
  };

  return (
    <Modal open={open} onClose={() => {}}>
      <div className="[&>*+*]:mt-2.5">
        <h1 className="m-0 mb-1.5 text-[22px] font-bold tracking-tight">
          {isGuestMode ? "You've been invited!" : "Join your house"}
        </h1>
        <p className="text-muted m-0 mb-4">
          {isGuestMode
            ? "Pop in your name so people know who's RSVPing."
            : "Pick a name and a shared house code. Everyone using the same code sees the same calendar."}
        </p>
        <div className={fieldClass}>
          <label className={labelClass}>Your name</label>
          <input className={inputClass} placeholder="e.g. Lara" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        {!isGuestMode && (
          <div className={fieldClass}>
            <label className={labelClass}>House code</label>
            <input className={inputClass} placeholder="e.g. flat-42" value={code} onChange={(e) => setCode(e.target.value)} />
            <div className="text-muted text-xs mt-1">Share this code (or the Invite link) with your flatmates.</div>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <button className={btnPrimary + " flex-1"} onClick={handleGo}>
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}
