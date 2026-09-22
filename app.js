
const STORAGE_KEY = "study-os-v01";


// ============================================================
// DEFAULT DATA
// ============================================================

const DEFAULT_DATA = {

  tasks: [

    {
      id: 1,
      name: "Review COM prerequisites",
      subject: "Physics",
      minutes: 45,
      done: false
    },

    {
      id: 2,
      name: "Equilibrium — connect Kc and Qc",
      subject: "Chemistry",
      minutes: 60,
      done: false
    },

    {
      id: 3,
      name: "P&C practice",
      subject: "Maths",
      minutes: 45,
      done: false
    },

    {
      id: 4,
      name: "Learn Arduino variables",
      subject: "Arduino",
      minutes: 30,
      done: false
    }

  ],


  subjects: [

    {
      id: 1,
      name: "Physics",
      progress: 68
    },

    {
      id: 2,
      name: "Chemistry",
      progress: 57
    },

    {
      id: 3,
      name: "Maths",
      progress: 49
    },

    {
      id: 4,
      name: "English",
      progress: 45
    }

  ],


  quests: [

    {
      id: 1,
      name: "Arduino temperature sensor",
      type: "Build",
      progress: 60
    },

    {
      id: 2,
      name: "University research",
      type: "Exploration",
      progress: 25
    },

    {
      id: 3,
      name: "Research rabbit hole",
      type: "Exploration",
      progress: 20
    }

  ],


  sessions: []

};


// ============================================================
// STATE
// ============================================================

let state = loadData();

let currentPage = "dashboard";


function loadData() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {

      return JSON.parse(saved);

    }

  }

  catch (error) {

    console.error(
      "Could not load saved data.",
      error
    );

  }


  return structuredClone(DEFAULT_DATA);
}


function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}


function newId() {

  return Date.now() +
    Math.floor(Math.random() * 10000);

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function today() {

  return new Date()
    .toISOString()
    .slice(0, 10);

}


// ============================================================
// CALCULATIONS
// ============================================================

function totalMinutes() {

  return state.sessions.reduce(
    (total, session) =>
      total + Number(session.minutes || 0),
    0
  );

}


function totalQuestions() {

  return state.sessions.reduce(
    (total, session) =>
      total + Number(session.questions || 0),
    0
  );

}


function accuracy() {

  let attempted = 0;
  let correct = 0;

  for (const session of state.sessions) {

    attempted +=
      Number(session.questions || 0);

    correct +=
      Number(session.correct || 0);

  }

  if (attempted === 0) {
    return null;
  }

  return Math.round(
    correct / attempted * 100
  );

}


function formatDate(date) {

  return new Date(
    date + "T12:00:00"
  ).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}


// ============================================================
// DOM
// ============================================================

const content =
  document.getElementById("content");

const modal =
  document.getElementById("modal");

const modalTitle =
  document.getElementById("modalTitle");

const modalBody =
  document.getElementById("modalBody");


// ============================================================
// PAGE RENDERING
// ============================================================

function render() {

  document.getElementById(
    "dateLabel"
  ).textContent =
    new Date().toLocaleDateString(
      undefined,
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );


  const titles = {

    dashboard: "Dashboard",

    tasks: "Tasks",

    subjects: "Subjects",

    quests: "Side Quests",

    sessions: "Study Log"

  };


  document.getElementById(
    "pageTitle"
  ).textContent =
    titles[currentPage];


  document
    .querySelectorAll(".nav")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page === currentPage
      );

    });


  if (currentPage === "dashboard") {

    renderDashboard();

  }

  else if (currentPage === "tasks") {

    renderTasks();

  }

  else if (currentPage === "subjects") {

    renderSubjects();

  }

  else if (currentPage === "quests") {

    renderQuests();

  }

  else if (currentPage === "sessions") {

    renderSessions();

  }

}


// ============================================================
// DASHBOARD
// ============================================================

