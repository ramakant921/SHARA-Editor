import Buffer from "./buffer.js"
import History from "./history.js"
import Modes from "./modes.js"
import Renderer from "./renderer.js"
import execute from "./commands.js"
import * as terminal from "./terminal.js";

const fileName = process.argv[2] || "";

class Editor {
  constructor() {
    this.buffer = new Buffer(fileName);
    this.modes = new Modes();

    this.x = 0;
    this.y = 0;

    this.mode = "NORMAL";
    this.command = "";
    this.searchTerm = "";
    this.pendingKey = "";
    this.copiedLine = null;
    this.history = new History();
    this.scrollY = 0;
    this.message = "";
    this.running = true;
    this.renderer = new Renderer(this);
  }

  setMode(mode) {
    this.mode = mode;
  }

  cancelSearch() {
    this.searchTerm = "";
    this.setMode("NORMAL");
  }

  cancelCommand() {
    this.command = "";
    this.setMode("NORMAL");
  }

  submitSearch() {
    this.search();
    this.setMode("NORMAL");
  }

  removeSearchCharacter() {
    this.searchTerm = this.searchTerm.slice(0, -1);
  }

  updateSearchTerm(char) {
    this.searchTerm += char;
  }

  start() {
    terminal.setup();

    process.on("exit", () => {
      terminal.restore();
    });

    process.on("SIGINT", () => {
      this.quit();
    });

    process.stdout.on("resize", () => {
      this.render();
    });

    this.render();

    process.stdin.on("data", (key) => {
      this.modes.handleKey(this, key);
    });
  }

  getState() {
    return {
      lines: [...this.buffer.lines],
      x: this.x,
      y: this.y,
      modified: this.buffer.modified
    };
  }

  saveHistory() {
    this.history.save(this.getState());
  }

  restoreState(state) {
    this.buffer.lines = [...state.lines];
    this.buffer.modified = state.modified;

    this.x = state.x;
    this.y = state.y;

    this.keepCursorValid();
    this.updateScroll();
  }

  undo() {
    const state = this.history.undo(this.getState());

    if (!state) {
      this.message = "Nothing to undo";
      return;
    }

    this.restoreState(state);
  }

  redo() {
    const state = this.history.redo(this.getState());

    if (!state) {
      this.message = "Nothing to redo";
      return;
    }

    this.restoreState(state);
  }

  save() {
    if (!this.buffer.fileName) {
      this.message = "No filename";
      return;
    }

    this.buffer.save();

    this.message = `Saved ${this.buffer.fileName}`;
  }

  quit() {
    this.running = false;

    terminal.restore();

    process.exit(0);
  }

  render() {
    if (!this.running) {
      return;
    }

    this.updateScroll();

    this.renderer.draw();

    if (this.message) {
      const { rows } = terminal.size();

      terminal.moveTo(rows, 1);
      terminal.write(this.message);

      this.message = "";
    }
  }

  keepCursorValid() {
    if (this.y < 0) {
      this.y = 0;
    }

    if (this.y >= this.buffer.lineCount()) {
      this.y = this.buffer.lineCount() - 1;
    }

    const lineLength =
      this.buffer.getLine(this.y).length;

    if (this.x < 0) {
      this.x = 0;
    }

    if (this.x > lineLength) {
      this.x = lineLength;
    }
  }

  updateScroll() {
    const { rows } = terminal.size();

    const visibleRows = Math.max(1, rows - 2);

    if (this.y < this.scrollY) {
      this.scrollY = this.y;
    }

    if (this.y >= this.scrollY + visibleRows) {
      this.scrollY =
        this.y - visibleRows + 1;
    }

    if (this.scrollY < 0) {
      this.scrollY = 0;
    }
  }

  moveLeft() {
    if (this.x > 0) {
      this.x--;
    }
  }

  moveRight() {
    const length =
      this.buffer.getLine(this.y).length;

    if (this.x < length) {
      this.x++;
    }
  }

  moveUp() {
    if (this.y > 0) {
      this.y--;

      this.keepCursorValid();
    }
  }

  moveDown() {
    if (
      this.y <
      this.buffer.lineCount() - 1
    ) {
      this.y++;

      this.keepCursorValid();
    }
  }

  lineStart() {
    this.x = 0;
  }

  lineEnd() {
    this.x =
      this.buffer.getLine(this.y).length;
  }

  fileStart() {
    this.y = 0;
    this.x = 0;
  }

  fileEnd() {
    this.y =
      this.buffer.lineCount() - 1;

    this.x =
      this.buffer.getLine(this.y).length;
  }

