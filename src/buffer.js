const fs = require("fs");

class Buffer {
    constructor(fileName) {
        this.fileName = fileName;
        this.lines = [""];
        this.modified = false;

        this.load();
    }

    load() {
        if (!this.fileName) {
            return;
        }

        if (fs.existsSync(this.fileName)) {
            const content = fs.readFileSync(this.fileName, "utf8");

            this.lines = content.split("\n");

            if (this.lines.length === 0) {
                this.lines = [""];
            }
        }
    }

    save() {
        if (!this.fileName) {
            return false;
        }

        fs.writeFileSync(
            this.fileName,
            this.lines.join("\n"),
            "utf8"
        );

        this.modified = false;

        return true;
    }

    getLine(row) {
        return this.lines[row] ?? "";
    }

    setLine(row, text) {
        this.lines[row] = text;
        this.modified = true;
    }

    insertLine(row, text = "") {
        this.lines.splice(row, 0, text);
        this.modified = true;
    }

    deleteLine(row) {
        if (this.lines.length === 1) {
            this.lines[0] = "";
        } else {
            this.lines.splice(row, 1);
        }

        this.modified = true;
    }

    lineCount() {
        return this.lines.length;
    }

    getState() {
        return {
            lines: [...this.lines],
            modified: this.modified
        };
    }

    restoreState(state) {
        this.lines = [...state.lines];
        this.modified = state.modified;
    }
}

module.exports = Buffer;