function renderDashboard() {

  const completed =
    state.tasks.filter(
      task => task.done
    ).length;


  const hours =
    (totalMinutes() / 60).toFixed(1);


  const acc =
    accuracy();


  content.innerHTML = `

    <div class="grid stats">

      <div class="card">

        <div class="stat-label">
          Today's tasks
        </div>

        <div class="stat-value">
          ${completed}/${state.tasks.length}
        </div>

        <div class="stat-sub">
          ${state.tasks.length - completed}
          remaining
        </div>

      </div>


      <div class="card">

        <div class="stat-label">
          Focused time
        </div>

        <div class="stat-value">
          ${hours}h
        </div>

        <div class="stat-sub">
          logged
        </div>

      </div>


      <div class="card">

        <div class="stat-label">
          Questions
        </div>

        <div class="stat-value">
          ${totalQuestions()}
        </div>

        <div class="stat-sub">
          ${acc === null
            ? "no accuracy yet"
            : acc + "% accuracy"}
        </div>

      </div>


      <div class="card">

        <div class="stat-label">
          Side quests
        </div>

        <div class="stat-value">
          ${state.quests.length}
        </div>

        <div class="stat-sub">
          projects in progress
        </div>

      </div>

    </div>


    <div class="grid two section">

      <div class="card">

        <div class="card-header">

          <h2>
            Today's work
          </h2>

          <button
            class="secondary"
            id="dashboardAddTask"
          >
            + task
          </button>

        </div>


        ${
          state.tasks.length

            ? state.tasks
                .map(taskHTML)
                .join("")

            : `
              <div class="empty">
                Nothing scheduled.
              </div>
            `
        }

      </div>


      <div class="card">

        <div class="card-header">

          <h2>
            Academic progress
          </h2>

        </div>


        ${
          state.subjects
            .map(subjectHTML)
            .join("")
        }

      </div>

    </div>


    <div class="grid two section">

      <div class="card">

        <div class="card-header">

          <h2>
            Active side quests
          </h2>

        </div>


        ${
          state.quests
            .filter(q => q.progress < 100)
            .map(questHTML)
            .join("")
        }

      </div>


      <div class="card">

        <div class="card-header">

          <h2>
            Actual progress
          </h2>

        </div>


        <div class="subject-meta">

          <span class="muted">
            Study sessions
          </span>

          <strong>
            ${state.sessions.length}
          </strong>

        </div>


        <div class="subject-meta">

          <span class="muted">
            Focused hours
          </span>

          <strong>
            ${hours}
          </strong>

        </div>


        <div class="subject-meta">

          <span class="muted">
            Questions solved
          </span>

          <strong>
            ${totalQuestions()}
          </strong>

        </div>


        <div class="subject-meta">

          <span class="muted">
            Accuracy
          </span>

          <strong>
            ${acc === null ? "—" : acc + "%"}
          </strong>

        </div>

      </div>

    </div>

  `;


  bindDashboard();

}


// ============================================================
// TASK HTML
// ============================================================

function taskHTML(task) {

  return `

    <div
      class="task ${task.done ? "done" : ""}"
    >

      <input
        class="task-check"
        type="checkbox"
        data-task="${task.id}"
        ${task.done ? "checked" : ""}
      >


      <div class="task-main">

        <div class="task-name">

          ${escapeHTML(task.name)}

        </div>

        <div class="task-meta">

          ${escapeHTML(task.subject)}
          ·
          ${task.minutes} min

        </div>

      </div>


      <button
        class="secondary"
        data-task-log="${task.id}"
      >
        log
      </button>


      <button
        class="secondary"
        data-task-delete="${task.id}"
      >
        ×
      </button>

    </div>

  `;

}


// ============================================================
// SUBJECT HTML
// ============================================================

function subjectHTML(subject) {

  const progress =
    Math.max(
      0,
      Math.min(
        100,
        Number(subject.progress) || 0
      )
    );


  return `

    <div class="subject">

      <div class="subject-meta">

        <span>
          ${escapeHTML(subject.name)}
        </span>

        <span>
          ${progress}%
        </span>

      </div>


      <div class="progress">

        <span
          style="width:${progress}%"
        ></span>

      </div>

    </div>

  `;

}


// ============================================================
// QUEST HTML
// ============================================================

function questHTML(quest) {

  return `

    <div class="quest">

      <div class="quest-top">

        <div>

          <div class="quest-title">

            ${escapeHTML(quest.name)}

          </div>

          <div class="quest-type">

            ${escapeHTML(quest.type)}

          </div>

        </div>


        <strong>
          ${quest.progress}%
        </strong>

      </div>


      <div class="progress quest-progress">

        <span
          style="width:${quest.progress}%"
        ></span>

      </div>

    </div>

  `;

}


