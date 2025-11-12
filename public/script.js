// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBpPCKao57aZ2o7NEN4hl_-ehsHyua1K-s",
  authDomain: "time-management-e095d.firebaseapp.com",
  databaseURL: "https://time-management-e095d-default-rtdb.firebaseio.com",
  projectId: "time-management-e095d",
  storageBucket: "time-management-e095d.firebasestorage.app",
  messagingSenderId: "243527966893",
  appId: "1:243527966893:web:277fa7425019051b1ee624"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const checkboxList = document.getElementById("checkbox-list");

// Load checkboxes from Firebase
db.ref("checkboxes").on("value", (snapshot) => {
  checkboxList.innerHTML = "";
  const data = snapshot.val();
  Object.keys(data).forEach((key) => {
    const item = data[key];
    const div = document.createElement("div");
    div.className = "checkbox-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.checked;
    checkbox.onchange = () => {
      db.ref("checkboxes/" + key).update({ checked: checkbox.checked });
    };

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = item.label;
    textInput.onchange = () => {
      db.ref("checkboxes/" + key).update({ label: textInput.value });
    };

    div.appendChild(checkbox);
    div.appendChild(textInput);
    checkboxList.appendChild(div);
  });
});

// Initialize with 5 checkboxes if none exist
db.ref("checkboxes").once("value", (snapshot) => {
  if (!snapshot.exists()) {
    const initialData = {};
    for (let i = 1; i <= 5; i++) {
      initialData["box" + i] = { label: "Checkbox " + i, checked: false };
    }
    db.ref("checkboxes").set(initialData);
  }
});
