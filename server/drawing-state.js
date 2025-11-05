class DrawingState {
  constructor() {
    this.history = [];    // All strokes with { path, color, brush, userId }
    this.undoStack = [];  // Undone strokes saved for redo
  }

  addStroke(stroke) {
    // Deep copy stroke so we never lose color info
    const copy = JSON.parse(JSON.stringify(stroke));
    this.history.push(copy);
    this.undoStack = []; // Clear redo stack
  }

  undo() {
    if (this.history.length === 0) return null;
    const last = this.history.pop();
    this.undoStack.push(last);
    return last;
  }

  redo() {
    if (this.undoStack.length === 0) return null;
    const redoStroke = this.undoStack.pop();
    // Deep copy again to avoid references
    const copy = JSON.parse(JSON.stringify(redoStroke));
    this.history.push(copy);
    return copy;
  }

  clear() {
    this.history = [];
    this.undoStack = [];
  }
}

module.exports = DrawingState;