// ============================================================
// TASK PAGE
// ============================================================

function renderTasks() {

  content.innerHTML = `

    <div class="card">

      <div class="card-header">

        <h2>
          Tasks
        </h2>

        <button
          class="primary"
          id="addTask"
        >
          + Add task
        </button>

      </div>


      ${
        state.tasks.length

          ? state.tasks
              .map(taskHTML)
              .join("")

          : `
            <div class="empty">
              Nothing here yet.
            </div>
          `
      }

    </div>

  `;


  bindTaskEvents();

}


// ============================================================
// SUBJECT PAGE
// ============================================================

function renderSubjects() {

  content.innerHTML = `

    <div class="card">

      <div class="card-header">

        <h2>
          Subjects
        </h2>

        <button
          class="primary"
          id="addSubject"
        >
          + Add subject
        </button>

      </div>


      <div class="grid three">

        ${
          state.subjects.map(subject => `

            <div class="card">

              <div class="card-header">

                <h3>
                  ${escapeHTML(subject.name)}
                </h3>

                <button
                  class="secondary"
                  data-subject-delete="${subject.id}"
                >
                  ×
                </button>

              </div>


              <div class="subject-meta">

                <span class="muted">
                  Progress
                </span>

                <span>
                  ${subject.progress}%
                </span>

              </div>


              <div class="progress">

                <span
                  style="width:${subject.progress}%"
                ></span>

              </div>


              <div style="margin-top:12px">

                <button
                  class="secondary"
                  data-subject-edit="${subject.id}"
                >
                  Update progress
                </button>

              </div>

            </div>

          `).join("")

        }

      </div>

    </div>

  `;


  bindSubjectEvents();

}


// ============================================================
// QUEST PAGE
// ============================================================

function renderQuests() {

  content.innerHTML = `

    <div class="card">

      <div class="card-header">

        <h2>
          Side Quests
        </h2>

        <button
          class="primary"
          id="addQuest"
        >
          + Add quest
        </button>

      </div>


      <div class="grid two">

        ${
          state.quests.map(quest => `

            <div class="quest">

              <div class="quest-top">

                <div>

                  <div class="quest-title">

                    ${escapeHTML(quest.name)}

                  </div>

                  <div class="quest-type">

                    ${escapeHTML(quest.type)}

                  </div>

                </div>


                <button
                  class="secondary"
                  data-quest-delete="${quest.id}"
                >
                  ×
                </button>

              </div>


              <div class="subject-meta">

                <span class="muted">
                  Progress
                </span>

                <span>
                  ${quest.progress}%
                </span>

              </div>


              <div class="progress">

                <span
                  style="width:${quest.progress}%"
                ></span>

              </div>


              <div style="margin-top:12px">

                <button
                  class="secondary"
                  data-quest-edit="${quest.id}"
                >
                  Update progress
                </button>

              </div>

            </div>

          `).join("")

        }

      </div>

    </div>

  `;


  bindQuestEvents();

}


// ============================================================
// STUDY LOG
// ============================================================

function renderSessions() {

  content.innerHTML = `

    <div class="card">

      <div class="card-header">

        <h2>
          Study Log
        </h2>

        <button
          class="primary"
          id="addSession"
        >
          + Log session
        </button>

      </div>


      ${
        state.sessions.length

          ? `

            <table>

              <thead>

                <tr>

                  <th>Date</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Time</th>
                  <th>Questions</th>
                  <th>Accuracy</th>

                </tr>

              </thead>


              <tbody>

                ${
                  state.sessions
                    .slice()
                    .reverse()
                    .map(session => `

                      <tr>

                        <td>
                          ${formatDate(session.date)}
                        </td>

                        <td>
                          ${escapeHTML(session.subject)}
                        </td>

                        <td>
                          ${escapeHTML(session.topic || "—")}
                        </td>

                        <td>
                          ${session.minutes} min
                        </td>

                        <td>
                          ${session.questions || 0}
                        </td>

                        <td>

                          ${
                            session.questions

                              ? Math.round(
                                  session.correct /
                                  session.questions *
                                  100
                                ) + "%"

                              : "—"
                          }

                        </td>

                      </tr>

                    `).join("")
                }

              </tbody>

            </table>

          `

          : `

            <div class="empty">

              No study sessions logged yet.

            </div>

          `
      }

    </div>

  `;


  document
    .getElementById("addSession")
    ?.addEventListener(
      "click",
      () => openSession()
    );

}


