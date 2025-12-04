// ============================================================================
// TASKS.JS – full updated version with:
// - Priority badge
// - Start/Pause toggle
// - Fixed progress bar movement
// - 100% completion popup workflow
// ============================================================================

let unsubscribeTasks = null;
let currentUid = null;
let currentTasks = [];
let showCompleted = false; // false = show incomplete tasks by default

function userTasksRef(uid) {
  return firestore.collection("users").doc(uid).collection("tasks");
}

// ============================================================================
// INITIALIZE TASK SYSTEM FOR LOGGED-IN USER
// ============================================================================

function initTasksForUser(uid) {
  currentUid = uid;

  const listDiv = document.getElementById("checkbox-list");
  const addBtn = document.getElementById("addTaskBtn");

  const nameInput = document.getElementById("newTaskName");
  const dueInput = document.getElementById("newTaskDue");
  const expectedInput = document.getElementById("newTaskExpected");
  const categoryInput = document.getElementById("newTaskCategory");
  const descInput = document.getElementById("newTaskDescription");
  const priorityInput = document.getElementById("newTaskPriority");

  const filterBtn = document.getElementById("filterBtn");
  const sortSelect = document.getElementById("sortMode");

  // Stop any previous snapshot listener
  if (unsubscribeTasks) {
    unsubscribeTasks();
    unsubscribeTasks = null;
  }

  // Listen for changes in Firestore
  unsubscribeTasks = userTasksRef(uid)
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        currentTasks = [];
        snapshot.forEach((doc) => {
          currentTasks.push({ id: doc.id, ...doc.data() });
        });
        renderTaskList(listDiv);
      },
      (err) => {
        console.error("tasks onSnapshot error", err);
        listDiv.textContent = "Error loading tasks.";
      }
    );

  // Add task
  addBtn.onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) return;

    const newTask = {
      name,
      description: descInput.value.trim(),
      category: categoryInput.value.trim(),
      priority: priorityInput.value,
      due: dueInput.value
        ? firebase.firestore.Timestamp.fromDate(new Date(dueInput.value))
        : null,
      expectedMinutes: Number(expectedInput.value) || 0,

      progress: 0,
      completed: false,
      status: "not_started",
      startedAt: null,

      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await userTasksRef(uid).add(newTask);
      nameInput.value = "";
      categoryInput.value = "";
      descInput.value = "";
      expectedInput.value = "";
      dueInput.value = "";
      priorityInput.value = "normal";
    } catch (e) {
      console.error("Add task failed", e);
    }
  };

  // Toggle between showing completed/incomplete tasks
  filterBtn.onclick = () => {
    showCompleted = !showCompleted;

    filterBtn.textContent = showCompleted
      ? "Show: Incomplete"
      : "Show: Completed";

    document.getElementById("tasksHeader").textContent = showCompleted
      ? "Completed Tasks"
      : "Your Tasks";

    renderTaskList(listDiv);
  };


  // Sorting changed
  sortSelect.onchange = () => {
    renderTaskList(listDiv);
  };
}

// ============================================================================
// CLEANUP
// ============================================================================

function teardownTasks() {
  if (unsubscribeTasks) unsubscribeTasks();
  unsubscribeTasks = null;
  currentUid = null;
  currentTasks = [];
  document.getElementById("checkbox-list").innerHTML = "";
  document.getElementById("addTaskBtn").onclick = null;
}

// ============================================================================
// SORTING + RENDERING
// ============================================================================

function sortTasks(tasks) {
  const sortSelect = document.getElementById("sortMode");
  if (!sortSelect) return tasks;

  const mode = sortSelect.value;
  const priorityWeight = (p) => (p === "high" ? 0 : 1);

  return tasks.slice().sort((a, b) => {
    if (mode === "priority") {
      return priorityWeight(a.priority) - priorityWeight(b.priority);
    }

    if (mode === "dueDate") {
      const aDue = a.due?.toMillis?.() ?? Infinity;
      const bDue = b.due?.toMillis?.() ?? Infinity;
      return aDue - bDue;
    }

    // DEFAULT: priority → due date
    const p = priorityWeight(a.priority) - priorityWeight(b.priority);
    if (p !== 0) return p;

    const aDue = a.due?.toMillis?.() ?? Infinity;
    const bDue = b.due?.toMillis?.() ?? Infinity;
    return aDue - bDue;
  });
}

function renderTaskList(listDiv) {
  let toDisplay = currentTasks.filter((t) =>
    showCompleted ? t.completed : !t.completed
  );

  toDisplay = sortTasks(toDisplay);

  listDiv.innerHTML = "";

  if (!toDisplay.length) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent =
      showCompleted ? "No completed tasks yet." : "No tasks yet.";
    listDiv.appendChild(empty);
    return;
  }

  toDisplay.forEach((task) => {
    listDiv.appendChild(renderTaskRow(currentUid, task.id, task));
  });
}

// ============================================================================
// RENDER A SINGLE TASK ROW
// ============================================================================

