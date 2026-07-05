import { btnGhost, btnPrimary } from "../lib/ui";

export default function Topbar({ isGuestMode, displayName, houseCode, connected, onInvite, onNewEvent }) {
  return (
    <header className="flex items-center justify-between px-7 py-4 border-b border-border bg-surface">
      <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
        <span
          className="w-[26px] h-[26px] rounded-full inline-flex items-center justify-center text-sm"
          style={{
            background: "radial-gradient(circle at 35% 35%, #fde68a 0%, #fbbf24 50%, #f97316 100%)",
            boxShadow: "0 2px 8px rgba(251, 146, 60, .35)",
          }}
        >
          ☀
        </span>{" "}
        Summer Planner
      </div>
      <div className="flex items-center gap-3 text-muted text-[13px] font-medium">
        {!isGuestMode && <span className="text-muted">{connected ? `Signed in as ${displayName}` : "Not connected"}</span>}
        {connected && !isGuestMode && (
          <span className="bg-pastel-lavender-bg text-pastel-lavender-fg px-3 py-1 rounded-full font-semibold text-xs">
            house: {houseCode}
          </span>
        )}
        {isGuestMode && (
          <span className="inline-flex items-center bg-pastel-peach-bg text-pastel-peach-fg px-3 py-1 rounded-full font-bold text-xs">
            👋 Guest view
          </span>
        )}
        {connected && !isGuestMode && (
          <button className={btnGhost} title="Copy invite link" onClick={onInvite}>
            Invite
          </button>
        )}
        {!isGuestMode && (
          <button className={btnPrimary} onClick={onNewEvent}>
            + New event
          </button>
        )}
      </div>
    </header>
  );
}
