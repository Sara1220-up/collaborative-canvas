const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const DrawingState = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const state = new DrawingState();

app.use(express.static("client"));

// Assign random color to each new user
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}

io.on("connection", (socket) => {
  const userColor = getRandomColor();
  console.log(`🟢 Connected: ${socket.id}, Color: ${userColor}`);

  socket.emit("init", { color: userColor, history: state.history });
  socket.broadcast.emit("user_joined", { id: socket.id, color: userColor });

  // DRAW event
  socket.on("draw", (stroke) => {
    const strokeData = { ...stroke, userId: socket.id };
    state.addStroke(strokeData);
    socket.broadcast.emit("draw", strokeData);
  });

  // UNDO event
  socket.on("undo", () => {
    const undone = state.undo();
    if (undone) io.emit("update", { history: state.history });
  });

  // REDO event (fully color-preserved)
  socket.on("redo", () => {
    const redone = state.redo();
    if (redone) io.emit("update", { history: state.history });
  });

  // CLEAR canvas
  socket.on("clear", () => {
    state.clear();
    io.emit("clear");
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Disconnected: ${socket.id}`);
    io.emit("user_left", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
