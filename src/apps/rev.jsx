import { useEffect, useMemo, useState } from "react";
import "./rev.css";

const STORAGE_KEY = "revTopics";
const DAY = 24 * 60 * 60 * 1000;

const SECTIONS = [
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

const SUBJECTS = ["Maths", "Science", "SST", "English", "Other"];
const TYPES = ["Theory", "Numerical", "Mixed"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const RATINGS = [
  { value: 1, label: "Forgot", emoji: "😭" },
  { value: 2, label: "Hard", emoji: "😵" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Easy", emoji: "🙂" },
  { value: 5, label: "Perfect", emoji: "😎" },
];

const NEW_TOPIC = {
  title: "",
  subject: "Maths",
  type: "Theory",
  difficulty: "Medium",
  note: "",
};

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return String(Date.now() + Math.random());
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function diffDays(a, b) {
  return Math.floor((startOfDay(a) - startOfDay(b)) / DAY);
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShort(value) {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function formatRelative(value) {
  const date = parseDate(value);
  if (!date) return "Not scheduled";
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const days = diffDays(target, today);

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1 && days <= 6) return `In ${days} days`;
  if (days < -1 && days >= -6) return `${Math.abs(days)} days overdue`;
  return formatDate(value);
}

function normalizeDifficulty(value) {
  return DIFFICULTIES.includes(value) ? value : "Medium";
}

function normalizeType(value) {
  return TYPES.includes(value) ? value : "Theory";
}

function normalizeSubject(value) {
  return SUBJECTS.includes(value) ? value : "Other";
}

function initialInterval(difficulty) {
  if (difficulty === "Hard") return 1;
  if (difficulty === "Easy") return 2;
  return 1;
}

function initialMastery(difficulty) {
  if (difficulty === "Hard") return 28;
  if (difficulty === "Easy") return 40;
  return 34;
}

function ratingLabel(value) {
  return RATINGS.find((rating) => rating.value === value)?.label || "Okay";
}

function ratingEmoji(value) {
  return RATINGS.find((rating) => rating.value === value)?.emoji || "🙂";
}

function normalizeHistoryEntry(entry) {
  const rating = Number(entry?.rating) || 3;
  return {
    id: entry?.id || makeId(),
    at: entry?.at || new Date().toISOString(),
    rating,
    ratingLabel: entry?.ratingLabel || ratingLabel(rating),
    recall: entry?.recall || "",
    note: entry?.note || "",
    nextDueAt: entry?.nextDueAt || null,
    intervalDays: Number(entry?.intervalDays) || 1,
    mastery: Number(entry?.mastery) || 0,
    mode: entry?.mode || "Theory",
  };
}

function normalizeTopic(topic) {
  const difficulty = normalizeDifficulty(topic?.difficulty);
  const baseInterval = Number(topic?.intervalDays);
  const nextDueAt = topic?.nextDueAt || new Date().toISOString();

  return {
    id: String(topic?.id || makeId()),
    title: topic?.title?.trim() || "Untitled topic",
    subject: normalizeSubject(topic?.subject),
    type: normalizeType(topic?.type),
    difficulty,
    mastery: clamp(
      Number(topic?.mastery ?? initialMastery(difficulty)),
      0,
      100,
    ),
    intervalDays:
      Number.isFinite(baseInterval) && baseInterval > 0
        ? baseInterval
        : initialInterval(difficulty),
    nextDueAt,
    lastReviewedAt: topic?.lastReviewedAt || null,
    lastRating: Number(topic?.lastRating) || null,
    note: topic?.note || "",
    createdAt: topic?.createdAt || new Date().toISOString(),
    history: Array.isArray(topic?.history)
      ? topic.history.map(normalizeHistoryEntry)
      : [],
  };
}

function loadTopics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeTopic) : [];
  } catch {
    return [];
  }
}

function priorityScore(topic) {
  const now = new Date();
  const dueDate = parseDate(topic.nextDueAt) || now;
  const lastReviewed = parseDate(topic.lastReviewedAt);
  const overdue = Math.max(0, diffDays(now, dueDate));
  const dueSoon = Math.max(0, diffDays(dueDate, now));
  const staleDays = lastReviewed ? Math.max(0, diffDays(now, lastReviewed)) : 21;
  const mastery = clamp(Number(topic.mastery) || 0, 0, 100);

  const typeWeight =
    topic.type === "Numerical" ? 1.16 : topic.type === "Mixed" ? 1.08 : 1;
  const difficultyWeight =
    topic.difficulty === "Hard" ? 1.15 : topic.difficulty === "Easy" ? 0.9 : 1;

  let score =
    overdue * 42 +
    staleDays * 2.2 +
    (100 - mastery) * 0.85 +
    (topic.note ? 4 : 0);

  if (dueSoon === 0) score += 14;
  if (dueSoon <= 2) score += 8;
  if (topic.history.length === 0) score += 18;

  score *= typeWeight * difficultyWeight;
  return Math.round(score);
}

function computeFocusLimit(count) {
  if (count <= 0) return 0;
  if (count <= 3) return count;
  if (count <= 6) return 3;
  if (count <= 10) return 4;
  return 5;
}

function getDueState(topic) {
  const now = new Date();
  const dueDate = parseDate(topic.nextDueAt) || now;
  const delta = diffDays(dueDate, now);

  if (delta < 0) return "Overdue";
  if (delta === 0) return "Today";
  if (delta <= 7) return "This Week";
  return "Later";
}

function visibilityFilter(topic, filter) {
  const state = getDueState(topic);
  switch (filter) {
    case "Focus":
      return true;
    case "Due Now":
      return state === "Overdue" || state === "Today";
    case "Overdue":
      return state === "Overdue";
    case "Today":
      return state === "Today";
    case "This Week":
      return state === "Overdue" || state === "Today" || state === "This Week";
    case "All":
      return true;
    case "Theory":
    case "Numerical":
    case "Mixed":
      return topic.type === filter;
    default:
      return true;
  }
}

function matchesSearch(topic, query) {
  if (!query) return true;
  const haystack = [
    topic.title,
    topic.subject,
    topic.type,
    topic.difficulty,
    topic.note,
    ...(topic.history || []).map(
      (entry) => `${entry.recall} ${entry.note} ${entry.ratingLabel}`,
    ),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function sessionInstruction(topic) {
  if (topic.type === "Numerical") {
    return "Pick one medium/high question, solve without help, then try once more before checking the solution.";
  }
  if (topic.type === "Mixed") {
    return "Do one recall round and one problem round. Only then check what you missed.";
  }
  return "Close the notes first. Write or speak everything you remember, then compare with NCERT/your notes.";
}

function evolveTopic(topic, rating, recallText, sessionNote) {
  const now = new Date();
  const baseInterval = Number(topic.intervalDays) || initialInterval(topic.difficulty);
  const ratingStep =
    {
      1: { mastery: -18, scale: 1.0, floor: 1 },
      2: { mastery: -8, scale: 1.2, floor: 1 },
      3: { mastery: 5, scale: 1.6, floor: 1 },
      4: { mastery: 11, scale: 2.3, floor: 2 },
      5: { mastery: 16, scale: 3.1, floor: 3 },
    }[rating] || { mastery: 0, scale: 1.2, floor: 1 };

  const difficultyBias =
    topic.difficulty === "Hard" ? 0.92 : topic.difficulty === "Easy" ? 1.08 : 1;
  const typeBias =
    topic.type === "Numerical" ? 0.95 : topic.type === "Mixed" ? 1 : 1.05;

  let nextInterval = Math.max(
    ratingStep.floor,
    Math.round(baseInterval * ratingStep.scale * difficultyBias * typeBias),
  );

  if (rating === 1) nextInterval = 1;
  if (rating === 2) nextInterval = Math.max(1, Math.min(nextInterval, baseInterval + 1));

  const mastery = clamp(
    (Number(topic.mastery) || 0) + ratingStep.mastery + (topic.history.length === 0 ? 4 : 0),
    0,
    100,
  );

  const nextDueAt = addDays(now, nextInterval).toISOString();

  const historyEntry = {
    id: makeId(),
    at: now.toISOString(),
    rating,
    ratingLabel: ratingLabel(rating),
    recall: recallText.trim(),
    note: sessionNote.trim(),
    nextDueAt,
    intervalDays: nextInterval,
    mastery,
    mode: topic.type,
  };

  return {
    ...topic,
    mastery,
    intervalDays: nextInterval,
    nextDueAt,
    lastReviewedAt: now.toISOString(),
    lastRating: rating,
    note: sessionNote.trim() || topic.note,
    history: [historyEntry, ...topic.history].slice(0, 20),
  };
}

function buildEmptyEditor() {
  return { ...NEW_TOPIC };
}

export default function Rev() {
  const [topics, setTopics] = useState(() => loadTopics());
  const [filter, setFilter] = useState("Focus");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorId, setEditorId] = useState(null);
  const [editorDraft, setEditorDraft] = useState(buildEmptyEditor());

  const [sessionId, setSessionId] = useState(null);
  const [sessionStep, setSessionStep] = useState("intro");
  const [sessionRecall, setSessionRecall] = useState("");
  const [sessionNote, setSessionNote] = useState("");
  const [sessionRating, setSessionRating] = useState(0);

  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }, [topics]);

  const visibleTopics = useMemo(() => {
    return topics
      .filter((topic) => visibilityFilter(topic, filter))
      .filter((topic) => matchesSearch(topic, search))
      .sort((a, b) => priorityScore(b) - priorityScore(a));
  }, [topics, filter, search]);

  const focusTopics = useMemo(() => {
    const focusCandidates = topics
      .filter((topic) => matchesSearch(topic, search))
      .sort((a, b) => priorityScore(b) - priorityScore(a));

    const limit = computeFocusLimit(focusCandidates.length);
    return focusCandidates.slice(0, limit);
  }, [topics, search]);

  const selectedTopic = useMemo(() => {
    return topics.find((topic) => topic.id === selectedId) || null;
  }, [topics, selectedId]);

  useEffect(() => {
    if (visibleTopics.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }

    if (!selectedId || !visibleTopics.some((topic) => topic.id === selectedId)) {
      setSelectedId(visibleTopics[0].id);
    }
  }, [visibleTopics, selectedId]);

  useEffect(() => {
    setNoteDraft(selectedTopic?.note || "");
  }, [selectedTopic?.id]);

  const sessionTopic = useMemo(() => {
    return topics.find((topic) => topic.id === sessionId) || null;
  }, [topics, sessionId]);

  const activeFilterCount = visibleTopics.length;
  const currentSectionLabel = filter === "Focus" ? "Focus" : filter;

  function openEditor(topic = null) {
    if (topic) {
      setEditorId(topic.id);
      setEditorDraft({
        title: topic.title || "",
        subject: topic.subject || "Maths",
        type: topic.type || "Theory",
        difficulty: topic.difficulty || "Medium",
        note: topic.note || "",
      });
    } else {
      setEditorId(null);
      setEditorDraft(buildEmptyEditor());
    }
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditorId(null);
  }

  function saveEditor(event) {
    event.preventDefault();

    const title = editorDraft.title.trim();
    if (!title) return;

    setTopics((prev) => {
      if (editorId) {
        return prev.map((topic) => {
          if (topic.id !== editorId) return topic;
          return {
            ...topic,
            title,
            subject: editorDraft.subject,
            type: editorDraft.type,
            difficulty: editorDraft.difficulty,
            note: editorDraft.note.trim(),
          };
        });
      }

      const createdAt = new Date().toISOString();
      const nextTopic = normalizeTopic({
        id: makeId(),
        title,
        subject: editorDraft.subject,
        type: editorDraft.type,
        difficulty: editorDraft.difficulty,
        mastery: initialMastery(editorDraft.difficulty),
        intervalDays: initialInterval(editorDraft.difficulty),
        nextDueAt: createdAt,
        lastReviewedAt: null,
        note: editorDraft.note.trim(),
        createdAt,
        history: [],
      });

      return [nextTopic, ...prev];
    });

    closeEditor();
  }

  function deleteTopic(id) {
    const topic = topics.find((item) => item.id === id);
    if (!topic) return;

    const ok = window.confirm(`Delete "${topic.title}"?`);
    if (!ok) return;

    setTopics((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (sessionId === id) {
      setSessionId(null);
      setSessionStep("intro");
      setSessionRecall("");
      setSessionNote("");
      setSessionRating(0);
    }
  }

  function startSession(topic) {
    if (!topic) return;
    setSelectedId(topic.id);
    setSessionId(topic.id);
    setSessionStep("intro");
    setSessionRecall("");
    setSessionNote(topic.note || "");
    setSessionRating(0);
  }

  function closeSession() {
    setSessionId(null);
    setSessionStep("intro");
    setSessionRecall("");
    setSessionNote("");
    setSessionRating(0);
  }

  function finishSession() {
    if (!sessionTopic || !sessionRating) return;

    const evolved = evolveTopic(
      sessionTopic,
      sessionRating,
      sessionRecall,
      sessionNote,
    );

    setTopics((prev) =>
      prev.map((topic) => (topic.id === sessionTopic.id ? evolved : topic)),
    );

    if (evolved.note) setNoteDraft(evolved.note);
    closeSession();
  }

  function saveNote() {
    if (!selectedTopic) return;

    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === selectedTopic.id
          ? { ...topic, note: noteDraft.trim() }
          : topic,
      ),
    );
  }

  const selectedHistory = selectedTopic?.history || [];

  return (
    <div id="Rev" className="app">
      <aside id="optPanel">
        <div className="revSideHead">
          <p className="revEyebrow">Tell Me What, When, Where</p>
          <h2>Revision</h2>
          <p className="revSideSub">Recall first. Read only to repair gaps.</p>
        </div>

        <div className="revSideActions">
          <button className="revAddBtn" type="button" onClick={() => openEditor()}>
            + Add Topic
          </button>
          <span className="revCount">{topics.length} topics</span>
        </div>

        <div className="revFilterGroup">
          {SECTIONS.map((section) => (
            <button
              key={section}
              type="button"
              className={`option ${filter === section ? "active" : ""}`}
              onClick={() => setFilter(section)}
            >
              {section}
            </button>
          ))}
        </div>
      </aside>

      <main id="revMain">
        <div className="revHeader">
          <div className="revTitleBlock">
            <h1>Do this now!</h1>
            <p>
              Try hard first. Check second. Store only what matters.
            </p>
          </div>

          <div className="revSearchWrap">
            <input
              className="revSearch"
              type="search"
              placeholder="Search topic, subject, note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="revGhostBtn"
              type="button"
              onClick={() => setSearch("")}
              disabled={!search}
            >
              Clear
            </button>
          </div>
        </div>

        {sessionTopic ? (
          <section className="revPanel revFocusPanel">
            <div className="revPanelHead">
              <div>
                <h3>Focus Session</h3>
                <p>{sessionInstruction(sessionTopic)}</p>
              </div>
              <div className="revPills">
                <span className="revPill">{sessionTopic.type}</span>
                <span className="revPill">{sessionTopic.difficulty}</span>
                <span className="revPill">{formatRelative(sessionTopic.nextDueAt)}</span>
              </div>
            </div>

            <div className="revSessionCard">
              <div className="revSessionTop">
                <div>
                  <h2>{sessionTopic.title}</h2>
                  <p>{sessionTopic.subject}</p>
                </div>
                <button className="revGhostBtn" type="button" onClick={closeSession}>
                  Stop
                </button>
              </div>

              <div className="revSteps">
                <span className={sessionStep === "intro" ? "step active" : "step"}>1</span>
                <span className={sessionStep === "recall" ? "step active" : "step"}>2</span>
                <span className={sessionStep === "rate" ? "step active" : "step"}>3</span>
                <span className={sessionStep === "note" ? "step active" : "step"}>4</span>
              </div>

              {sessionStep === "intro" && (
                <div className="revSessionBody">
                  <div className="revTipBox">
                    <strong>Rule:</strong> do not peek early.
                    <p>
                      For theory, write everything you remember.
                      For numericals, pick one medium/high question and try again if you fail.
                    </p>
                  </div>

                  <button
                    className="revPrimaryBtn"
                    type="button"
                    onClick={() => setSessionStep("recall")}
                  >
                    Start Recall
                  </button>
                </div>
              )}

              {sessionStep === "recall" && (
                <div className="revSessionBody">
                  <label className="revFieldLabel" htmlFor="revRecall">
                    What did you remember / where did you get stuck?
                  </label>
                  <textarea
                    id="revRecall"
                    className="revTextarea"
                    value={sessionRecall}
                    onChange={(e) => setSessionRecall(e.target.value)}
                    placeholder="Write the gist of what you recalled, or the problem step where you got stuck."
                  />

                  <div className="revSessionActions">
                    <button
                      className="revGhostBtn"
                      type="button"
                      onClick={() => setSessionStep("intro")}
                    >
                      Back
                    </button>
                    <button
                      className="revPrimaryBtn"
                      type="button"
                      onClick={() => setSessionStep("rate")}
                    >
                      I checked / retried
                    </button>
                  </div>
                </div>
              )}

              {sessionStep === "rate" && (
                <div className="revSessionBody">
                  <p className="revQuestion">How did it go after checking?</p>
                  <div className="revRatingRow">
                    {RATINGS.map((rating) => (
                      <button
                        key={rating.value}
                        type="button"
                        className={`revRatingBtn ${
                          sessionRating === rating.value ? "active" : ""
                        }`}
                        onClick={() => {
                          setSessionRating(rating.value);
                          setSessionStep("note");
                        }}
                      >
                        <span>{rating.emoji}</span>
                        <strong>{rating.label}</strong>
                      </button>
                    ))}
                  </div>
                  <div className="revSessionActions">
                    <button
                      className="revGhostBtn"
                      type="button"
                      onClick={() => setSessionStep("recall")}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {sessionStep === "note" && (
                <div className="revSessionBody">
                  <label className="revFieldLabel" htmlFor="revNote">
                    Optional note / hint for next time
                  </label>
                  <textarea
                    id="revNote"
                    className="revTextarea"
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    placeholder="Example: weak on diagrams, revise examples first, or medium-high questions only."
                  />
                  <div className="revSessionActions">
                    <button
                      className="revGhostBtn"
                      type="button"
                      onClick={() => setSessionStep("rate")}
                    >
                      Back
                    </button>
                    <button
                      className="revPrimaryBtn"
                      type="button"
                      onClick={finishSession}
                      disabled={!sessionRating}
                    >
                      Complete Revision
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="revPanel revFocusPanel">
              <div className="revPanelHead">
                <div>
                  <h3>Focus</h3>
                  <p>Top priority topics. Do these now.</p>
                </div>
                <div className="revPills">
                  <span className="revPill">{focusTopics.length} ready</span>
                  <span className="revPill">{topics.length} total</span>
                </div>
              </div>

              <div className="revCardList">
                {focusTopics.length > 0 ? (
                  focusTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      className={`revTopicCard ${
                        selectedTopic?.id === topic.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedId(topic.id)}
                    >
                      <div className="revTopicTop">
                        <div>
                          <h4>{topic.title}</h4>
                          <p>
                            {topic.subject} • {topic.type} • {topic.difficulty}
                          </p>
                        </div>
                        <span className="revBadge">{formatRelative(topic.nextDueAt)}</span>
                      </div>
                      <div className="revTopicMeta">
                        <span>Mastery {Math.round(topic.mastery)}%</span>
                        <span>Next {formatShort(topic.nextDueAt)}</span>
                        <span>{topic.history.length} sessions</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="revEmptyState">
                    <h4>No priority topics.</h4>
                    <p>Add a topic to start the queue.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="revPanel revQueuePanel">
              <div className="revPanelHead">
                <div>
                  <h3>{currentSectionLabel}</h3>
                  <p>{activeFilterCount} topics visible</p>
                </div>
                <div className="revPills">
                  <span className="revPill">Search aware</span>
                  <span className="revPill">Adaptive</span>
                </div>
              </div>

              <div className="revQueueGrid">
                {visibleTopics.length > 0 ? (
                  visibleTopics.map((topic) => {
                    const dueState = getDueState(topic);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        className={`revQueueCard ${
                          selectedTopic?.id === topic.id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedId(topic.id)}
                      >
                        <div className="revTopicTop">
                          <div>
                            <h4>{topic.title}</h4>
                            <p>
                              {topic.subject} • {topic.type} • {topic.difficulty}
                            </p>
                          </div>
                          <span className={`revBadge state-${dueState.replace(/\s/g, "")}`}>
                            {dueState}
                          </span>
                        </div>
                        <div className="revTopicMeta">
                          <span>Mastery {Math.round(topic.mastery)}%</span>
                          <span>Interval {topic.intervalDays}d</span>
                          <span>{formatRelative(topic.nextDueAt)}</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="revEmptyState">
                    <h4>No topics here.</h4>
                    <p>Try another filter or search term.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <aside id="revSide">
        <section className="revPanel revSidePanel">
          <div className="revPanelHead side">
            <div>
              <h3>{selectedTopic ? selectedTopic.title : "Topic details"}</h3>
              <p>{selectedTopic ? "Everything about the topic" : "Select a topic to inspect it."}</p>
            </div>
            <div className="revSideButtons">
              <button
                className="revGhostBtn"
                type="button"
                onClick={() => openEditor(selectedTopic)}
                disabled={!selectedTopic}
              >
                Edit
              </button>
              <button
                className="revGhostBtn danger"
                type="button"
                onClick={() => deleteTopic(selectedTopic?.id)}
                disabled={!selectedTopic}
              >
                Delete
              </button>
            </div>
          </div>

          {selectedTopic ? (
            <>
              <div className="revDetailGrid">
                <div className="revDetailItem">
                  <span>Subject</span>
                  <strong>{selectedTopic.subject}</strong>
                </div>
                <div className="revDetailItem">
                  <span>Type</span>
                  <strong>{selectedTopic.type}</strong>
                </div>
                <div className="revDetailItem">
                  <span>Difficulty</span>
                  <strong>{selectedTopic.difficulty}</strong>
                </div>
                <div className="revDetailItem">
                  <span>Mastery</span>
                  <strong>{Math.round(selectedTopic.mastery)}%</strong>
                </div>
                <div className="revDetailItem">
                  <span>Last revised</span>
                  <strong>
                    {selectedTopic.lastReviewedAt ? formatDate(selectedTopic.lastReviewedAt) : "Never"}
                  </strong>
                </div>
                <div className="revDetailItem">
                  <span>Next due</span>
                  <strong>{formatRelative(selectedTopic.nextDueAt)}</strong>
                </div>
              </div>

              <div className="revNoteBlock">
                <div className="revNoteHead">
                  <h4>Note for next time</h4>
                  <span className="revSmallHint">Optional hint / memory cue</span>
                </div>
                <textarea
                  className="revTextarea compact"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Example: weak at diagrams, revise examples first, or solve medium questions before hard."
                />
                <div className="revSessionActions">
                  <button className="revGhostBtn" type="button" onClick={() => setNoteDraft(selectedTopic.note || "")}>
                    Reset
                  </button>
                  <button className="revPrimaryBtn" type="button" onClick={saveNote}>
                    Save Note
                  </button>
                </div>
              </div>

              <div className="revHistoryBlock">
                <div className="revNoteHead">
                  <h4>History</h4>
                  <span className="revSmallHint">{selectedHistory.length} entries</span>
                </div>

                <div className="revHistoryList">
                  {selectedHistory.length > 0 ? (
                    selectedHistory.map((entry) => (
                      <div key={entry.id} className="revHistoryItem">
                        <div className="revHistoryTop">
                          <strong>
                            {ratingEmoji(entry.rating)} {entry.ratingLabel}
                          </strong>
                          <span>{formatDate(entry.at)}</span>
                        </div>
                        <p>
                          Next due: {formatRelative(entry.nextDueAt)} • Interval {entry.intervalDays}d • Mastery {Math.round(entry.mastery)}%
                        </p>
                        {(entry.recall || entry.note) && (
                          <div className="revHistoryNote">
                            {entry.recall && <p><strong>Recall:</strong> {entry.recall}</p>}
                            {entry.note && <p><strong>Note:</strong> {entry.note}</p>}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="revEmptyState small">
                      <h4>No history yet.</h4>
                      <p>Run one revision session to begin the timeline.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="revPrimaryStrip">
                <button
                  className="revPrimaryBtn wide"
                  type="button"
                  onClick={() => startSession(selectedTopic)}
                >
                  Start Revision
                </button>
              </div>
            </>
          ) : (
            <div className="revEmptyState large">
              <h4>No topic selected.</h4>
              <p>Add something. Then the app can start thinking for you.</p>
            </div>
          )}
        </section>
      </aside>

      {editorOpen && (
        <div className="revModalBackdrop" onClick={closeEditor}>
          <form
            className="revModal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveEditor}
          >
            <div className="revModalHead">
              <div>
                <h3>{editorId ? "Edit Topic" : "Add Topic"}</h3>
                <p>One topic only. No book chapters. No clutter.</p>
              </div>
              <button type="button" className="revGhostBtn" onClick={closeEditor}>
                Close
              </button>
            </div>

            <label className="revFieldLabel">
              Topic name
              <input
                className="revInput"
                value={editorDraft.title}
                onChange={(e) => setEditorDraft((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="E.g. Trigonometry"
              />
            </label>

            <div className="revFormGrid">
              <label className="revFieldLabel">
                Subject
                <select
                  className="revInput"
                  value={editorDraft.subject}
                  onChange={(e) => setEditorDraft((prev) => ({ ...prev, subject: e.target.value }))}
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>

              <label className="revFieldLabel">
                Type
                <select
                  className="revInput"
                  value={editorDraft.type}
                  onChange={(e) => setEditorDraft((prev) => ({ ...prev, type: e.target.value }))}
                >
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="revFieldLabel">
                Difficulty
                <select
                  className="revInput"
                  value={editorDraft.difficulty}
                  onChange={(e) => setEditorDraft((prev) => ({ ...prev, difficulty: e.target.value }))}
                >
                  {DIFFICULTIES.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </label>

              <label className="revFieldLabel">
                Short note / hint
                <input
                  className="revInput"
                  value={editorDraft.note}
                  onChange={(e) => setEditorDraft((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Optional cue for next time"
                />
              </label>
            </div>

            <div className="revModalActions">
              <button type="button" className="revGhostBtn" onClick={closeEditor}>
                Cancel
              </button>
              <button type="submit" className="revPrimaryBtn">
                Save Topic
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