  wordForward() {
    const line =
      this.buffer.getLine(this.y);

    let position = this.x;

    while (
      position < line.length &&
      line[position] !== " "
    ) {
      position++;
    }

    this.x = position;
  }

  wordBackward() {
    const line =
      this.buffer.getLine(this.y);

    let position =
      Math.max(0, this.x - 1);

    while (
      position > 0 &&
      line[position] === " "
    ) {
      position--;
    }

    this.x = position;
  }

  insertCharacter(key) {
    this.saveHistory();

    const line =
      this.buffer.getLine(this.y);

    this.buffer.setLine(
      this.y,
      line.slice(0, this.x) +
      key +
      line.slice(this.x)
    );

    this.x++;
  }

  insertTab() {
    this.saveHistory();

    const line =
      this.buffer.getLine(this.y);

    this.buffer.setLine(
      this.y,
      line.slice(0, this.x) +
      "    " +
      line.slice(this.x)
    );

    this.x += 4;
  }

  newLineBelow() {
    this.saveHistory();

    this.buffer.insertLine(
      this.y + 1,
      ""
    );

    this.y++;

    this.x = 0;
  }

  newLineAbove() {
    this.saveHistory();

    this.buffer.insertLine(
      this.y,
      ""
    );

    this.x = 0;
  }

  splitLine() {
    this.saveHistory();

    const line =
      this.buffer.getLine(this.y);

    const left =
      line.slice(0, this.x);

    const right =
      line.slice(this.x);

    this.buffer.setLine(
      this.y,
      left
    );

    this.buffer.insertLine(
      this.y + 1,
      right
    );

    this.y++;

    this.x = 0;
  }

  backspace() {
    if (this.x > 0) {
      this.saveHistory();

      const line =
        this.buffer.getLine(this.y);

      this.buffer.setLine(
        this.y,
        line.slice(0, this.x - 1) +
        line.slice(this.x)
      );

      this.x--;

      return;
    }

    if (this.y > 0) {
      this.saveHistory();

      const current =
        this.buffer.getLine(this.y);

      const previous =
        this.buffer.getLine(this.y - 1);

      this.x = previous.length;

      this.buffer.setLine(
        this.y - 1,
        previous + current
      );

      this.buffer.lines.splice(
        this.y,
        1
      );

      this.y--;
    }
  }

  deleteCharacter() {
    const line =
      this.buffer.getLine(this.y);

    if (this.x >= line.length) {
      return;
    }

    this.saveHistory();

    this.buffer.setLine(
      this.y,
      line.slice(0, this.x) +
      line.slice(this.x + 1)
    );

    this.keepCursorValid();
  }

  deleteLine() {
    this.saveHistory();

    this.buffer.deleteLine(this.y);

    this.keepCursorValid();
  }

  copyLine() {
    this.copiedLine =
      this.buffer.getLine(this.y);

    this.message = "Line copied";
  }

  pasteLine() {
    if (this.copiedLine === null) {
      this.message = "Nothing copied";
      return;
    }

    this.saveHistory();

    this.buffer.insertLine(
      this.y + 1,
      this.copiedLine
    );

    this.y++;

    this.x = 0;
  }

  openFile(name) {
    this.buffer =
      new Buffer(name);

    this.x = 0;
    this.y = 0;

    this.scrollY = 0;

    this.mode = "NORMAL";

    this.command = "";

    this.history =
      new History();

    this.message =
      `Opened ${name}`;
  }

  search() {
    if (!this.searchTerm) {
      this.message =
        "Search term required";

      return;
    }

    const startY = this.y;

    const startX =
      this.x + 1;

    for (
      let row = startY;
      row < this.buffer.lineCount();
      row++
    ) {
      const line =
        this.buffer.getLine(row);

      const start =
        row === startY
        ? startX
        : 0;

      const position =
        line.indexOf(
          this.searchTerm,
          start
        );

      if (position !== -1) {
        this.y = row;
        this.x = position;

        return;
      }
    }

    for (
      let row = 0;
      row <= startY;
      row++
    ) {
      const line =
        this.buffer.getLine(row);

      const position =
        line.indexOf(
          this.searchTerm
        );

      if (position !== -1) {
        this.y = row;
        this.x = position;

        this.message =
          "Search wrapped";

        return;
      }
    }

    this.message =
      "Pattern not found";
  }

  executeCommand() {
    const command =
      this.command.trim();

    this.mode = "NORMAL";

    this.command = "";

    if (!command) {
      return;
    }

    execute(
      this,
      command
    );
  }
}

const editor = new Editor();

editor.start();
