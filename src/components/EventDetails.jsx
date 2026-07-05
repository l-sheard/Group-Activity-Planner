import { categoryOf } from "../lib/categories";
import { formatWhen } from "../lib/dateUtils";
import WeatherPill from "./WeatherPill";
import ChatSection from "./ChatSection";
import { btnDanger, btnGhost } from "../lib/ui";

const RSVP_STYLES = {
  yes: "bg-pastel-mint-bg text-pastel-mint-fg border-pastel-mint-fg",
  maybe: "bg-pastel-peach-bg text-pastel-peach-fg border-pastel-peach-fg",
  no: "bg-pastel-pink-bg text-pastel-pink-fg border-pastel-pink-fg",
};

function dinnerLabelForName(name, plusOnes) {
  const g = Number(plusOnes[name]) || 0;
  return g > 0 ? `${name} (+${g})` : name;
}

export default function EventDetails({ id, data, houseCode, displayName, isGuestMode, onRsvp, onGuestStep, onEdit, onDelete, onShareGuest }) {
  const cat = categoryOf(data.category);
  const invitees = (data.invitees || []).filter(Boolean);
  const rsvps = data.rsvps || {};
  const plusOnes = data.plusOnes || {};
  const myRsvp = rsvps[displayName] || null;
  const myGuests = Number(plusOnes[displayName]) || 0;

  const bucket = { yes: [], maybe: [], no: [] };
  for (const [name, resp] of Object.entries(rsvps)) {
    if (bucket[resp]) bucket[resp].push(name);
  }
  const responded = new Set(Object.keys(rsvps));
  const noReply = invitees.filter((n) => !responded.has(n));

  const isDinner = !!data.isDinner;
  const yesPeople = bucket.yes.length;
  const totalGuests = bucket.yes.reduce((sum, name) => sum + (Number(plusOnes[name]) || 0), 0);
  const totalHeads = yesPeople + totalGuests;

  const fmtName = (n) => (isDinner ? dinnerLabelForName(n, plusOnes) : n);
  const dateOnly = data.start ? (data.start.includes("T") ? data.start.split("T")[0] : data.start) : null;
  const weatherLocation = data.location || "Bath, UK";

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${cat.bgClass} ${cat.fgClass}`}>
          {cat.label}
        </span>
      </div>
      <div className="text-lg font-bold tracking-tight">{data.title || "Untitled"}</div>
      <div className="text-muted font-medium">{formatWhen(data.start, data.end)}</div>
      <div>
        📍 {data.location || <span className="text-muted">Bath, UK</span>}
        {dateOnly && <WeatherPill location={weatherLocation} dateISO={dateOnly} />}
      </div>
      {!!data.cost && (
        <div>
          💷 <span className="tabular-nums">£{Number(data.cost).toFixed(2)}</span> per person
        </div>
      )}
      {data.notes && <div className="whitespace-pre-wrap p-3 bg-bg-tint rounded-[10px] text-[13px]">{data.notes}</div>}

      {isDinner && data.menu && (
        <div className="bg-[#fff7d6] border border-[#facc15] rounded-xl px-3.5 py-2.5 text-[13px] whitespace-pre-wrap">
          <div className="font-bold mb-1 text-[#854d0e]">🍝 Menu</div>
          {data.menu}
        </div>
      )}
      {isDinner && totalHeads > 0 && (
        <div className="bg-pastel-mint-bg text-pastel-mint-fg rounded-xl px-3.5 py-2.5 text-[13px] font-semibold">
          👩‍🍳 Cooking for <strong>{totalHeads}</strong> · {yesPeople} flatmate{yesPeople === 1 ? "" : "s"}
          {totalGuests > 0 ? ` + ${totalGuests} guest${totalGuests === 1 ? "" : "s"}` : ""}
        </div>
      )}

      <div className="text-xs font-bold text-muted uppercase tracking-wider mt-2">Are you coming, {displayName}?</div>
      <div className="flex gap-1.5 mt-1.5">
        {["yes", "maybe", "no"].map((choice) => (
          <button
            key={choice}
            className={`flex-1 font-sans text-[13px] font-semibold px-2 py-2.5 rounded-xl border-[1.5px] transition-colors ${
              myRsvp === choice ? RSVP_STYLES[choice] : "bg-surface text-muted border-border-strong hover:bg-bg-tint"
            }`}
            onClick={() => onRsvp(id, choice)}
          >
            {choice === "yes" ? "✅ Yes" : choice === "maybe" ? "🤔 Maybe" : "❌ Can't"}
          </button>
        ))}
      </div>

      {isDinner && myRsvp === "yes" && (
        <div className="flex items-center gap-2.5 mt-2 px-3 py-2 bg-bg-tint rounded-xl text-[13px] font-semibold">
          <span>Bringing guests?</span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="w-7 h-7 p-0 rounded-full font-bold leading-none border border-border-strong bg-surface disabled:opacity-40"
              disabled={myGuests <= 0}
              onClick={() => onGuestStep(id, -1)}
            >
              −
            </button>
            <span className="min-w-[18px] text-center tabular-nums">{myGuests}</span>
            <button
              className="w-7 h-7 p-0 rounded-full font-bold leading-none border border-border-strong bg-surface"
              onClick={() => onGuestStep(id, 1)}
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="bg-bg-tint rounded-xl px-3.5 py-2.5 text-[13px] mt-1.5">
        {bucket.yes.length > 0 && (
          <div className="py-0.5">
            <strong>✅ Going ({bucket.yes.length}):</strong> <span className="text-muted">{bucket.yes.map(fmtName).join(", ")}</span>
          </div>
        )}
        {bucket.maybe.length > 0 && (
          <div className="py-0.5">
            <strong>🤔 Maybe ({bucket.maybe.length}):</strong> <span className="text-muted">{bucket.maybe.join(", ")}</span>
          </div>
        )}
        {bucket.no.length > 0 && (
          <div className="py-0.5">
            <strong>❌ Can't ({bucket.no.length}):</strong> <span className="text-muted">{bucket.no.join(", ")}</span>
          </div>
        )}
        {noReply.length > 0 && (
          <div className="py-0.5">
            <strong>🕓 No reply ({noReply.length}):</strong> <span className="text-muted">{noReply.join(", ")}</span>
          </div>
        )}
        {!bucket.yes.length && !bucket.maybe.length && !bucket.no.length && !noReply.length && (
          <div className="py-0.5 text-muted">No responses yet — share the event link to ask everyone.</div>
        )}
      </div>

      <ChatSection houseCode={houseCode} eventId={id} displayName={displayName} />

      <div className="flex gap-2 flex-wrap mt-4">
        {!isGuestMode && (
          <>
            <button className={btnGhost} onClick={() => onShareGuest(id)}>
              🔗 Copy invite link
            </button>
            <button className={btnGhost} onClick={() => onEdit(id)}>
              Edit
            </button>
            <button className={btnDanger} onClick={() => onDelete(id)}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