function renderTaskRow(uid, id, task) {
  const row = document.createElement("div");
  row.className = "task-row";

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!task.completed;

  // Meta container
  const meta = document.createElement("div");
  meta.className = "meta";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = task.name;

  const priorityBadge = document.createElement("span");
  priorityBadge.className =
    task.priority === "high" ? "priority-badge" : "priority-normal";
  priorityBadge.textContent =
    task.priority === "high" ? "HIGH PRIORITY" : "Normal";

  const desc = document.createElement("div");
  desc.className = "desc";
  desc.textContent = task.description || "(no description)";

  const details = document.createElement("div");
  details.className = "small";

  const dueText = task.due?.toDate
    ? task.due.toDate().toLocaleDateString()
    : "No due date";

  const expectedText = task.expectedMinutes
    ? `${task.expectedMinutes} min`
    : "No estimate";

  details.textContent = `Due: ${dueText} • Est: ${expectedText}`;

  meta.appendChild(title);
  meta.appendChild(priorityBadge);
  meta.appendChild(desc);
  meta.appendChild(details);

  // Progress bar
  const track = document.createElement("div");
  track.className = "person-track";

  const person = document.createElement("div");
  person.className = "person";
  person.style.transform = "translateY(-50%)";
  person.style.left = `${task.progress}%`;

  track.appendChild(person);

  const progressLabel = document.createElement("div");
  progressLabel.className = "small";
  progressLabel.textContent = `${task.progress}%`;

  // Start/Pause button
  const startBtn = document.createElement("button");
  startBtn.className = "start-btn";
  startBtn.textContent =
    task.status === "in_progress" ? "Pause" : "Start";

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit";

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // Mark complete / incomplete
  checkbox.addEventListener("change", async () => {
    const completed = checkbox.checked;

    const newStatus = completed
      ? "completed"
      : task.progress > 0
      ? "paused"
      : "not_started";

    await userTasksRef(uid).doc(id).update({
      completed,
      status: newStatus,
      progress: completed ? 100 : task.progress,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  });

  // Start/Pause toggle
  startBtn.addEventListener("click", async () => {
    const isRunning = task.status === "in_progress";

    if (isRunning) {
      // PAUSE
      await userTasksRef(uid).doc(id).update({
        status: "paused",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // START or RESUME
      const updateData = {
        status: "in_progress",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Only set startedAt if progress is zero AND never started before
      if (!task.startedAt || task.progress === 0) {
        updateData.startedAt = firebase.firestore.FieldValue.serverTimestamp();
      }

      await userTasksRef(uid).doc(id).update(updateData);
    }
  });


  // Delete button
  delBtn.addEventListener("click", async () => {
    await userTasksRef(uid).doc(id).delete();
  });

  // Edit button
  editBtn.addEventListener("click", async () => {
    const newName = prompt("Name:", task.name);
    if (newName === null) return;

    const newDesc = prompt("Description:", task.description || "");
    if (newDesc === null) return;

    const newPriority = prompt(
      "Priority (high or normal):",
      task.priority
    );
    if (newPriority === null) return;

    const newExpected = prompt(
      "Expected minutes:",
      String(task.expectedMinutes)
    );
    if (newExpected === null) return;

    const newProgress = prompt(
      "Progress (0–100):",
      String(task.progress || 0)
    );
    if (newProgress === null) return;

    const progressVal = Math.max(
      0,
      Math.min(100, Number(newProgress) || 0)
    );

    const newDue = prompt(
      "Due date (YYYY-MM-DD):",
      task.due?.toDate?.().toISOString().slice(0, 10) || ""
    );

    // Determine new status based on progress
    let newStatus = "not_started";
    if (progressVal >= 100) newStatus = "completed";
    else if (progressVal > 0) newStatus = "paused";

    const updated = {
      name: newName,
      description: newDesc,
      priority: newPriority === "high" ? "high" : "normal",
      expectedMinutes: Number(newExpected) || 0,

      // ⭐ NEW ⭐ — progress + status + completed:
      progress: progressVal,
      completed: progressVal >= 100,
      status: newStatus,

      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (newDue) {
      updated.due = firebase.firestore.Timestamp.fromDate(
        new Date(newDue)
      );
    }

    await userTasksRef(uid).doc(id).update(updated);
  });


  // Add everything to row
  row.appendChild(checkbox);
  row.appendChild(meta);
  row.appendChild(track);
  row.appendChild(progressLabel);
  row.appendChild(startBtn);
  row.appendChild(editBtn);
  row.appendChild(delBtn);

  return row;
}

// ============================================================================
// AUTO-PROGRESS ENGINE
// ============================================================================

setInterval(async () => {
  const user = auth.currentUser;
  if (!user) return;

  const snap = await userTasksRef(user.uid)
    .where("status", "==", "in_progress")
    .get();

  const now = Date.now();

  snap.forEach((doc) => {
    const task = doc.data();
    if (!task.startedAt || !task.expectedMinutes) return;

    const startMs = task.startedAt.toDate().getTime();
    const totalMs = task.expectedMinutes * 60000;
    const elapsed = now - startMs;

    const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));

    if (pct === task.progress) return;

    if (pct >= 100) {
      // =============================================================
      // NEW: POPUP on 100% completion
      // =============================================================
      const isDone = confirm(
        `"${task.name}" has reached 100%. Mark as complete?`
      );

      if (isDone) {
        doc.ref.update({
          progress: 100,
          completed: true,
          status: "completed",
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        const newTime = prompt(
          "Enter new expected minutes to complete:",
          task.expectedMinutes
        );

        doc.ref.update({
          progress: 0,
          completed: false,
          status: "paused",
          expectedMinutes: Number(newTime) || task.expectedMinutes,
          startedAt: null,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      return;
    }

    // Normal progress update
    doc.ref.update({
      progress: pct,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  });
}, 5000);
