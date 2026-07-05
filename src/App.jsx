import { useEffect, useRef, useState } from "react";
import { ToastProvider, useToast } from "./context/ToastContext";
import { CONFIG_OK } from "./firebase";
import { useAuth } from "./hooks/useAuth";
import { useEvents } from "./hooks/useEvents";
import { useSingleEvent } from "./hooks/useSingleEvent";
import { useWishlist } from "./hooks/useWishlist";
import { usePersonalEvents } from "./hooks/usePersonalEvents";
import { getSavedHouseCode, getSavedName, saveHouseCode, saveName, markSeen } from "./lib/storage";
import { addDaysISO, serializeDateTime } from "./lib/dateUtils";
import { saveEvent, deleteEvent, moveEvent, setRsvp, setPlusOnes, deleteWishItem } from "./lib/firestoreActions";
import Topbar from "./components/Topbar";
import CalendarView from "./components/CalendarView";
import SidePanel from "./components/SidePanel";
import SetupModal from "./components/SetupModal";
import ConfigWarningModal from "./components/ConfigWarningModal";
import EventModal from "./components/EventModal";

function readInitialRouting() {
  const params = new URLSearchParams(location.search);
  const houseCode = (params.get("house") || getSavedHouseCode()).trim();
  const pendingFocusEventId = params.get("event") || null;
  const isGuestMode = params.get("guest") === "1" && !!pendingFocusEventId && !!houseCode;
  return { houseCode, pendingFocusEventId, isGuestMode };
}

