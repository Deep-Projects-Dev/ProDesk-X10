# Scheduler.jsx

<!-- Auto Scheduler -->
```
schedule(event, timeStart, timeEnd) {
  fetch event;
  event = {
    id : '',
    title : '',
    emoji : '',
    color : '',
    start : '',
    end : ''
  }

  for i in range(0, number of days) {
    new Event(
      event = {
        id, title, emoji, color,
        start : 'same + i days',
        end : 'same + i days'
      }
    )

    push Event -> Dictionary
  }
}
```



<!-- Manual Scheduler -->
```
schedule(event) {
  fetch Event(
    event = {
      id, title, emoji, color, start, end
    }
  )
  
  push Event -> Dictionary
}
```



<!-- Saving the Event -->
```
autoSave(Dictionary) {
  fetch Dictionary((timeStart, timeEnd) => {
      event1, event2, event3, ...
    }
  )

  push Dictionary -> `stringify()` -> string(timeStart, timeEnd) -> `localStorage`
}
<!-- Load the Event -->
load(timeStart, timeEnd) {
  fetch `localStorage`(
    string(timeStart, timeEnd)
  )

  string -> jsonify -> Dictionary(
    event1, event2, event3, ...
  )

  push Dictionary -> `Cal.jsx` -> Render
}
```