// ============================================================
// EVENT BINDING
// ============================================================

function bindDashboard() {

  document
    .getElementById("dashboardAddTask")
    ?.addEventListener(
      "click",
      addTask
    );


  bindTaskEvents();

}


function bindTaskEvents() {

  document
    .getElementById("addTask")
    ?.addEventListener(
      "click",
      addTask
    );


  document
    .querySelectorAll("[data-task]")
    .forEach(checkbox => {

      checkbox.addEventListener(
        "change",
        () => {

          const task =
            state.tasks.find(
              t =>
                t.id ==
                checkbox.dataset.task
            );


          if (!task) return;


          task.done =
            checkbox.checked;


          saveData();

          render();

        }
      );

    });


  document
    .querySelectorAll("[data-task-delete]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.tasks =
            state.tasks.filter(
              task =>
                task.id !=
                button.dataset.taskDelete
            );


          saveData();

          render();

        }
      );

    });


  document
    .querySelectorAll("[data-task-log]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const task =
            state.tasks.find(
              t =>
                t.id ==
                button.dataset.taskLog
            );


          openSession(task);

        }
      );

    });

}


function bindSubjectEvents() {

  document
    .getElementById("addSubject")
    ?.addEventListener(
      "click",
      addSubject
    );


  document
    .querySelectorAll("[data-subject-delete]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.subjects =
            state.subjects.filter(
              subject =>
                subject.id !=
                button.dataset.subjectDelete
            );


          saveData();

          render();

        }
      );

    });


  document
    .querySelectorAll("[data-subject-edit]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          editSubject(
            button.dataset.subjectEdit
          )
      );

    });

}


function bindQuestEvents() {

  document
    .getElementById("addQuest")
    ?.addEventListener(
      "click",
      addQuest
    );


  document
    .querySelectorAll("[data-quest-delete]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.quests =
            state.quests.filter(
              quest =>
                quest.id !=
                button.dataset.questDelete
            );


          saveData();

          render();

        }
      );

    });


  document
    .querySelectorAll("[data-quest-edit]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          editQuest(
            button.dataset.questEdit
          )
      );

    });

}


// ============================================================
// ADD TASK
// ============================================================

function addTask() {

  showModal(

    "Add task",

    `

      <form class="form" id="taskForm">

        <label>

          What needs doing?

          <input
            name="name"
            required
            placeholder="e.g. Physics — COM prerequisites"
          >

        </label>


        <label>

          Area

          <input
            name="subject"
            required
            placeholder="Physics"
          >

        </label>


        <label>

          Planned time

          <input
            name="minutes"
            type="number"
            min="1"
            max="600"
            value="45"
            required
          >

        </label>


        <div class="form-actions">

          <button
            type="button"
            class="secondary"
            id="cancel"
          >
            Cancel
          </button>

          <button class="primary">
            Add task
          </button>

        </div>

      </form>

    `

  );


  document
    .getElementById("cancel")
    .onclick =
    closeModal;


  document
    .getElementById("taskForm")
    .onsubmit =
    event => {

      event.preventDefault();


      const form =
        new FormData(event.target);


      state.tasks.push({

        id: newId(),

        name:
          form.get("name").trim(),

        subject:
          form.get("subject").trim(),

        minutes:
          Number(form.get("minutes")),

        done: false

      });


      saveData();

      closeModal();

      render();

    };

}


// ============================================================
// ADD SUBJECT
// ============================================================

function addSubject() {

  showModal(

    "Add subject",

    `

      <form class="form" id="subjectForm">

        <label>

          Subject name

          <input
            name="name"
            required
            placeholder="Physics"
          >

        </label>


        <label>

          Current progress

          <input
            name="progress"
            type="number"
            min="0"
            max="100"
            value="0"
          >

        </label>


        <div class="form-actions">

          <button
            type="button"
            class="secondary"
            id="cancel"
          >
            Cancel
          </button>

          <button class="primary">
            Add subject
          </button>

        </div>

      </form>

    `

  );


  document
    .getElementById("cancel")
    .onclick =
    closeModal;


  document
    .getElementById("subjectForm")
    .onsubmit =
    event => {

      event.preventDefault();


      const form =
        new FormData(event.target);


      state.subjects.push({

        id: newId(),

        name:
          form.get("name").trim(),

        progress:
          clamp(
            Number(form.get("progress")) || 0
          )

      });


      saveData();

      closeModal();

      render();

    };

}


