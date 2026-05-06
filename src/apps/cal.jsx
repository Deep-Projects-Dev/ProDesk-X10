import "./cal.css";

import { useRef, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

function toInputValue(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function toDayValue(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function addMinutes(date, minutes) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

function startAtNine(date) {
  const next = new Date(date);
  next.setHours(9, 0, 0, 0);
  return next;
}

function formatRangeTitle(date, view) {
  if (!date) return "";
  const d = new Date(date);

  if (view === "dayGridMonth") {
    return d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  if (view === "listWeek") {
    const start = new Date(d);
    const end = addMinutes(start, 60 * 24 * 6);

    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} – ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function serializeEvent(event) {
  return {
    id: String(event.id),
    title: event.title || "Untitled",
    start: event.start ? event.start.toISOString() : "",
    end: event.end ? event.end.toISOString() : "",
    notes: event.extendedProps?.notes || "",
  };
}

export default function Cal() {
  // ===== REFS =====

  const calendarRef = useRef(null);
  const tinyCalendarRef = useRef(null);

  // ===== DATE =====

  const today = new Date();

  // ===== VIEW =====

  const [view, setView] = useState("timeGridWeek");
  const [focusDate, setFocusDate] = useState(today);
  const [jumpDate, setJumpDate] = useState(toDayValue(today));
  const [rangeTitle, setRangeTitle] = useState(
    formatRangeTitle(today, "timeGridWeek"),
  );

  // ===== EVENTS =====

  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Physics",
      start: "2026-05-06T10:00:00",
      end: "2026-05-06T11:30:00",
      notes: "",
    },

    {
      id: "2",
      title: "Maths",
      start: "2026-05-07T14:00:00",
      end: "2026-05-07T16:00:00",
      notes: "",
    },
  ]);

  // ===== MODAL =====

  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    id: "",
    title: "",
    start: "",
    end: "",
    notes: "",
  });

  // ===== API =====

  function getApi() {
    return calendarRef.current?.getApi();
  }

  function getTinyApi() {
    return tinyCalendarRef.current?.getApi();
  }

  // ===== SYNC =====

  function syncToDate(date) {
    const api = getApi();
    const tinyApi = getTinyApi();

    if (api) {
      api.gotoDate(date);
      setRangeTitle(api.view.title);
    }

    if (tinyApi) {
      tinyApi.gotoDate(date);
    }

    const next = new Date(date);
    setFocusDate(next);
    setJumpDate(toDayValue(next));
  }

  // ===== VIEW SWITCH =====

  function switchView(nextView) {
    const api = getApi();
    if (!api) return;

    api.changeView(nextView);

    const current = api.getDate();
    setView(nextView);
    setRangeTitle(api.view.title);
    setFocusDate(new Date(current));
    setJumpDate(toDayValue(current));

    const tinyApi = getTinyApi();
    if (tinyApi) {
      tinyApi.gotoDate(current);
    }
  }

  // ===== NAV =====

  function move(dir) {
    const api = getApi();
    if (!api) return;

    if (dir === "today") {
      api.today();
    } else if (dir === "prev") {
      api.prev();
    } else {
      api.next();
    }

    const current = api.getDate();
    setView(api.view.type);
    setRangeTitle(api.view.title);
    setFocusDate(new Date(current));
    setJumpDate(toDayValue(current));

    const tinyApi = getTinyApi();
    if (tinyApi) {
      tinyApi.gotoDate(current);
    }
  }

  // ===== MODAL OPEN =====

  function openAddModal(date) {
    const start = startAtNine(date || focusDate);
    const end = addMinutes(start, 60);

    setModal({
      open: true,
      mode: "add",
      id: "",
      title: "",
      start: toInputValue(start),
      end: toInputValue(end),
      notes: "",
    });
  }

  function openEditModal(event) {
    const start = event.start || focusDate;
    const end = event.end || addMinutes(start, 60);

    setModal({
      open: true,
      mode: "edit",
      id: String(event.id),
      title: event.title || "",
      start: toInputValue(start),
      end: toInputValue(end),
      notes: event.extendedProps?.notes || "",
    });
  }

  // ===== CALENDAR ACTIONS =====

  function handleDatesSet(info) {
    const current = info.view.calendar.getDate();

    setView(info.view.type);
    setRangeTitle(info.view.title);
    setFocusDate(new Date(current));
    setJumpDate(toDayValue(current));
  }

  function handleDateClick(info) {
    if (view === "listWeek") return;

    setFocusDate(info.date);
    setJumpDate(toDayValue(info.date));
    openAddModal(info.date);
  }

  function handleSelect(info) {
    if (view === "listWeek") return;

    const start = info.start || focusDate;
    const end = info.end || addMinutes(start, 60);

    setFocusDate(start);
    setJumpDate(toDayValue(start));

    setModal({
      open: true,
      mode: "add",
      id: "",
      title: "",
      start: toInputValue(start),
      end: toInputValue(end),
      notes: "",
    });
  }

  function handleEventClick(info) {
    setFocusDate(info.event.start || focusDate);
    setJumpDate(toDayValue(info.event.start || focusDate));
    openEditModal(info.event);
  }

  function handleEventChange(info) {
    const changed = serializeEvent(info.event);

    setEvents((prev) =>
      prev.map((item) =>
        item.id === changed.id ? { ...item, ...changed } : item,
      ),
    );
  }

  // ===== MODAL EDIT =====

  function handleSave(e) {
    e.preventDefault();

    const title = modal.title.trim();
    if (!title) return;

    const start = new Date(modal.start);
    const end = new Date(modal.end || modal.start);

    const nextEvent = {
      id: modal.id || String(Date.now()),
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      notes: modal.notes.trim(),
    };

    setEvents((prev) =>
      modal.mode === "edit"
        ? prev.map((item) => (item.id === modal.id ? nextEvent : item))
        : [...prev, nextEvent],
    );

    setModal({
      open: false,
      mode: "add",
      id: "",
      title: "",
      start: "",
      end: "",
      notes: "",
    });
  }

  function handleDelete() {
    setEvents((prev) => prev.filter((item) => item.id !== modal.id));

    setModal({
      open: false,
      mode: "add",
      id: "",
      title: "",
      start: "",
      end: "",
      notes: "",
    });
  }

  function closeModal() {
    setModal({
      open: false,
      mode: "add",
      id: "",
      title: "",
      start: "",
      end: "",
      notes: "",
    });
  }

  // ===== DAY HEADER =====

  function renderDayHeader(arg) {
    const d = arg.date;

    return (
      <div className="dayHead">
        <span>
          {d.toLocaleDateString("en-US", {
            weekday: "short",
          })}
        </span>

        <strong>
          {d.toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
          })}
        </strong>
      </div>
    );
  }

  // ===== EVENT UI =====

  function renderEventContent(arg) {
    return (
      <div className="eventBubble">
        <span className="eventTime">{arg.timeText}</span>
        <span className="eventTitle">{arg.event.title}</span>
      </div>
    );
  }

  return (
    <div id="cal">
      {/* ===== LEFT PANEL ===== */}

      <div id="calPanel">
        <div id="calDate">
          <h1>
            {focusDate.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </h1>

          <h2>
            {focusDate.toLocaleDateString("en-US", {
              weekday: "long",
            })}
          </h2>
        </div>

        <div id="tinyCal">
          <FullCalendar
            ref={tinyCalendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            initialDate={focusDate}
            headerToolbar={false}
            fixedWeekCount={false}
            showNonCurrentDates={false}
            height="100%"
            dateClick={(info) => syncToDate(info.date)}
          />
        </div>
      </div>

      {/* ===== MAIN ===== */}

      <div id="mainCal">
        {/* ===== TOP BAR ===== */}

        <div id="calS">
          <div className="calNavGroup">
            <button className="calMode tiny" onClick={() => move("prev")}>
              ‹
            </button>
            <button className="calMode" onClick={() => move("today")}>
              Today
            </button>
            <button className="calMode tiny" onClick={() => move("next")}>
              ›
            </button>
          </div>

          <h3 className="calRange">{rangeTitle}</h3>

          <div className="calNavGroup right">
            <input
              className="calJump"
              type="date"
              value={jumpDate}
              onChange={(e) => setJumpDate(e.target.value)}
            />

            <button className="calMode" onClick={() => syncToDate(jumpDate)}>
              Go
            </button>
            <button
              className={view === "timeGridWeek" ? "calMode active" : "calMode"}
              onClick={() => switchView("timeGridWeek")}
            >
              Week
            </button>
            <button
              className={view === "dayGridMonth" ? "calMode active" : "calMode"}
              onClick={() => switchView("dayGridMonth")}
            >
              Month
            </button>
            <button
              className={view === "listWeek" ? "calMode active" : "calMode"}
              onClick={() => switchView("listWeek")}
            >
              List
            </button>
            <button
              className="calMode add"
              onClick={() => openAddModal(focusDate)}
            >
              Add
            </button>
          </div>
        </div>

        {/* ===== CALENDAR ===== */}

        <div id="calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            initialView="timeGridWeek"
            headerToolbar={false}
            height="100%"
            allDaySlot={false}
            nowIndicator={true}
            editable={view !== "listWeek"}
            eventStartEditable={view !== "listWeek"}
            eventDurationEditable={view !== "listWeek"}
            selectable={view !== "listWeek"}
            selectMirror={true}
            longPressDelay={250}
            eventDragMinDistance={8}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            expandRows={true}
            dayMaxEvents={3}
            titleRangeSeparator=" – "
            events={events}
            dayHeaderContent={
              view === "timeGridWeek" ? renderDayHeader : undefined
            }
            eventContent={view === "listWeek" ? undefined : renderEventContent}
            datesSet={handleDatesSet}
            dateClick={handleDateClick}
            select={handleSelect}
            eventClick={handleEventClick}
            eventChange={handleEventChange}
            listDayFormat={{
              weekday: "short",
              month: "numeric",
              day: "numeric",
            }}
            listDaySideFormat={{ year: "numeric" }}
          />
        </div>
      </div>

      {/* ===== MODAL ===== */}

      {modal.open && (
        <div
          className="calModalBackdrop"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <form className="calModal" onSubmit={handleSave}>
            <div className="calModalTop">
              <h4>{modal.mode === "edit" ? "Edit event" : "Add event"}</h4>

              <button
                type="button"
                className="calModalClose"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <label>
              Title
              <input
                type="text"
                value={modal.title}
                onChange={(e) =>
                  setModal((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Event name"
                autoFocus
              />
            </label>

            <label>
              Start
              <input
                type="datetime-local"
                value={modal.start}
                onChange={(e) =>
                  setModal((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </label>

            <label>
              End
              <input
                type="datetime-local"
                value={modal.end}
                onChange={(e) =>
                  setModal((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </label>

            <label>
              Notes
              <textarea
                value={modal.notes}
                onChange={(e) =>
                  setModal((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional"
                rows="3"
              />
            </label>

            <div className="calModalActions">
              {modal.mode === "edit" && (
                <button
                  type="button"
                  className="calBtn danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}

              <div className="calModalActionsRight">
                <button
                  type="button"
                  className="calBtn ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="calBtn primary">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
