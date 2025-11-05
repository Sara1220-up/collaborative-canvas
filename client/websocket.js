import { applyStroke, clearCanvas } from "./canvas.js";

let userColor = "#000000";
let users = {};

export function initSocket() {
  const socket = io();

  socket.on("connect", () => console.log("Connected:", socket.id));

  // Initialize user color & existing strokes
  socket.on("init", (data) => {
    userColor = data.color;
    users[socket.id] = userColor;
    updateUserList();

    clearCanvas();
    (data.history || []).forEach(applyStroke);
  });

  socket.on("user_joined", (data) => {
    users[data.id] = data.color;
    updateUserList();
  });

  socket.on("user_left", (id) => {
    delete users[id];
    updateUserList();
  });

  socket.on("draw", (data) => applyStroke(data));

  socket.on("clear", clearCanvas);

  socket.on("update", (data) => {
    clearCanvas();
    (data.history || []).forEach(applyStroke);
  });

  return {
    sendStroke: (stroke) => socket.emit("draw", { ...stroke, color: userColor }),
    undo: () => socket.emit("undo"),
    redo: () => socket.emit("redo"),
    clear: () => socket.emit("clear"),
  };
}

function updateUserList() {
  const list = document.getElementById("users");
  if (!list) return;
  list.innerHTML = "";
  Object.entries(users).forEach(([id, color]) => {
    const li = document.createElement("li");
    li.textContent = id.slice(0, 5);
    li.style.borderColor = color;
    list.appendChild(li);
  });
}
