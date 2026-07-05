import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { categoryOf } from "../lib/categories";
import { isAllDayStart, addDaysISO } from "../lib/dateUtils";
import { hasUnread } from "../lib/storage";

const CalendarView = forwardRef(function CalendarView(
  { eventsMap, personalEvents, displayName, unreadTick, onDateClick, onEventClick, onEventDrop },
  ref
) {
  const calRef = useRef(null);

  useImperativeHandle(ref, () => ({
    gotoDate(dateStr) {
      calRef.current?.getApi()?.gotoDate(dateStr);
    },
  }));

  const fcEvents = useMemo(() => {
    const out = [];
    for (const [id, data] of eventsMap) {
      const cat = categoryOf(data.category);
      const allDay = isAllDayStart(data.start);
      const unread = hasUnread(id, data, displayName);
      const ev = {
        id,
        title: data.title || "Untitled",
        start: data.start,
        allDay,
        backgroundColor: cat.bg,
        borderColor: cat.bg,
        textColor: cat.fg,
        classNames: unread ? ["has-unread"] : [],
      };
      if (data.end) {
        // FullCalendar's end is EXCLUSIVE for all-day events. We store inclusive, so bump by one day.
        ev.end = allDay && isAllDayStart(data.end) ? addDaysISO(data.end, 1) : data.end;
      }
      out.push(ev);
    }
    // Overlay personal events (only on this device — never in Firestore)
    personalEvents.forEach((p, i) => {
      const allDay = isAllDayStart(p.start);
      const pe = {
        id: "personal-" + i,
        title: p.title,
        start: p.start,
        allDay,
        classNames: ["personal"],
        editable: false,
      };
      if (p.end) {
        pe.end = allDay && isAllDayStart(p.end) ? addDaysISO(p.end, 1) : p.end;
      }
      out.push(pe);
    });
    return out;
    // unreadTick forces a recompute when a chat is marked seen, since that only touches localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsMap, personalEvents, displayName, unreadTick]);

  return (
    <div className="bg-surface rounded-lg p-5 shadow-card">
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        locale="en-gb"
        firstDay={1}
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,listMonth" }}
        buttonText={{ today: "Today", month: "Month", week: "Week", list: "List" }}
        editable
        eventStartEditable
        eventOrder="start,title"
        displayEventTime
        events={fcEvents}
        dateClick={(info) => onDateClick(info.dateStr)}
        eventClick={(info) => {
          if (info.event.id && info.event.id.startsWith("personal-")) {
            onEventClick(null, info.event.title || "Personal event");
            return;
          }
          onEventClick(info.event.id);
        }}
        eventDrop={(info) => onEventDrop(info)}
      />
    </div>
  );
});

export default CalendarView;
