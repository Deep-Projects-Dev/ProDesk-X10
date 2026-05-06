// imports
import { useState, useEffect } from "react";
import "./Cal.css";

// calendar imports
import FullCalendar from "@fullcalendar/react";

// app
export default function Cal() {

  return (
    <>
      <div id="cal">
        <aside id="calPanel">
          <h1>{todate}</h1> {/* Write current date in MM YYYY format. */}
          <h2>{today}</h2> {/* Write current day here, in words. */}
          {/* Add a small month calendar here, with the current date highlighted. */}
        </aside>
        <section id="mainCal">
          <div id="calS">
            {/* These switch are to be centered horizontally. */}
            <button className="calMode">Week</button>
            <button className="calMode">Month</button>

            {/* These should stick to right corner */}
            <button className="move">←</button>
            <button className="move">→</button>
          </div>
          <main id="calendar">
            {/* This is the main calendar area, where the week or month view will be displayed based on the selected mode. */}

            <table>
              <tr>
                {days.map(day => {
                  <th key={day}>{day}</th>
                })}
              </tr>
            </table>

            {/* There will be a compulsary event named sleep, that can be edited by user.
                Changing an event only changes that event and future of the same event, not the past.
                So if user changes sleep time for a day, only that day and future days will be affected, past days will remain unchanged.
                This is to allow users to track their sleep patterns over time, even if they make changes to their schedule. */}
            {/* There will be another compulsory event named school, that can be edited by user.
                Changing an event only changes that event and future of the same event, not the past. */}
            {/* There will be a optional event named exercise, that can be added and edited by the user.
                User can place two such events in one day. This can be repeating and non-repeating. */}
            {/* User can add their own events as well, both repeating and none repeating. */}
            {/* In the empty space, scheduler.jsx will be used to add study and revision blocks. */}
          </main>
        </section>
      </div>
    </>
  );
}