// ============================================================
// EDIT SUBJECT
// ============================================================

function editSubject(id) {

  const subject =
    state.subjects.find(
      s => s.id == id
    );


  if (!subject) return;


  showModal(

    "Update progress",

    `

      <form class="form" id="editSubjectForm">

        <label>

          ${escapeHTML(subject.name)}

          <input
            name="progress"
            type="number"
            min="0"
            max="100"
            value="${subject.progress}"
          >

        </label>


        <div class="form-actions">

          <button
            type="button"
            class="secondary"
            id="cancel"
          >
            Cancel
          </button>

          <button class="primary">
            Save
          </button>

        </div>

      </form>

    `

  );


  document
    .getElementById("cancel")
    .onclick =
    closeModal;


  document
    .getElementById("editSubjectForm")
    .onsubmit =
    event => {

      event.preventDefault();


      const form =
        new FormData(event.target);


      subject.progress =
        clamp(
          Number(form.get("progress")) || 0
        );


      saveData();

      closeModal();

      render();

    };

}


// ============================================================
// ADD QUEST
// ============================================================

function addQuest() {

  showModal(

    "Add side quest",

    `

      <form class="form" id="questForm">

        <label>

          Quest name

          <input
            name="name"
            required
            placeholder="Build an Arduino robot"
          >

        </label>


        <label>

          Type

          <input
            name="type"
            value="Build"
          >

        </label>


        <label>

          Current progress

          <input
            name="progress"
            type="number"
            min="0"
            max="100"
            value="0"
          >

        </label>


        <div class="form-actions">

          <button
            type="button"
            class="secondary"
            id="cancel"
          >
            Cancel
          </button>

          <button class="primary">
            Add quest
          </button>

        </div>

      </form>

    `

  );


  document
    .getElementById("cancel")
    .onclick =
    closeModal;


  document
    .getElementById("questForm")
    .onsubmit =
    event => {

      event.preventDefault();


      const form =
        new FormData(event.target);


      state.quests.push({

        id: newId(),

        name:
          form.get("name").trim(),

        type:
          form.get("type").trim() ||
          "Side Quest",

        progress:
          clamp(
            Number(form.get("progress")) || 0
          )

      });


      saveData();

      closeModal();

      render();

    };

}


// ============================================================
// EDIT QUEST
// ============================================================

function editQuest(id) {

  const quest =
    state.quests.find(
      q => q.id == id
    );


  if (!quest) return;


  showModal(

    "Update quest",

    `

      <form class="form" id="editQuestForm">

        <label>

          ${escapeHTML(quest.name)}

          <input
            name="progress"
            type="number"
            min="0"
            max="100"
            value="${quest.progress}"
          >

        </label>


        <div class="form-actions">

          <button
            type="button"
            class="secondary"
            id="cancel"
          >
            Cancel
          </button>

          <button class="primary">
            Save
          </button>

        </div>

      </form>

    `

  );


  document
    .getElementById("cancel")
    .onclick =
    closeModal;


  document
    .getElementById("editQuestForm")
    .onsubmit =
    event => {

      event.preventDefault();


      const form =
        new FormData(event.target);


      quest.progress =
        clamp(
          Number(form.get("progress")) || 0
        );


      saveData();

      closeModal();

      render();

    };

}


// ============================================================
// STUDY SESSION
// ============================================================

