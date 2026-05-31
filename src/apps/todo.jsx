import { useEffect, useRef, useState } from "react";
import "./todo.css";

const loadStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const formatDate = (value) => {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

const formatClock = (seconds) => {
  const sign = seconds < 0 ? "-" : "";
  const absSeconds = Math.abs(seconds);
  const minutes = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  return `${sign}${minutes}:${String(secs).padStart(2, "0")}`;
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

const urgencyValue = {
  No: 0,
  Low: 1,
  Medium: 2,
  High: 3,
};

const taskPriorityScore = (task) => {
  const urgency = urgencyValue[task.urgency] ?? 0;
  const important = task.important ? 1 : 0;

  const createdAt = Number(new Date(task.dateCreated));
  const ageDays = createdAt
    ? Math.min(
        3,
        Math.max(
          0,
          Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24)),
        ),
      )
    : 0;

  let daysLeft = 15;
  if (task.dateDue) {
    const dueAt = Number(new Date(task.dateDue));
    if (!Number.isNaN(dueAt)) {
      daysLeft = Math.min(
        15,
        Math.max(0, Math.ceil((dueAt - Date.now()) / (1000 * 60 * 60 * 24))),
      );
    }
  }

  return urgency + important + ageDays - 0.5 * daysLeft;
};

export default function Todo() {
  const [tasks, setTasks] = useState(() => loadStorage("todoTasks", []));
  const [filter, setFilter] = useState("Flow");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState({});

  const [newTask, setNewTask] = useState({
    task: "",
    description: "",
    urgency: "No",
    important: false,
    dateDue: "",
  });

  const [showDescription, setShowDescription] = useState(false);

  const [pomodoro, setPomodoro] = useState(() =>
    loadStorage("todoPomodoro", {
      activeSession: null,
      isRunning: false,
      mode: "work",
      targetSeconds: 3600,
      lastUpdatedAt: new Date().toISOString(),
    }),
  );

  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("todoPomodoro", JSON.stringify(pomodoro));
  }, [pomodoro]);

  useEffect(() => {
    if (!pomodoro.isRunning || !pomodoro.activeSession) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setPomodoro((prev) => {
        if (!prev.activeSession || !prev.isRunning) return prev;
        const now = Date.now();
        const last = prev.lastUpdatedAt
          ? new Date(prev.lastUpdatedAt).getTime()
          : now;
        const delta = Math.max(1, Math.round((now - last) / 1000));

        return {
          ...prev,
          activeSession: {
            ...prev.activeSession,
            workSeconds:
              prev.mode === "work"
                ? prev.activeSession.workSeconds + delta
                : prev.activeSession.workSeconds,
            breakSeconds:
              prev.mode === "break"
                ? prev.activeSession.breakSeconds + delta
                : prev.activeSession.breakSeconds,
          },
          lastUpdatedAt: new Date().toISOString(),
        };
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [pomodoro.isRunning]);

  const filteredTasks = (() => {
    if (filter === "Completed") return tasks.filter((task) => task.completed);
    if (filter === "High Priority")
      return tasks.filter((task) => task.urgency === "High");
    if (filter === "Medium Priority")
      return tasks.filter((task) => task.urgency === "Medium");
    if (filter === "Low Priority")
      return tasks.filter((task) => task.urgency === "Low");
    if (filter === "Today")
      return tasks.filter(
        (task) =>
          task.dateDue &&
          new Date(task.dateDue).toDateString() === new Date().toDateString(),
      );

    if (filter === "Flow") {
      return tasks
        .filter((task) => !task.completed)
        .sort((a, b) => taskPriorityScore(b) - taskPriorityScore(a))
        .slice(0, 3);
    }

    return tasks;
  })();

  const currentTask =
    tasks.find((task) => task.id === selectedTaskId) ||
    tasks.find((task) => task.id === pomodoro.activeSession?.taskId);

  const currentPhaseSeconds = pomodoro.activeSession
    ? pomodoro.mode === "work"
      ? pomodoro.activeSession.workSeconds
      : pomodoro.activeSession.breakSeconds
    : 0;

  const progressPercentage = pomodoro.activeSession
    ? Math.min(100, (currentPhaseSeconds / pomodoro.targetSeconds) * 100)
    : 0;

  const handleAddTask = () => {
    if (!newTask.task.trim()) return;

    const taskEntry = {
      id: Date.now(),
      task: newTask.task.trim(),
      description: newTask.description.trim(),
      urgency: newTask.urgency,
      important: newTask.important,
      dateCreated: new Date().toISOString(),
      dateDue: newTask.dateDue || "",
      completed: false,
      pomodoroHistory: [],
    };

    setTasks((prev) => [taskEntry, ...prev]);
    setSelectedTaskId(taskEntry.id);
    setNewTask({
      task: "",
      description: "",
      urgency: "No",
      important: false,
      dateDue: "",
    });
    setShowDescription(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleAddTask();
    }
  };

  const startPomodoro = (taskId) => {
    const targetTaskId = taskId || selectedTaskId;
    if (!targetTaskId) return;

    if (
      pomodoro.activeSession &&
      pomodoro.activeSession.taskId === targetTaskId &&
      !pomodoro.isRunning
    ) {
      setPomodoro((prev) => ({
        ...prev,
        isRunning: true,
        lastUpdatedAt: new Date().toISOString(),
      }));
      return;
    }

    if (
      pomodoro.activeSession &&
      pomodoro.activeSession.taskId !== targetTaskId &&
      pomodoro.isRunning
    ) {
      return;
    }

    setSelectedTaskId(targetTaskId);
    setPomodoro({
      activeSession: {
        id: Date.now(),
        taskId: targetTaskId,
        startedAt: new Date().toISOString(),
        workSeconds: 0,
        breakSeconds: 0,
        breakCount: 0,
      },
      isRunning: true,
      mode: "work",
      targetSeconds: 3600,
      lastUpdatedAt: new Date().toISOString(),
    });
  };

  const startBreak = () => {
    if (!pomodoro.activeSession || pomodoro.mode !== "work") return;
    setPomodoro((prev) => ({
      ...prev,
      mode: "break",
      targetSeconds: 900,
      elapsed: 0,
      lastUpdatedAt: new Date().toISOString(),
    }));
  };

  const endBreak = () => {
    if (!pomodoro.activeSession || pomodoro.mode !== "break") return;
    setPomodoro((prev) => ({
      ...prev,
      mode: "work",
      targetSeconds: 3600,
      lastUpdatedAt: new Date().toISOString(),
      activeSession: {
        ...prev.activeSession,
        breakCount: prev.activeSession.breakCount + 1,
      },
    }));
  };

  const stopPomodoro = () => {
    if (!pomodoro.activeSession) return;

    const finalBreakCount =
      pomodoro.mode === "break"
        ? pomodoro.activeSession.breakCount + 1
        : pomodoro.activeSession.breakCount;

    const finalRecord = {
      id: pomodoro.activeSession.id,
      startedAt: pomodoro.activeSession.startedAt,
      endedAt: new Date().toISOString(),
      totalWorkSeconds: pomodoro.activeSession.workSeconds,
      totalBreakSeconds: pomodoro.activeSession.breakSeconds,
      breakCount: finalBreakCount,
    };

    setTasks((prev) =>
      prev.map((task) =>
        task.id === pomodoro.activeSession.taskId
          ? {
              ...task,
              pomodoroHistory: [...(task.pomodoroHistory || []), finalRecord],
            }
          : task,
      ),
    );

    setPomodoro({
      activeSession: null,
      isRunning: false,
      mode: "work",
      targetSeconds: 3600,
      lastUpdatedAt: new Date().toISOString(),
    });
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const toggleDetails = (taskId) => {
    setDetailsOpen((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div id="todo" className="app">
      <aside id="optPanel">
        {[
          "Flow",
          "All",
          "Completed",
          "High Priority",
          "Medium Priority",
          "Low Priority",
          "Today",
        ].map((option) => (
          <button
            key={option}
            className={`option ${filter === option ? "active" : ""}`}
            onClick={() => setFilter(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </aside>

      <main id="tasks">
        <section className="task-header">
          <div>
            <h2>{filter === "Flow" ? "Do this now!":filter}</h2>
          </div>
          <div className="task-count">
            {filteredTasks.length} task{filteredTasks.length === 1 ? "" : "s"}
          </div>
        </section>

        <section className="task-list">
          {filteredTasks.length === 0 && (
            <div className="empty-state">No tasks available.</div>
          )}

          {filteredTasks.map((task) => {
            const isRunning =
              pomodoro.activeSession?.taskId === task.id && pomodoro.isRunning;
            const disableStart =
              pomodoro.activeSession &&
              pomodoro.activeSession.taskId !== task.id &&
              pomodoro.isRunning;

            return (
              <article
                key={task.id}
                className={`task-card ${
                  selectedTaskId === task.id ? "selected" : ""
                } ${task.completed ? "completed-task" : ""}`}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <div className="task-top">
                  <div className="task-title-row">
                    <span className="pomodoro-count">
                      {task.pomodoroHistory?.length || 0}
                    </span>
                    <h3>{task.task}</h3>
                  </div>
                  <span
                    className={`urgency-tag urgency-${task.urgency.toLowerCase()}`}
                  >
                    {task.urgency}
                  </span>
                </div>

                <div className="task-actions">
                  <button
                    className="button secondary"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleDetails(task.id);
                    }}
                  >
                    ?
                  </button>
                  <button
                    className="button primary"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      startPomodoro(task.id);
                    }}
                    disabled={disableStart}
                  >
                    {isRunning ? "Running" : "Start"}
                  </button>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleTaskCompletion(task.id);
                    }}
                  >
                    {task.completed ? "Uncheck" : "Complete"}
                  </button>
                  <button
                    className="button danger"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteTask(task.id);
                    }}
                  >
                    Delete
                  </button>
                </div>

                {detailsOpen[task.id] && (
                  <div className="task-details">
                    <p>{task.description || "No description"}</p>
                    <div className="task-details-meta">
                      <span>Due: {formatDate(task.dateDue)}</span>
                      <span>Created: {formatDate(task.dateCreated)}</span>
                      <span>Important: {task.important ? "Yes" : "No"}</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <section className="task-form">
          <div className="form-options">
            <select
              value={newTask.urgency}
              onChange={(event) =>
                setNewTask({ ...newTask, urgency: event.target.value })
              }
              className="small-select"
            >
              <option>No Priority</option>
              <option>High Priority</option>
              <option>Medium Priority</option>
              <option>Low Priority</option>
            </select>
            <label className="small-checkbox">
              <input
                type="checkbox"
                checked={newTask.important}
                onChange={(event) =>
                  setNewTask({ ...newTask, important: event.target.checked })
                }
              />
              Important
            </label>
            <input
              type="date"
              value={newTask.dateDue}
              onChange={(event) =>
                setNewTask({ ...newTask, dateDue: event.target.value })
              }
              className="small-input"
            />
            <button
              type="button"
              className="small-button"
              onClick={() => setShowDescription(!showDescription)}
            >
              Description
            </button>
          </div>
          {showDescription && (
            <textarea
              value={newTask.description}
              onChange={(event) =>
                setNewTask({ ...newTask, description: event.target.value })
              }
              placeholder="Description"
              className="description-textarea"
            />
          )}
          <div className="input-row">
            <input
              value={newTask.task}
              onChange={(event) =>
                setNewTask({ ...newTask, task: event.target.value })
              }
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              type="text"
              className="task-input"
            />
            <button
              className="button primary add-button"
              type="button"
              onClick={handleAddTask}
            >
              Add
            </button>
          </div>
        </section>
      </main>

      <aside id="overview">
        <div className="overview-top">
          <h1>Pomodoro</h1>
          <p>
            {currentTask
              ? `Selected: ${currentTask.task}`
              : "Select a task to start a session."}
          </p>
        </div>

        <div className="timer-card">
          <div className="timer-status">
            <span>
              {pomodoro.mode === "work" ? "Work session" : "Short break"}
            </span>
            <span>{pomodoro.isRunning ? "Running" : "Paused"}</span>
          </div>

          <div className="timer-value">{formatClock(currentPhaseSeconds)}</div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="timer-footer">
            <span>
              Target: {pomodoro.targetSeconds === 3600 ? "60:00" : "15:00"}
            </span>
            {currentPhaseSeconds > pomodoro.targetSeconds && (
              <span>
                Overtime:{" "}
                {formatClock(currentPhaseSeconds - pomodoro.targetSeconds)}
              </span>
            )}
          </div>

          <div className="overview-actions">
            <button
              className="button primary"
              type="button"
              onClick={() => startPomodoro(currentTask?.id)}
              disabled={
                !currentTask ||
                (pomodoro.activeSession &&
                  pomodoro.activeSession.taskId !== currentTask.id &&
                  pomodoro.isRunning)
              }
            >
              {pomodoro.isRunning ? "Resume" : "Start"}
            </button>
            <button
              className="button"
              type="button"
              onClick={stopPomodoro}
              disabled={!pomodoro.activeSession}
            >
              Stop
            </button>
            {pomodoro.mode === "work" ? (
              <button
                className="button secondary"
                type="button"
                onClick={startBreak}
                disabled={!pomodoro.activeSession || !pomodoro.isRunning}
              >
                Start Break
              </button>
            ) : (
              <button
                className="button secondary"
                type="button"
                onClick={endBreak}
                disabled={!pomodoro.activeSession || !pomodoro.isRunning}
              >
                End Break
              </button>
            )}
          </div>

          <div className="break-summary">
            <span>Breaks: {pomodoro.activeSession?.breakCount ?? 0}</span>
            <span>
              Break time:{" "}
              {formatDuration(pomodoro.activeSession?.breakSeconds ?? 0)}
            </span>
          </div>
        </div>

        <div className="history-card">
          <h2>History</h2>
          {!currentTask && <p>Select a task to view history.</p>}
          {currentTask && currentTask.pomodoroHistory?.length === 0 && (
            <p>No completed sessions yet.</p>
          )}
          {currentTask?.pomodoroHistory
            ?.slice()
            .reverse()
            .slice(0, 4)
            .map((session) => (
              <div key={session.id} className="history-item">
                <div>
                  <strong>{formatDate(session.startedAt)}</strong>
                  <span>Work {formatDuration(session.totalWorkSeconds)}</span>
                </div>
                <div>
                  <span>Breaks {session.breakCount}</span>
                  <span>{formatDuration(session.totalBreakSeconds)}</span>
                </div>
              </div>
            ))}
        </div>
      </aside>
    </div>
  );
}
