#  System Architecture — Real-Time Collaborative Drawing Canvas

##  Overview
This document describes the architecture, data flow, and synchronization logic of the **Real-Time Collaborative Drawing Canvas**, developed as part of the FLAM assessment.  
The project enables multiple users to draw simultaneously on a shared canvas using Socket.io for real-time event communication.

---

##  High-Level Architecture

```text
          ┌──────────────────────┐
          │      Client A        │
          │ (Browser + Canvas)   │
          └─────────▲────────────┘
                    │ Draw events
                    ▼
          ┌──────────────────────┐
          │      Socket.io       │
          │   (WebSocket Layer)  │
          └─────────▲────────────┘
                    │ Broadcast
                    ▼
          ┌──────────────────────┐
          │       Server         │
          │ (Node.js + Express)  │
          │   + Drawing State    │
          └─────────▲────────────┘
                    │
                    ▼
          ┌──────────────────────┐
          │      Client B        │
          │ (Browser + Canvas)   │
          └──────────────────────┘
```

---

##  Data Flow

| Step | Event | Source | Destination | Description |
|------|--------|---------|--------------|--------------|
| 1 | `mousedown/mousemove` | User | Client | Canvas captures stroke path |
| 2️ | `draw` | Client | Server | Stroke data (`path`, `color`, `brush`, `userId`) sent to server |
| 3️ | `broadcast` | Server | All clients | Server emits stroke data to other connected users |
| 4️ | `applyStroke()` | Clients | Local Canvas | Each client renders stroke using its color and brush |
| 5️ | `undo/redo/clear` | Client | Server | Server updates shared `history` + `undoStack` |
| 6️ | `update` | Server | All clients | Clients re-render full synchronized history |

---

##  Undo/Redo Logic

The **`DrawingState`** class on the server maintains two arrays:
```js
history = [];     // All committed strokes
undoStack = [];   // Temporarily removed strokes
```

### Undo Operation
1. Pop the last stroke from `history`
2. Push it into `undoStack`
3. Emit `update` to all clients to re-render the canvas

### Redo Operation
1. Pop from `undoStack`
2. Push back into `history`
3. Emit `update` again
4. Strokes maintain original `color`, `brush`, and `path`

This ensures that:
- Undo/Redo operations are **global and synchronized**.
- Redone strokes appear with **original color and brush** values.

---

##  Performance and Synchronization Strategy

- **Real-time Communication:**  
  Socket.io used for efficient bidirectional event streaming.

- **Low Latency Rendering:**  
  Each stroke stored as a single object and broadcast immediately after `mouseup`.

- **Data Consistency:**  
  The server acts as a **single source of truth**, managing stroke history.

- **Color/Brush Preservation:**  
  Deep cloning prevents accidental mutation of stroke data on re-broadcast.

---

##  Design Decisions

| Aspect | Choice | Reason |
|---------|--------|--------|
| Communication | Socket.io | Simplified WebSocket abstraction with event-based sync |
| Frontend Framework | None (Vanilla JS) | Show raw Canvas + DOM proficiency |
| Undo/Redo Model | Stack-based (history + undoStack) | Clean and efficient |
| Rendering | HTML5 Canvas API | Smooth, lightweight drawing |
| Architecture | Client-Server | Allows multi-user scalability |

---

##  Future Extensions

- Per-user Undo/Redo (isolated states)
- Live cursor indicators for collaboration awareness
- Persistent canvas storage using JSON or database
- Room-based session isolation

---

##  Summary

This architecture ensures **low-latency synchronization**, **consistent state management**, and **clean modular separation** between client and server.  
The system design demonstrates scalable real-time collaboration using event-driven WebSocket communication.
