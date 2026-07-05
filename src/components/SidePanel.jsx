import EventDetails from "./EventDetails";
import Wishlist from "./Wishlist";
import MonthSummary from "./MonthSummary";
import SyncCard from "./SyncCard";

export default function SidePanel({
  isGuestMode,
  currentSideId,
  eventNotFound,
  currentEventData,
  houseCode,
  displayName,
  onRsvp,
  onGuestStep,
  onEdit,
  onDelete,
  onShareGuest,
  wishItems,
  onScheduleWish,
  eventsMap,
  personalEvents,
  importIcsFile,
  clearPersonalEvents,
}) {
  return (
    <aside
      className={
        isGuestMode
          ? "overflow-y-auto p-7 px-5 bg-transparent w-full max-w-[640px] mx-auto"
          : "border-l border-border bg-bg-tint overflow-y-auto p-[22px]"
      }
    >
      {!isGuestMode && <h2 className="text-[11px] uppercase tracking-wider text-muted m-0 mb-3 font-bold">✨ Details</h2>}
      <div className="bg-surface rounded shadow-card p-4">
        {eventNotFound ? (
          <div className="text-center py-10 px-2.5">
            <div className="text-[32px] mb-2">😕</div>
            <div>
              <strong>Event not found</strong>
            </div>
            <div className="text-muted mt-1">The link may be wrong, or the host deleted this event.</div>
          </div>
        ) : currentSideId && currentEventData ? (
          <EventDetails
            id={currentSideId}
            data={currentEventData}
            houseCode={houseCode}
            displayName={displayName}
            isGuestMode={isGuestMode}
            onRsvp={onRsvp}
            onGuestStep={onGuestStep}
            onEdit={onEdit}
            onDelete={onDelete}
            onShareGuest={onShareGuest}
          />
        ) : (
          <div className="text-muted text-[13px] py-1">Tap an event for details, or drag any event to a new day to reschedule.</div>
        )}
      </div>

      {!isGuestMode && (
        <>
          <h2 className="text-[11px] uppercase tracking-wider text-muted mt-6 mb-3 font-bold">💭 Ideas</h2>
          <Wishlist houseCode={houseCode} displayName={displayName} items={wishItems} onSchedule={onScheduleWish} />

          <h2 className="text-[11px] uppercase tracking-wider text-muted mt-6 mb-3 font-bold">🌻 This month</h2>
          <MonthSummary eventsMap={eventsMap} displayName={displayName} />

          <h2 className="text-[11px] uppercase tracking-wider text-muted mt-6 mb-3 font-bold">📅 Calendar sync</h2>
          <SyncCard
            houseCode={houseCode}
            eventsMap={eventsMap}
            personalEvents={personalEvents}
            importIcsFile={importIcsFile}
            clearPersonalEvents={clearPersonalEvents}
          />
        </>
      )}
    </aside>
  );
}
