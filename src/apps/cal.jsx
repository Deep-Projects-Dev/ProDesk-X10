import "./Cal.css";

import { useEffect, useMemo, useRef, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const COLOR_OPTIONS = [
  { name: "Rose", value: "#f6c1c8" },
  { name: "Peach", value: "#ffd7b2" },
  { name: "Butter", value: "#f7e59c" },
  { name: "Mint", value: "#c9efc6" },
  { name: "Aqua", value: "#bfeef0" },
  { name: "Sky", value: "#c6dbff" },
  { name: "Lavender", value: "#e0cdff" },
  { name: "Pink", value: "#f1c7ef" },
  { name: "Fog", value: "#d9dee7" },
  { name: "Sand", value: "#ffe0bf" },
];

const EMOJI_OPTIONS = ["📅", "📚", "📝", "🧪", "💻", "🎯", "🌙", "⭐", "🎵", "🍀", "🏃", "🎮"];

const WEEK_ZOOM = [
  { slotDuration: "01:00:00", slotLabelInterval: "02:00:00", slotHeight: "2.2rem" },
  { slotDuration: "00:30:00", slotLabelInterval: "01:00:00", slotHeight: "2.55rem" },
  { slotDuration: "00:15:00", slotLabelInterval: "00:30:00", slotHeight: "3.1rem" },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function cloneDate(date) {
  return new Date(date.getTime());
}

function addDays(date, days) {
  const next = cloneDate(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addHours(date, hours) {
  const next = cloneDate(date);
  next.setHours(next.getHours() + hours);
  return next;
}

function setTime(date, hours, minutes = 0) {
  const next = cloneDate(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function toDateInputValue(date) {
  const d = cloneDate(date);
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
}

function toDateTimeInputValue(date) {
  const d = cloneDate(date);
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

function fromDateTimeInputValue(value) {
  if (!value) return null;
  return new Date(value.length === 16 ? `${value}:00` : value);
}

function formatMonthTitle(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatDayNumber(date) {
  return pad(date.getDate());
}

function formatDayName(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function formatAgendaHeader(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function sameDay(a, b) {
  return toDateInputValue(a) === toDateInputValue(b);
}

function rangeToDates(start, days) {
  return Array.from({ length: days }, (_, i) => addDays(start, i));
}

function defaultEventStartFromSelection(startLike, timed) {
  const start = new Date(startLike);

  if (timed) return start;

  return setTime(start, 9, 0);
}

function defaultEventEndFromSelection(start, timed, endLike) {
  if (!timed) return addHours(start, 1);

  if (endLike) {
    const end = new Date(endLike);

    if (!Number.isNaN(end.getTime()) && end > start) {
      return end;
    }
  }

  return addHours(start, 1);
}

export default function Cal() {
  const calendarRef = useRef(null);
  const shellRef = useRef(null);
  const jumpInputRef = useRef(null);

  const [view, setView] = useState("week");
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [focusDate, setFocusDate] = useState(new Date());
  const [jumpDate, setJumpDate] = useState(toDateInputValue(new Date()));

  useEffect(() => {
    setJumpDate(toDateInputValue(focusDate));
  }, [focusDate]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    calendarRef.current?.getApi()?.updateSize();
  }, [view, zoom]);

  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Physics",
      emoji: "🧪",
      color: "#c6dbff",
      start: "2026-05-06T10:00:00",
      end: "2026-05-06T11:30:00",
    },

    {
      id: "2",
      title: "Maths",
      emoji: "📝",
      color: "#f6c1c8",
      start: "2026-05-07T14:00:00",
      end: "2026-05-07T16:00:00",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [draft, setDraft] = useState({
    title: "",
    emoji: "📅",
    color: COLOR_OPTIONS[0].value,
    start: "",
    end: "",
  });

  const currentDay = formatDayNumber(focusDate);
  const currentDate = formatDayName(focusDate);
  const monthTitle = formatMonthTitle(focusDate);

  const fcEvents = useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: event.color,
        borderColor: event.color,
        textColor: "#161616",
        extendedProps: {
          emoji: event.emoji,
          color: event.color,
        },
      })),
    [events]
  );

  const agendaDays = useMemo(() => rangeToDates(focusDate, 14), [focusDate]);

  function switchView(nextView) {
    const api = calendarRef.current?.getApi();

    setView(nextView);

    if (nextView !== "agenda") {
      api?.changeView(nextView === "month" ? "dayGridMonth" : "timeGridWeek");
      api?.gotoDate(focusDate);
    }
  }

  function goPrev() {
    const api = calendarRef.current?.getApi();

    if (view !== "agenda") {
      api?.prev();
    }

    setFocusDate((prev) => addDays(prev, view === "month" ? -1 : -7));
  }

  function goNext() {
    const api = calendarRef.current?.getApi();

    if (view !== "agenda") {
      api?.next();
    }

    setFocusDate((prev) => addDays(prev, view === "month" ? 1 : 7));
  }

  function goToday() {
    const today = new Date();
    const api = calendarRef.current?.getApi();

    setFocusDate(today);

    if (view !== "agenda") {
      api?.today();
      api?.gotoDate(today);
    }
  }

  function goToDate() {
    if (!jumpDate) return;

    const next = new Date(`${jumpDate}T12:00:00`);
    const api = calendarRef.current?.getApi();

    setFocusDate(next);

    if (view !== "agenda") {
      api?.gotoDate(next);
    }
  }

  function openJumpPicker() {
    const input = jumpInputRef.current;

    if (!input) return;

    input.focus();

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  }

  function zoomOut() {
    setZoom((prev) => Math.max(0, prev - 1));
  }

  function zoomIn() {
    setZoom((prev) => Math.min(2, prev + 1));
  }

  function toggleFullscreen() {
    const el = shellRef.current;

    if (!el) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }

    el.requestFullscreen?.();
  }

  function openCreateModal(startLike, timed = true) {
    const baseStart = defaultEventStartFromSelection(startLike, timed);
    const baseEnd = defaultEventEndFromSelection(baseStart, timed);

    setEditingId(null);
    setDraft({
      title: "",
      emoji: "📅",
      color: COLOR_OPTIONS[0].value,
      start: toDateTimeInputValue(baseStart),
      end: toDateTimeInputValue(baseEnd),
    });
    setShowModal(true);
  }

  function openEditModal(fullCalendarEvent) {
    const start = fullCalendarEvent.start || new Date();
    const end = fullCalendarEvent.end || addHours(start, 1);
    const color =
      fullCalendarEvent.extendedProps?.color ||
      fullCalendarEvent.backgroundColor ||
      COLOR_OPTIONS[0].value;

    setEditingId(fullCalendarEvent.id);
    setDraft({
      title: fullCalendarEvent.title || "",
      emoji: fullCalendarEvent.extendedProps?.emoji || "📅",
      color,
      start: toDateTimeInputValue(start),
      end: toDateTimeInputValue(end),
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  function handleSave(e) {
    e.preventDefault();

    const start = fromDateTimeInputValue(draft.start);
    const end = fromDateTimeInputValue(draft.end) || addHours(start, 1);

    if (!start) return;

    const nextEvent = {
      id: editingId || String(Date.now()),
      title: draft.title.trim() || "Untitled",
      emoji: draft.emoji || "📅",
      color: draft.color || COLOR_OPTIONS[0].value,
      start: toDateTimeInputValue(start),
      end: end > start ? toDateTimeInputValue(end) : toDateTimeInputValue(addHours(start, 1)),
    };

    setEvents((prev) => {
      if (!editingId) return [...prev, nextEvent];

      return prev.map((event) =>
        event.id === editingId ? nextEvent : event
      );
    });

    closeModal();
  }

  function handleDelete() {
    if (!editingId) return;

    setEvents((prev) => prev.filter((event) => event.id !== editingId));
    closeModal();
  }

  function syncDraggedEvent(argEvent) {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === argEvent.id
          ? {
              ...event,
              title: argEvent.title,
              emoji: argEvent.extendedProps?.emoji || event.emoji,
              color: argEvent.extendedProps?.color || event.color,
              start: toDateTimeInputValue(argEvent.start || new Date()),
              end: toDateTimeInputValue(argEvent.end || addHours(argEvent.start || new Date(), 1)),
            }
          : event
      )
    );
  }

  function handleSelect(selectInfo) {
    const timed = selectInfo.startStr.includes("T");
    openCreateModal(selectInfo.startStr, timed);
    selectInfo.view.calendar.unselect();
  }

  function handleDateClick(clickInfo) {
    const timed = clickInfo.view.type !== "dayGridMonth";
    openCreateModal(clickInfo.date, timed);
  }

  function handleEventClick(clickInfo) {
    openEditModal(clickInfo.event);
  }

  function handleEventDrop(arg) {
    syncDraggedEvent(arg.event);
  }

  function handleEventResize(arg) {
    syncDraggedEvent(arg.event);
  }

  function handleMiniDateClick(arg) {
    setFocusDate(arg.date);

    if (view !== "agenda") {
      calendarRef.current?.getApi()?.gotoDate(arg.date);
    }
  }

  function agendaEventsForDay(day) {
    return events
      .filter((event) => sameDay(new Date(event.start), day))
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }

  const slotConfig = WEEK_ZOOM[zoom];

  return (
    <div id="cal">
      <style>{`
        #tinyCal .fc .fc-daygrid-day-frame {
          aspect-ratio: 1 / 1;
          min-height: unset !important;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        #tinyCal .fc .fc-daygrid-body-balanced .fc-scrollgrid-sync-table,
        #tinyCal .fc .fc-daygrid-body-unbalanced .fc-scrollgrid-sync-table {
          table-layout: fixed;
        }

        #tinyCal .fc .fc-daygrid-day-top {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        #tinyCal .fc .fc-daygrid-day-number {
          padding: 0 !important;
          line-height: 1;
        }

        #tinyCal .fc .fc-daygrid-day-events,
        #tinyCal .fc .fc-daygrid-day-bottom {
          display: none;
        }
      `}</style>

      {/* ===== LEFT PANEL ===== */}
      <div id="calPanel">
        <div className="calDateBlock">
          <h1>{currentDay}</h1>
          <h2>{currentDate}</h2>
        </div>

        <div id="tinyCal">
          <FullCalendar
            key={toDateInputValue(focusDate)}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            initialDate={focusDate}
            headerToolbar={false}
            fixedWeekCount={false}
            showNonCurrentDates={false}
            selectable={false}
            editable={false}
            eventDisplay="none"
            dateClick={handleMiniDateClick}
            height="100%"
          />
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div id="mainCal">
        <div id="calTop">
          <div className="monthTitle">{monthTitle}</div>

          <div
            className="toolBar"
            style={{
              flexWrap: "nowrap",
            }}
          >
            <div className="toolGroup navGroup">
              <button className="toolBtn" type="button" onClick={goPrev}>‹</button>
              <button className="toolBtn todayBtn" type="button" onClick={goToday}>Today</button>
              <button className="toolBtn" type="button" onClick={goNext}>›</button>
              <button
                className="toolBtn"
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit full screen" : "Full screen calendar"}
              >
                ⛶
              </button>
            </div>

            <div className="toolGroup jumpGroup" style={{ position: "relative" }}>
              <input
                ref={jumpInputRef}
                className="jumpInput"
                type="date"
                value={jumpDate}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setJumpDate(nextValue);

                  if (!nextValue) return;

                  const next = new Date(`${nextValue}T12:00:00`);
                  const api = calendarRef.current?.getApi();

                  setFocusDate(next);

                  if (view !== "agenda") {
                    api?.gotoDate(next);
                  }
                }}
                style={{
                  position: "absolute",
                  width: 0,
                  height: 0,
                  opacity: 0,
                  overflow: "hidden",
                }}
              />
              <button className="toolBtn jumpBtn" type="button" onClick={openJumpPicker}>
                Jump
              </button>
            </div>

            <div className="toolGroup viewGroup">
              <button
                className={view === "month" ? "viewBtn active" : "viewBtn"}
                type="button"
                onClick={() => switchView("month")}
              >
                Month
              </button>
              <button
                className={view === "week" ? "viewBtn active" : "viewBtn"}
                type="button"
                onClick={() => switchView("week")}
              >
                Week
              </button>
              <button
                className={view === "agenda" ? "viewBtn active" : "viewBtn"}
                type="button"
                onClick={() => switchView("agenda")}
              >
                Agenda
              </button>
            </div>

            <div className="toolGroup navGroup">
              <button
                className="toolBtn"
                type="button"
                onClick={zoomOut}
                disabled={view !== "week"}
                title="Zoom out"
              >
                −
              </button>
              <button
                className="toolBtn"
                type="button"
                onClick={zoomIn}
                disabled={view !== "week"}
                title="Zoom in"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div
          id="calendarShell"
          ref={shellRef}
          style={{
            "--slot-h": view === "week" ? slotConfig.slotHeight : "2.55rem",
          }}
        >
          <style>{`
            #calendarShell .fc .fc-timegrid-slot {
              height: var(--slot-h, 2.55rem);
            }
          `}</style>

          {view !== "agenda" && (
            <FullCalendar
              ref={calendarRef}
              key={`${view}-${zoom}`}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view === "month" ? "dayGridMonth" : "timeGridWeek"}
              headerToolbar={false}
              initialDate={focusDate}
              height="100%"
              expandRows={true}
              firstDay={0}
              nowIndicator={true}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={false}
              scrollTime="00:00:00"
              slotDuration={view === "week" ? slotConfig.slotDuration : "00:30:00"}
              slotLabelInterval={view === "week" ? slotConfig.slotLabelInterval : "01:00:00"}
              selectable={true}
              selectMirror={true}
              editable={true}
              eventStartEditable={true}
              eventDurationEditable={true}
              dayMaxEventRows={4}
              eventDisplay="block"
              eventOrder="start,-duration,title"
              dayHeaderContent={(arg) =>
                view === "week" ? (
                  <div className="weekHead">
                    <span>{arg.date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                    <strong>{arg.date.getDate()}</strong>
                  </div>
                ) : (
                  <div className="monthHead">{arg.text}</div>
                )
              }
              eventContent={(arg) => {
                const isMonth = arg.view.type === "dayGridMonth";

                return (
                  <div className={isMonth ? "eventCard month" : "eventCard"}>
                    <span className="eventEmoji">{arg.event.extendedProps?.emoji || "📅"}</span>
                    <div className="eventBody">
                      {!isMonth && arg.timeText && (
                        <span className="eventTime">{arg.timeText}</span>
                      )}
                      <span className="eventTitle">{arg.event.title}</span>
                    </div>
                  </div>
                );
              }}
              events={fcEvents}
              select={handleSelect}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
            />
          )}

          {view === "agenda" && (
            <div id="agendaView">
              {agendaDays.map((day) => {
                const dayEvents = agendaEventsForDay(day);

                return (
                  <div className="agendaDay" key={toDateInputValue(day)}>
                    <button
                      className="agendaHead"
                      type="button"
                      onClick={() => openCreateModal(day, false)}
                    >
                      <span>{formatAgendaHeader(day)}</span>
                      <span className="agendaPlus">+</span>
                    </button>

                    <div className="agendaList">
                      {dayEvents.length === 0 && (
                        <div className="agendaEmpty">No events</div>
                      )}

                      {dayEvents.map((event) => {
                        const start = fromDateTimeInputValue(event.start);
                        const end = fromDateTimeInputValue(event.end) || addHours(start, 1);

                        return (
                          <button
                            className="agendaEvent"
                            key={event.id}
                            type="button"
                            style={{ "--accent": event.color }}
                            onClick={() =>
                              openEditModal({
                                id: event.id,
                                title: event.title,
                                start,
                                end,
                                backgroundColor: event.color,
                                extendedProps: {
                                  emoji: event.emoji,
                                  color: event.color,
                                },
                              })
                            }
                          >
                            <span className="agendaEmoji">{event.emoji || "📅"}</span>
                            <div className="agendaMeta">
                              <div className="agendaTitleRow">
                                <span className="agendaTime">
                                  {formatTime(start)} — {formatTime(end)}
                                </span>
                                <span className="agendaColorDot" />
                              </div>
                              <span className="agendaTitle">{event.title}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div id="modalBackdrop" onClick={closeModal}>
          <form className="modalCard" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <div className="modalHead">
              <div>
                <h3>{editingId ? "Edit event" : "Add event"}</h3>
                <p>{monthTitle}</p>
              </div>

              <button className="modalClose" type="button" onClick={closeModal}>×</button>
            </div>

            <div className="modalGrid">
              <label className="field">
                <span>Title</span>
                <input
                  className="textInput"
                  type="text"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Physics revision"
                  autoFocus
                />
              </label>

              <div className="field">
                <span>Emoji</span>
                <div className="emojiGrid">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      className={draft.emoji === emoji ? "emojiBtn active" : "emojiBtn"}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, emoji }))
                      }
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span>Color</span>
                <div className="swatchGrid">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      className={draft.color === color.value ? "swatch active" : "swatch"}
                      type="button"
                      title={color.name}
                      style={{ backgroundColor: color.value }}
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, color: color.value }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="dateGrid">
                <label className="field">
                  <span>Start</span>
                  <input
                    className="textInput"
                    type="datetime-local"
                    value={draft.start}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, start: e.target.value }))
                    }
                  />
                </label>

                <label className="field">
                  <span>End</span>
                  <input
                    className="textInput"
                    type="datetime-local"
                    value={draft.end}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, end: e.target.value }))
                    }
                  />
                </label>
              </div>
            </div>

            <div className="modalActions">
              {editingId && (
                <button className="modalBtn danger" type="button" onClick={handleDelete}>
                  Delete
                </button>
              )}
              <button className="modalBtn" type="button" onClick={closeModal}>
                Cancel
              </button>
              <button className="modalBtn primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}