function openSession(task = null) {

  showModal(

    "Log study session",

    `

      <form class="form" id="sessionForm">

        <label>

          Date

          <input
            name="date"
            type="date"
            value="${today()}"
            required
          >

        </label>


        <label>

          Subject

          <input
            name="subject"
            value="${escapeHTML(task?.subject || "Physics")}"
            required
          >

        </label>


        <label>

          What did you study?

          <input
            name="topic"
            value="${escapeHTML(task?.name || "")}"
            placeholder="COM — centre of mass"
          >

        </label>


        <label>

          Focused minutes

          <input
            name="minutes"
            type="number"
            min="1"
            max="600"
            value="${task?.minutes || 45}"
            required
          >

        </label>


        <label>

          Questions attempted

          <input
            name="questions"
            type="number"
            min="0"
            value="0"
          >

        </label>


        <label>

          Questions correct

          <input
            name="correct"
            type="number"
            min="0"
            value="0"
          >

        </label>


        <label>

          What did you learn / struggle with?

          <textarea
            name="notes"
            placeholder="Optional"
          ></textarea>

        </label>


        <div class="form-actions">

          <button
            type="button"
            class="secondary"
            id="cancel"
          >
            Cancel
          </button>

          <button class="primary">
            Log session
          </button>

        </div>

      </form>

    `

  );


  document
    .getElementById("cancel")
    .onclick =
    closeModal;


  document
    .getElementById("sessionForm")
    .onsubmit =
    event => {

      event.preventDefault();


      const form =
        new FormData(event.target);


      const questions =
        Math.max(
          0,
          Number(form.get("questions")) || 0
        );


      const correct =
        Math.max(
          0,
          Math.min(
            questions,
            Number(form.get("correct")) || 0
          )
        );


      state.sessions.push({

        id: newId(),

        date:
          form.get("date"),

        subject:
          form.get("subject").trim(),

        topic:
          form.get("topic").trim(),

        minutes:
          Math.min(
            600,
            Math.max(
              1,
              Number(form.get("minutes")) || 1
            )
          ),

        questions,

        correct,

        notes:
          form.get("notes").trim()

      });


      saveData();

      closeModal();

      render();

    };

}


// ============================================================
// MODAL
// ============================================================

function showModal(title, body) {

  modalTitle.textContent =
    title;

  modalBody.innerHTML =
    body;

  modal.classList.remove(
    "hidden"
  );

}


function closeModal() {

  modal.classList.add(
    "hidden"
  );

  modalBody.innerHTML =
    "";

}


// ============================================================
// UTILITIES
// ============================================================

function clamp(number) {

  return Math.max(
    0,
    Math.min(
      100,
      number
    )
  );

}


// ============================================================
// NAVIGATION
// ============================================================

document
  .querySelectorAll(".nav")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentPage =
          button.dataset.page;

        render();

      }
    );

  });


document
  .getElementById("quickSession")
  .addEventListener(
    "click",
    () => openSession()
  );


document
  .getElementById("closeModal")
  .addEventListener(
    "click",
    closeModal
  );


modal.addEventListener(
  "click",
  event => {

    if (
      event.target === modal
    ) {

      closeModal();

    }

  }
);


// ============================================================
// BACKUP
// ============================================================

document
  .getElementById("exportBtn")
  .addEventListener(
    "click",
    () => {

      const blob =
        new Blob(
          [
            JSON.stringify(
              state,
              null,
              2
            )
          ],
          {
            type:
              "application/json"
          }
        );


      const url =
        URL.createObjectURL(blob);


      const link =
        document.createElement("a");


      link.href = url;

      link.download =
        `study-os-backup-${today()}.json`;


      link.click();


      URL.revokeObjectURL(url);

    }
  );


document
  .getElementById("importBtn")
  .addEventListener(
    "click",
    () =>
      document
        .getElementById("importFile")
        .click()
  );


document
  .getElementById("importFile")
  .addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];


      if (!file) return;


      const reader =
        new FileReader();


      reader.onload =
        () => {

          try {

            const imported =
              JSON.parse(
                reader.result
              );


            if (
              !imported.tasks ||
              !imported.subjects ||
              !imported.quests ||
              !imported.sessions
            ) {

              throw new Error(
                "Invalid backup"
              );

            }


            state =
              imported;


            saveData();

            render();

            alert(
              "Backup imported."
            );

          }

          catch {

            alert(
              "Invalid Study OS backup."
            );

          }

        };


      reader.readAsText(file);

      event.target.value =
        "";

    }
  );


// ============================================================
// RESET
// ============================================================

document
  .getElementById("resetBtn")
  .addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "Reset all Study OS data?"
        );


      if (!confirmed) return;


      state =
        structuredClone(
          DEFAULT_DATA
        );


      saveData();

      render();

    }
  );


// ============================================================
// START
// ============================================================

render();
