import { initCanvas, setColor, setBrush } from "./canvas.js";
import { initSocket } from "./websocket.js";

const socket = initSocket();

initCanvas((stroke) => {
  // This is called after each stroke ends
  socket.sendStroke(stroke);
});

document.getElementById("colorPicker").addEventListener("input", (e) => {
  setColor(e.target.value);
});

document.getElementById("brushSize").addEventListener("input", (e) => {
  setBrush(parseInt(e.target.value));
});

document.getElementById("undoBtn").addEventListener("click", () => socket.undo());
document.getElementById("redoBtn").addEventListener("click", () => socket.redo());
document.getElementById("clearBtn").addEventListener("click", () => socket.clear());
