// Dark mode toggle + simple motivational banner rotation

const darkToggle = document.getElementById("darkToggle");
const motif = document.getElementById("motivationBanner");

const quotes = [
  "Small steps add up. Start now.",
  "Focus for 25 minutes, then rest.",
  "Progress, not perfection.",
  "Done is better than perfect.",
  "Your future self will thank you."
];

function loadTheme() {
  const t = localStorage.getItem("theme") || "";
  document.documentElement.dataset.theme = t;
}

loadTheme();

darkToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
});

// Rotate motivational quote every 6 seconds
let qIndex = 0;

function rotateBanner() {
  motif.textContent = quotes[qIndex];
  qIndex = (qIndex + 1) % quotes.length;
}

rotateBanner();
setInterval(rotateBanner, 6000);
