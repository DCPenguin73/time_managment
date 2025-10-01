document.getElementById('darkToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

const quotes = [
  "You're doing great!",
  "Keep pushing forward!",
  "Small steps lead to big results.",
];
document.getElementById('motivationBanner').innerText = quotes[Math.floor(Math.random() * quotes.length)];
