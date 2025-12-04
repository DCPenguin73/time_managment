// Handles sign up / sign in / sign out and wiring the task UI

const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const signOutBtn = document.getElementById("signOutBtn");
const authStatus = document.getElementById("authStatus");
const taskApp = document.getElementById("taskApp");

// Sign up
signUpBtn.addEventListener("click", async () => {
  try {
    await auth.createUserWithEmailAndPassword(emailEl.value, passEl.value);
  } catch (e) {
    authStatus.textContent = `Sign up error: ${e.message}`;
  }
});

// Sign in
signInBtn.addEventListener("click", async () => {
  try {
    await auth.signInWithEmailAndPassword(emailEl.value, passEl.value);
  } catch (e) {
    authStatus.textContent = `Sign in error: ${e.message}`;
  }
});

// Sign out
signOutBtn.addEventListener("click", () => auth.signOut());

// Auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    authStatus.textContent = `Signed in: ${user.email}`;
    signOutBtn.disabled = false;
    signInBtn.disabled = true;
    signUpBtn.disabled = true;
    taskApp.hidden = false;

    // init tasks for this user (defined in tasks.js)
    if (typeof initTasksForUser === "function") initTasksForUser(user.uid);
  } else {
    authStatus.textContent = "Signed out";
    signOutBtn.disabled = true;
    signInBtn.disabled = false;
    signUpBtn.disabled = false;
    taskApp.hidden = true;

    if (typeof teardownTasks === "function") teardownTasks();
  }
});
