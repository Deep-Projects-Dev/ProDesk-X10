// imports
import { useState, useEffect } from 'react';
import './Cal.css';

// calendar imports
// import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
// import { format, parse, startOfWeek, getDay } from 'date-fns';
// import 'react-big-calendar/lib/css/react-big-calendar.css';

// function
export default function Cal() {
  const currentDate = 123;
  return (
    <>
    <aside id="calPanel">
      <h1>{currentDate}</h1> {/* Write date in MM YYYY format */}
      {/* Add a small month calendar here, with the current date highlighted */}
    </aside>
    <section id="mainCal">
      <div id="cal">
        {/* These switch are to be centered horizontally */}
        <button className="calMode">Week</button>
        <button className="calMode">Month</button>

        {/* These should stick to right corner */}
        <button className="move">←</button>
        <button className="move">→</button>
      </div>
      <main id="calendar">
        {/* This is the main calendar area, where the week or month view will be displayed based on the selected mode */}

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
    </>
  )
}