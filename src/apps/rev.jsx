// rev.jsx
import { useEffect, useMemo, useState } from "react";
import "./rev.css";

const STORAGE_KEY = "revTopics";
const MS_DAY = 24 * 60 * 60 * 1000;

const FILTERS = [
  "Focus",
  "Due Now",
  "Overdue",
  "Today",
  "This Week",
  "All",
  "Theory",
  "Numerical",
  "Mixed",
];

const TYPE_OPTIONS = ["Theory", "Numerical", "Mixed"];

const RATINGS = [
  { label: "Forgot", value: 0, emoji: "😭", delta: -18, interval: 0.5 },
  { label: "Hard", value: 1, emoji: "😣", delta: -8, interval: 1 },
  { label: "Medium", value: 2, emoji: "😐", delta: 0, interval: 2 },
  { label: "Easy", value: 3, emoji: "🙂", delta: 8, interval: 4 },
  { label: "Perfect", value: 4, emoji: "😎", delta: 12, interval: 7 },
];

const EMPTY_FORM = {
  topic: "",
  subject: "",
  type: "Theory",
  note: "",
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(value = new Date()) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(value, days) {
  const d = new Date(value);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(value, hours) {
  const d = new Date(value);
  d.setHours(d.getHours() + hours);
  return d;
}

function formatShortDate(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatDue(value) {
  const d = safeDate(value);
  if (!d) return "Today";
  const diffDays = Math.round((startOfDay(d) - startOfDay(new Date())) / MS_DAY);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays <= 6) return `In ${diffDays} days`;
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatInterval(days) {
  if (!Number.isFinite(days)) return "—";
  if (days < 1) return "12h";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function loadTopics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeTopic(item))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeTopic(raw) {
  if (!raw || typeof raw !== "object") return null;

  const topic = String(raw.topic ?? raw.title ?? "").trim();
  if (!topic) return null;

  const subject = String(raw.subject ?? "").trim() || "General";
  const type = TYPE_OPTIONS.includes(raw.type) ? raw.type : "Theory";
  const note = String(raw.note ?? "").trim();

  const createdAt = raw.createdAt || new Date().toISOString();
  const updatedAt = raw.updatedAt || createdAt;
  const lastRevisedAt = raw.lastRevisedAt || null;
  const nextDueAt = raw.nextDueAt || createdAt;

  return {
    id: String(raw.id ?? makeId()),
    topic,
    subject,
    type,
    note,
    confidence: clamp(Number(raw.confidence ?? 35), 0, 100),
    intervalDays: Number.isFinite(Number(raw.intervalDays))
      ? Number(raw.intervalDays)
      : 0,
    streak: Number.isFinite(Number(raw.streak)) ? Number(raw.streak) : 0,
    failures: Number.isFinite(Number(raw.failures)) ? Number(raw.failures) : 0,
    lastResult: String(raw.lastResult ?? ""),
    createdAt,
    updatedAt,
    lastRevisedAt,
    nextDueAt,
    history: Array.isArray(raw.history) ? raw.history : [],
  };
}

function daysUntilDue(topic) {
  const due = safeDate(topic.nextDueAt)?.getTime() ?? Date.now();
  return (due - Date.now()) / MS_DAY;
}

function priorityBand(topic) {
  const d = daysUntilDue(topic);
  const confidence = Number(topic.confidence ?? 35);

  if (d <= 0 || confidence < 45) return "High";
  if (d <= 3 || confidence < 70) return "Medium";
  return "Low";
}

function priorityScore(topic) {
  const d = daysUntilDue(topic);
  const confidence = Number(topic.confidence ?? 35);
  const interval = Number(topic.intervalDays ?? 0);
  const failures = Number(topic.failures ?? 0);
  const streak = Number(topic.streak ?? 0);

  let score = 0;

  if (d <= -3) score += 120 + Math.min(50, Math.abs(d) * 12);
  else if (d <= 0) score += 95 + Math.min(35, Math.abs(d) * 10);
  else if (d <= 1) score += 72;
  else if (d <= 3) score += 48;
  else if (d <= 7) score += 24;

  score += (100 - confidence) * 0.8;
  score += Math.max(0, 8 - interval) * 2.5;
  score += failures * 12;
  score -= streak * 2;
  score += topic.note ? 2 : 0;
  score += Math.min(4, topic.history?.length || 0);

  return score;
}

function stageCopy(type) {
  if (type === "Numerical") {
    return [
      {
        title: "Solve first",
        text: "Pick a medium or hard question and try it without help.",
        cta: "I tried to solve it",
      },
      {
        title: "Retry before checking",
        text: "If you were wrong, solve it again once before seeing the answer.",
        cta: "I retried",
      },
      {
        title: "Rate it",
        text: "Judge how much came back before help.",
        cta: "",
      },
    ];
  }

  if (type === "Mixed") {
    return [
      {
        title: "Recall first",
        text: "Bring back the concept from memory, then move to a medium or hard question.",
        cta: "I started",
      },
      {
        title: "Check and retry",
        text: "Compare, fix mistakes, and try the weak parts again.",
        cta: "I checked",
      },
      {
        title: "Rate it",
        text: "Judge the recall before any help changed it.",
        cta: "",
      },
    ];
  }

  return [
    {
      title: "Recall first",
      text: "Close your notes. Write everything you remember from memory.",
      cta: "I tried to recall it",
    },
    {
      title: "Check the gaps",
      text: "Compare with NCERT or your notes. Mark only what you missed.",
      cta: "I checked",
    },
    {
      title: "Rate it",
      text: "Judge how much came back before any help.",
      cta: "",
    },
  ];
}

export default function Rev() {
  const [topics, setTopics] = useState(() => loadTopics());
  const [activeFilter, setActiveFilter] = useState("Focus");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [showFormNote, setShowFormNote] = useState(false);
  const [draft, setDraft] = useState(EMPTY_FORM);

  const [sessionTopicId, setSessionTopicId] = useState(null);
  const [sessionStep, setSessionStep] = useState(0);
  const [sessionNote, setSessionNote] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    if (selectedId && !topics.some((topic) => topic.id === selectedId)) {
      setSelectedId(null);
    }
  }, [topics, selectedId]);

  useEffect(() => {
    if (sessionTopicId && !topics.some((topic) => topic.id === sessionTopicId)) {
      closeSession();
    }
  }, [topics, sessionTopicId]);

  const selectedTopic = topics.find((topic) => topic.id === selectedId) || null;
  const sessionTopic = topics.find((topic) => topic.id === sessionTopicId) || null;

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase();

    const matchesSearch = (topic) => {
      if (!q) return true;
      const haystack = [
        topic.topic,
        topic.subject,
        topic.type,
        topic.note,
        topic.lastResult,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    };

    const matchesFilter = (topic) => {
      const d = daysUntilDue(topic);
      const dueDate = safeDate(topic.nextDueAt);

      switch (activeFilter) {
        case "Focus":
          return true;
        case "Due Now":
          return d <= 1;
        case "Overdue":
          return d < 0;
        case "Today":
          return dueDate && startOfDay(dueDate).getTime() === startOfDay().getTime();
        case "This Week":
          return d <= 7;
        case "All":
          return true;
        case "Theory":
        case "Numerical":
        case "Mixed":
          return topic.type === activeFilter;
        default:
          return true;
      }
    };

    const list = topics.filter((topic) => matchesSearch(topic) && matchesFilter(topic));
    list.sort((a, b) => priorityScore(b) - priorityScore(a) || a.topic.localeCompare(b.topic));
    return activeFilter === "Focus" ? list.slice(0, 4) : list;
  }, [topics, activeFilter, search]);

  const visibleCount = filteredTopics.length;
  const readyCount = filteredTopics.filter((topic) => daysUntilDue(topic) <= 1).length;
  const totalCount = topics.length;

  function resetForm() {
    setEditingId(null);
    setDraft(EMPTY_FORM);
    setShowFormNote(false);
  }

  function openNewTopic() {
    resetForm();
  }

  function openEditTopic(topic) {
    setEditingId(topic.id);
    setDraft({
      topic: topic.topic,
      subject: topic.subject,
      type: topic.type,
      note: topic.note || "",
    });
    setShowFormNote(Boolean(topic.note));
  }

  function handleSaveTopic(e) {
    e.preventDefault();

    const topicName = draft.topic.trim();
    if (!topicName) return;

    const now = new Date().toISOString();

    setTopics((prev) => {
      if (editingId) {
        return prev.map((topic) =>
          topic.id === editingId
            ? {
                ...topic,
                topic: topicName,
                subject: draft.subject.trim() || "General",
                type: draft.type,
                note: draft.note.trim(),
                updatedAt: now,
              }
            : topic
        );
      }

      const fresh = {
        id: makeId(),
        topic: topicName,
        subject: draft.subject.trim() || "General",
        type: draft.type,
        note: draft.note.trim(),
        confidence: 35,
        intervalDays: 0,
        streak: 0,
        failures: 0,
        lastResult: "",
        createdAt: now,
        updatedAt: now,
        lastRevisedAt: null,
        nextDueAt: now,
        history: [],
      };

      return [fresh, ...prev];
    });

    if (!editingId) {
      setSelectedId(null);
    }

    resetForm();
  }

  function handleDeleteTopic(topicId) {
    setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
    if (selectedId === topicId) setSelectedId(null);
    if (sessionTopicId === topicId) closeSession();
  }

  function startSession(topicId) {
    setSelectedId(topicId);
    setSessionTopicId(topicId);
    setSessionStep(0);
    setSessionNote("");
  }

  function closeSession() {
    setSessionTopicId(null);
    setSessionStep(0);
    setSessionNote("");
  }

  function advanceSession() {
    setSessionStep((prev) => Math.min(2, prev + 1));
  }

  function finishSession(ratingValue) {
    if (!sessionTopic) return;

    const picked = RATINGS.find((item) => item.value === ratingValue);
    const now = new Date();
    const base = Math.max(1, Number(sessionTopic.intervalDays || 1));

    let nextIntervalDays = 1;
    let confidenceDelta = 0;
    let streakDelta = 0;
    let failureDelta = 0;

    switch (ratingValue) {
      case 0:
        nextIntervalDays = 0.5;
        confidenceDelta = -18;
        failureDelta = 1;
        streakDelta = 0;
        break;
      case 1:
        nextIntervalDays = Math.max(1, Math.round(base * 1.1));
        confidenceDelta = -8;
        failureDelta = 1;
        streakDelta = 0;
        break;
      case 2:
        nextIntervalDays = Math.max(2, Math.round(base * 1.8));
        confidenceDelta = 0;
        streakDelta = 1;
        break;
      case 3:
        nextIntervalDays = Math.max(4, Math.round(base * 2.5));
        confidenceDelta = 8;
        streakDelta = 2;
        break;
      case 4:
        nextIntervalDays = Math.max(7, Math.round(base * 3.2));
        confidenceDelta = 12;
        streakDelta = 3;
        break;
      default:
        break;
    }

    const nextDueAt =
      ratingValue === 0 ? addHours(now, 12) : addDays(now, nextIntervalDays);

    const historyEntry = {
      id: makeId(),
      date: now.toISOString(),
      rating: picked?.label || "Medium",
      note: sessionNote.trim(),
      confidenceBefore: sessionTopic.confidence ?? 35,
      confidenceAfter: clamp((sessionTopic.confidence ?? 35) + confidenceDelta, 0, 100),
      intervalDays: nextIntervalDays,
      type: sessionTopic.type,
    };

    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === sessionTopic.id
          ? {
              ...topic,
              confidence: clamp(
                (topic.confidence ?? 35) + confidenceDelta,
                0,
                100
              ),
              intervalDays: nextIntervalDays,
              streak: ratingValue <= 1 ? 0 : (topic.streak ?? 0) + streakDelta,
              failures: (topic.failures ?? 0) + failureDelta,
              lastResult: picked?.label || "Medium",
              lastRevisedAt: now.toISOString(),
              nextDueAt: nextDueAt.toISOString(),
              note: sessionNote.trim() || topic.note,
              updatedAt: now.toISOString(),
              history: [...(topic.history || []), historyEntry],
            }
          : topic
      )
    );

    closeSession();
  }

  const sessionStages = stageCopy(sessionTopic?.type || "Theory");

  const selectedHistory = (selectedTopic?.history || []).slice().reverse().slice(0, 6);

  return (
    <div className="app" id="Rev">
      <aside id="optPanel">
        <div className="revBrand">
          <button className="revCount" type="button" onClick={openNewTopic}>
            {totalCount} topics
          </button>
        </div>

        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={`option ${activeFilter === filter ? "active" : ""}`}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </aside>

      <main id="revMain">
        <header className="revHeader">
          <div className="revHeaderTop">
            <h2>{activeFilter}</h2>
            <div className="revBadges">
              <span className="revBadge">
                {activeFilter === "Focus" ? `${readyCount} ready` : `${visibleCount} shown`}
              </span>
              <span className="revBadge">{totalCount} total</span>
            </div>
          </div>

          <div className="revSearchRow">
            <input
              className="revSearch"
              type="search"
              placeholder="Search topic, subject, note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <section className="revFeed">
          {sessionTopic && (
            <section className="sessionPanel">
              <div className="sessionHead">
                <div>
                  <div className="sessionKicker">Session</div>
                  <h3>{sessionTopic.topic}</h3>
                  <p>
                    {sessionTopic.subject} · {sessionTopic.type}
                  </p>
                </div>
                <button className="sessionClose" type="button" onClick={closeSession}>
                  ×
                </button>
              </div>

              <div className="sessionStepper">
                {sessionStages.map((item, index) => (
                  <span
                    key={item.title}
                    className={`sessionDot ${sessionStep >= index ? "active" : ""}`}
                  />
                ))}
              </div>

              <div className="sessionBody">
                <h4>{sessionStages[sessionStep].title}</h4>
                <p>{sessionStages[sessionStep].text}</p>

                {sessionStep < 2 ? (
                  <button
                    className="sessionPrimary"
                    type="button"
                    onClick={advanceSession}
                  >
                    {sessionStages[sessionStep].cta}
                  </button>
                ) : (
                  <>
                    <div className="sessionRatings">
                      {RATINGS.map((item) => (
                        <button
                          key={item.label}
                          className="ratingBtn"
                          type="button"
                          onClick={() => finishSession(item.value)}
                        >
                          <span className="ratingEmoji">{item.emoji}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="sessionNote"
                      value={sessionNote}
                      onChange={(e) => setSessionNote(e.target.value)}
                      placeholder="Optional note for next time..."
                    />
                  </>
                )}
              </div>
            </section>
          )}

          <section className="revList">
            {filteredTopics.length === 0 ? (
              <div className="emptyState">
                <strong>No topics yet.</strong>
                <span>Add one below to start the queue.</span>
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const selected = selectedId === topic.id;
                const band = priorityBand(topic);
                const bandClass =
                  band === "High" ? "high" : band === "Medium" ? "medium" : "low";
                const confidence = Math.round(topic.confidence ?? 35);

                return (
                  <button
                    key={topic.id}
                    type="button"
                    className={`revTopicCard ${selected ? "active" : ""}`}
                    onClick={() => setSelectedId(topic.id)}
                  >
                    <div className="revTopicMain">
                      <div className="revTopicTop">
                        <span className={`priorityTag ${bandClass}`}>{band}</span>
                        <span className="revArrow">
                          {band === "High" ? "↑" : band === "Medium" ? "—" : "↓"}
                        </span>
                      </div>

                      <h3>{topic.topic}</h3>
                      <div className="revSubject">{topic.subject}</div>

                      <div className="revMeta">
                        <span>Due: {formatDue(topic.nextDueAt)}</span>
                        <span>Last: {formatShortDate(topic.lastRevisedAt)}</span>
                      </div>
                    </div>

                    <div className="revConfidence">
                      <span>{confidence}%</span>
                      <small>Confidence</small>
                    </div>
                  </button>
                );
              })
            )}
          </section>
        </section>

        <form className="revForm" onSubmit={handleSaveTopic}>
          <div className="revFormTop">
            <input
              className="revInput"
              type="text"
              placeholder="Add a topic..."
              value={draft.topic}
              onChange={(e) => setDraft((prev) => ({ ...prev, topic: e.target.value }))}
            />

            <input
              className="revInput"
              type="text"
              placeholder="Subject"
              value={draft.subject}
              onChange={(e) => setDraft((prev) => ({ ...prev, subject: e.target.value }))}
            />

            <button className="revSave" type="submit">
              {editingId ? "Save" : "Add"}
            </button>
          </div>

          <div className="revFormMiddle">
            <div className="typeGroup">
              {TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`typeBtn ${draft.type === type ? "active" : ""}`}
                  onClick={() => setDraft((prev) => ({ ...prev, type }))}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="formTools">
              <button
                className={`toolBtn ${showFormNote ? "active" : ""}`}
                type="button"
                onClick={() => setShowFormNote((prev) => !prev)}
              >
                Note
              </button>

              {editingId && (
                <button className="toolBtn danger" type="button" onClick={resetForm}>
                  New
                </button>
              )}
            </div>
          </div>

          {showFormNote && (
            <textarea
              className="revNote"
              value={draft.note}
              onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Hint / reminder for next time..."
            />
          )}
        </form>
      </main>

      <aside id="revSide">
        <section className="detailCard">
          <div className="detailHead">
            <div>
              <h3>Topic details</h3>
              <p>Everything about the selected topic.</p>
            </div>

            <div className="detailActions">
              <button
                className="detailBtn"
                type="button"
                disabled={!selectedTopic}
                onClick={() => selectedTopic && openEditTopic(selectedTopic)}
              >
                Edit
              </button>
              <button
                className="detailBtn danger"
                type="button"
                disabled={!selectedTopic}
                onClick={() => selectedTopic && handleDeleteTopic(selectedTopic.id)}
              >
                Delete
              </button>
            </div>
          </div>

          {!selectedTopic ? (
            <div className="detailEmpty">
              <strong>No topic selected.</strong>
              <span>Add something or click a topic.</span>
            </div>
          ) : (
            <>
              <div className="detailHero">
                <h2>{selectedTopic.topic}</h2>
                <div className="detailPills">
                  <span className="detailPill">{selectedTopic.subject}</span>
                  <span className="detailPill">{selectedTopic.type}</span>
                </div>

                <button
                  className="detailStart"
                  type="button"
                  onClick={() => startSession(selectedTopic.id)}
                >
                  {sessionTopicId === selectedTopic.id ? "Resume Session" : "Start Revision"}
                </button>
              </div>

              <div className="detailGrid">
                <div className="detailStat">
                  <span>Confidence</span>
                  <strong>{Math.round(selectedTopic.confidence ?? 35)}%</strong>
                </div>
                <div className="detailStat">
                  <span>Interval</span>
                  <strong>{formatInterval(selectedTopic.intervalDays || 0)}</strong>
                </div>
                <div className="detailStat">
                  <span>Next due</span>
                  <strong>{formatDue(selectedTopic.nextDueAt)}</strong>
                </div>
                <div className="detailStat">
                  <span>Revisions</span>
                  <strong>{selectedTopic.history?.length || 0}</strong>
                </div>
              </div>

              {selectedTopic.note && (
                <div className="detailNote">
                  <span>Hint</span>
                  <p>{selectedTopic.note}</p>
                </div>
              )}
            </>
          )}
        </section>

        <section className="historyCard">
          <h3>History</h3>

          {!selectedTopic ? (
            <div className="historyEmpty">Select a topic to view history.</div>
          ) : selectedHistory.length === 0 ? (
            <div className="historyEmpty">No revisions yet.</div>
          ) : (
            <div className="historyList">
              {selectedHistory.map((item) => (
                <div key={item.id} className="historyItem">
                  <div className="historyTop">
                    <strong>{item.rating}</strong>
                    <span>{formatShortDate(item.date)}</span>
                  </div>
                  {item.note ? <p>{item.note}</p> : <p>No note.</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
