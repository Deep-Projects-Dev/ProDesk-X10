// imports
import { useState, useEffect } from 'react';



// functions

// auto-scheduler
export default function repeat(event, start, days) {
  let d = {} // dictionary of events
  for (let i = 0; i < days; i++) {
    new Event;
    newEvent = {
      id : event[0]?.id,
      title : event[0]?.title,
      emoji : event[0]?.emoji,
      color : event[0]?.color,
      start : event[0]?.start?.setDate(event[0]?.start?.getDate() + i),
      end : event[0]?.end?.setDate(event[0]?.end?.getDate() + i),
    }
  }
}