function AppShell() {
  const toast = useToast();
  const [{ houseCode: initialHouseCode, pendingFocusEventId, isGuestMode }] = useState(readInitialRouting);

  const [houseCode, setHouseCode] = useState(initialHouseCode);
  const [displayName, setDisplayName] = useState(() => getSavedName());
  const [setupDone, setSetupDone] = useState(() => !!(initialHouseCode && getSavedName()));
  const [configDismissed, setConfigDismissed] = useState(false);

  const [currentSideId, setCurrentSideId] = useState(null);
  const [unreadTick, setUnreadTick] = useState(0);
  const [eventModal, setEventModal] = useState({ open: false, editingId: null, presetDate: null, presetTitle: null });
  const [pendingWishScheduleId, setPendingWishScheduleId] = useState(null);
  const calendarRef = useRef(null);

  const authEnabled = CONFIG_OK && setupDone && !!houseCode && !!displayName;
  const authUser = useAuth(authEnabled, toast);
  const dataReady = authEnabled && !!authUser;

  const eventsMap = useEvents(houseCode, dataReady && !isGuestMode, toast);
  const singleEventData = useSingleEvent(houseCode, pendingFocusEventId, dataReady && isGuestMode, toast);
  const wishItems = useWishlist(houseCode, dataReady && !isGuestMode, toast);
  const { personalEvents, importIcsFile, clearPersonalEvents } = usePersonalEvents();

  // Arrived via a shared event link: once events load, jump the calendar to it and open the side panel.
  const [autoFocusId, setAutoFocusId] = useState(!isGuestMode ? pendingFocusEventId : null);
  useEffect(() => {
    if (isGuestMode || !autoFocusId || !eventsMap.has(autoFocusId)) return;
    const ev = eventsMap.get(autoFocusId);
    if (ev?.start) {
      const datePart = ev.start.includes("T") ? ev.start.split("T")[0] : ev.start;
      calendarRef.current?.gotoDate(datePart);
    }
    setCurrentSideId(autoFocusId);
    markSeen(autoFocusId);
    setAutoFocusId(null);
  }, [eventsMap, autoFocusId, isGuestMode]);

  const guestEventNotFound = isGuestMode && singleEventData === null;
  const displaySideId = isGuestMode ? pendingFocusEventId : currentSideId;
  const displayEventData = isGuestMode ? singleEventData : eventsMap.get(currentSideId);

  const openEventModal = (id, presetDate) => setEventModal({ open: true, editingId: id, presetDate: presetDate || null, presetTitle: null });
  const closeEventModal = () => {
    setEventModal({ open: false, editingId: null, presetDate: null, presetTitle: null });
    setPendingWishScheduleId(null);
  };

  const handleSetupSubmit = (name, code) => {
    if (!name) {
      toast("Please enter your name");
      return;
    }
    if (!code) {
      toast("House code is required");
      return;
    }
    setDisplayName(name);
    saveName(name);
    if (!isGuestMode) {
      setHouseCode(code);
      saveHouseCode(code);
    }
    setSetupDone(true);
  };

  const handleInvite = async () => {
    const url = `${location.origin}${location.pathname}?house=${encodeURIComponent(houseCode)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Invite link copied");
    } catch {
      prompt("Copy this invite link:", url);
    }
  };

  const handleShareGuest = async (id) => {
    const url = `${location.origin}${location.pathname}?house=${encodeURIComponent(houseCode)}&event=${encodeURIComponent(id)}&guest=1`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Guest invite copied — they'll only see this event");
    } catch {
      prompt("Copy this guest invite:", url);
    }
  };

  const handleNewEvent = () => {
    if (!authUser || !houseCode) {
      setSetupDone(false);
      return;
    }
    openEventModal(null);
  };

  const handleEventClick = (id, personalTitle) => {
    if (!id) {
      toast("🔒 " + (personalTitle || "Personal event"));
      return;
    }
    setCurrentSideId(id);
    markSeen(id);
    setUnreadTick((t) => t + 1);
  };

  const handleEventDrop = async (info) => {
    try {
      const patch = { start: serializeDateTime(info.event.start, info.event.allDay) };
      if (info.event.end) {
        let endStr = serializeDateTime(info.event.end, info.event.allDay);
        if (info.event.allDay) endStr = addDaysISO(endStr, -1);
        patch.end = endStr;
      }
      await moveEvent(houseCode, info.event.id, patch, displayName);
      toast("Moved");
    } catch (e) {
      console.error(e);
      toast("Couldn't move event");
      info.revert();
    }
  };

  const handleRsvp = async (id, choice) => {
    if (!displayName) {
      toast("Set a name first");
      return;
    }
    const cur = eventsMap.get(id);
    const rsvps = { ...(cur?.rsvps || {}) };
    const plusOnes = { ...(cur?.plusOnes || {}) };
    if (rsvps[displayName] === choice) {
      delete rsvps[displayName];
      delete plusOnes[displayName];
    } else {
      rsvps[displayName] = choice;
      if (choice !== "yes") delete plusOnes[displayName];
    }
    try {
      await setRsvp(houseCode, id, rsvps, plusOnes, displayName);
    } catch (err) {
      console.error(err);
      toast("Couldn't save RSVP");
    }
  };

  const handleGuestStep = async (id, delta) => {
    const cur = eventsMap.get(id);
    const plusOnes = { ...(cur?.plusOnes || {}) };
    const current = Number(plusOnes[displayName]) || 0;
    const next = delta > 0 ? current + 1 : Math.max(0, current - 1);
    if (next === 0) delete plusOnes[displayName];
    else plusOnes[displayName] = next;
    try {
      await setPlusOnes(houseCode, id, plusOnes, displayName);
    } catch (err) {
      console.error(err);
      toast("Couldn't update guests");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteEvent(houseCode, id);
      toast("Deleted");
      if (currentSideId === id) setCurrentSideId(null);
      if (eventModal.editingId === id) closeEventModal();
    } catch (err) {
      console.error(err);
      toast("Couldn't delete");
    }
  };

  const handleSaveEvent = async (payload) => {
    try {
      await saveEvent(houseCode, eventModal.editingId, payload, displayName);
      if (!eventModal.editingId && pendingWishScheduleId) {
        try {
          await deleteWishItem(houseCode, pendingWishScheduleId);
        } catch {
          /* ignore */
        }
      }
      toast(eventModal.editingId ? "Saved" : "Added");
      closeEventModal();
    } catch (e) {
      console.error(e);
      toast("Couldn't save — check Firestore rules");
    }
  };

  const handleScheduleWish = (item) => {
    setPendingWishScheduleId(item.id);
    setEventModal({ open: true, editingId: null, presetDate: null, presetTitle: item.title });
  };

  const mainGridClass = isGuestMode ? "grid overflow-hidden" : "grid overflow-hidden md:grid-cols-[1fr_340px]";

  return (
    <div className="grid grid-rows-[auto_1fr] h-screen">
      <Topbar
        isGuestMode={isGuestMode}
        displayName={displayName}
        houseCode={houseCode}
        connected={!!authUser}
        onInvite={handleInvite}
        onNewEvent={handleNewEvent}
      />

      <main className={mainGridClass}>
        {!isGuestMode && (
          <div className="px-7 py-[22px] overflow-auto">
            <CalendarView
              ref={calendarRef}
              eventsMap={eventsMap}
              personalEvents={personalEvents}
              displayName={displayName}
              unreadTick={unreadTick}
              onDateClick={(dateStr) => openEventModal(null, dateStr)}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
            />
          </div>
        )}

        <SidePanel
          isGuestMode={isGuestMode}
          currentSideId={displaySideId}
          eventNotFound={guestEventNotFound}
          currentEventData={displayEventData}
          houseCode={houseCode}
          displayName={displayName}
          onRsvp={handleRsvp}
          onGuestStep={handleGuestStep}
          onEdit={(id) => openEventModal(id)}
          onDelete={handleDeleteEvent}
          onShareGuest={handleShareGuest}
          wishItems={wishItems}
          onScheduleWish={handleScheduleWish}
          eventsMap={eventsMap}
          personalEvents={personalEvents}
          importIcsFile={importIcsFile}
          clearPersonalEvents={clearPersonalEvents}
        />
      </main>

      <ConfigWarningModal open={CONFIG_OK === false && !configDismissed} onDismiss={() => setConfigDismissed(true)} />

      <SetupModal
        open={CONFIG_OK && !setupDone}
        isGuestMode={isGuestMode}
        initialName={displayName}
        initialCode={houseCode}
        onSubmit={handleSetupSubmit}
      />

      <EventModal
        open={eventModal.open}
        editingId={eventModal.editingId}
        data={eventModal.editingId ? eventsMap.get(eventModal.editingId) : null}
        presetDate={eventModal.presetDate}
        presetTitle={eventModal.presetTitle}
        onSave={handleSaveEvent}
        onCancel={closeEventModal}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
