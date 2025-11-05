// ======================
// client/canvas.js
// ======================

let canvas, ctx;
let drawing = false;
let color = "#000000";
let brush = 3;
let currentPath = [];

// ----------------------
// Initialize Canvas
// ----------------------
export function initCanvas(onDrawEnd) {
  canvas = document.getElementById("drawCanvas");
  ctx = canvas.getContext("2d");

  const startDraw = (e) => {
    drawing = true;
    currentPath = [];
    const { x, y } = getPos(e);
    currentPath.push({ x, y });
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    currentPath.push({ x, y });

    ctx.strokeStyle = color;
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (drawing) {
      drawing = false;
      ctx.closePath();

      if (currentPath.length > 0) {
        // Send full stroke data to server
        onDrawEnd({
          path: currentPath,
          color: color,
          brush: brush
        });
      }
    }
  };

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("mouseleave", endDraw);

  // Touch support
  canvas.addEventListener("touchstart", (e) => startDraw(e.touches[0]));
  canvas.addEventListener("touchmove", (e) => draw(e.touches[0]));
  canvas.addEventListener("touchend", endDraw);
}

// ----------------------
// Drawing Utilities
// ----------------------
export function setColor(c) { color = c; }
export function setBrush(b) { brush = b; }

// THIS is the export your websocket.js needs
export function applyStroke(stroke) {
  if (!stroke || !stroke.path || stroke.path.length === 0) return;

  ctx.beginPath();
  ctx.strokeStyle = stroke.color || "#000000";
  ctx.lineWidth = stroke.brush || 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const path = stroke.path;
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }

  ctx.stroke();
  ctx.closePath();
}

export function clearCanvas() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}
