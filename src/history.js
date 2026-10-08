class History {
    constructor(limit = 100) {
        this.undoStack = [];
        this.redoStack = [];
        this.limit = limit;
    }

    save(state) {
        this.undoStack.push({
            lines: [...state.lines],
            x: state.x,
            y: state.y,
            modified: state.modified
        });

        if (this.undoStack.length > this.limit) {
            this.undoStack.shift();
        }

        this.redoStack = [];
    }

    undo(currentState) {
        if (this.undoStack.length === 0) {
            return null;
        }

        this.redoStack.push({
            lines: [...currentState.lines],
            x: currentState.x,
            y: currentState.y,
            modified: currentState.modified
        });

        return this.undoStack.pop();
    }

    redo(currentState) {
        if (this.redoStack.length === 0) {
            return null;
        }

        this.undoStack.push({
            lines: [...currentState.lines],
            x: currentState.x,
            y: currentState.y,
            modified: currentState.modified
        });

        return this.redoStack.pop();
    }
}

module.exports = History;