import "./Cal.css";

import { useRef, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function Cal() {
  // ===== DATE =====
  const today = new Date();

  const currentDay = today.toLocaleDateString("en-US", {weekday: "long"});

  const currentDate = today.toLocaleDateString("en-US", {month: "short", day: "2-digit", year: "numeric"});


  // ===== REFS and VIEW =====
  const calendarRef = useRef(null);
  const [view, setView] = useState("timeGridWeek");

  // ===== EVENTS =====
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Physics",

      start: "2026-05-06T10:00:00",
      end: "2026-05-06T11:30:00",
    },

    {
      id: "2",
      title: "Maths",

      start: "2026-05-07T14:00:00",
      end: "2026-05-07T16:00:00",
    },
  ]);


  // ===== VIEW SWITCH =====
  function switchView(newView) {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(newView);
    setView(newView);
  }

  // ===== EVENT CREATE =====
  function handleDateSelect(selectInfo) {
    const title = prompt("Event title");
    if (!title) return;
    const newEvent = {
      id: String(Date.now()),
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    };

    setEvents((prev) => [
      ...prev,
      newEvent,
    ]);
  }


  // ===== EVENT DELETE =====
  function handleEventClick(clickInfo) {
    const confirmDelete = confirm(
      `Delete "${clickInfo.event.title}" ?`
    );
    if (!confirmDelete) return;
    clickInfo.event.remove();
  }


  return (
    <div id="cal">
      {/* ===== LEFT PANEL ===== */}
      <div id="calPanel">
        {/* Day */}
        <h2>{currentDay}</h2>

        {/* Date */}
        <h1>{currentDate}</h1>

        {/* Tiny Calendar */}
        <div id="tinyCal">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            fixedWeekCount={false}
            height="100%"
            events={events}
          />
        </div>
      </div>



      {/* ===== MAIN ===== */}
      <div id="mainCal">
        {/* ===== SWITCHES ===== */}
        <div id="calS">
          <button className={view === "timeGridWeek"? "calMode active" : "calMode"}
            onClick={() => switchView("timeGridWeek")}
          >
            Week
          </button>

          <button className={view === "dayGridMonth"? "calMode active" : "calMode"}
            onClick={() => switchView("dayGridMonth")}
          >
            Month
          </button>
        </div>



        {/* ===== CALENDAR ===== */}
        <div id="calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            initialView={view}
            headerToolbar={false}
            height="100%"
            editable={true}
            selectable={true}
            nowIndicator={true}
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
          />
        </div>
      </div>
    </div>
  );
}