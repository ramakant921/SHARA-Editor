import * as terminal from "./terminal.js"

const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const BLUE = "\x1b[34m";
const WHITE = "\x1b[37m";
const BLACK = "\x1b[30m";
const YELLOW = "\x1b[33m";

class Renderer {
    constructor(editor) {
        this.editor = editor;
    }

    draw() {
        const editor = this.editor;
        const { rows, columns } = terminal.size();

        terminal.clear();
        terminal.hideCursor();

        const visibleRows = Math.max(1, rows - 2);

        this.drawHeader(columns);

        for (let screenRow = 0; screenRow < visibleRows; screenRow++) {
            const fileRow = editor.scrollY + screenRow;

            if (fileRow >= editor.buffer.lineCount()) {
                terminal.write("~\n");
                continue;
            }

            this.drawLine(fileRow, columns);
        }

        this.drawStatus(columns);

        this.positionCursor();
        terminal.showCursor();
    }

    drawHeader(columns) {
        const editor = this.editor;

        let title = ` SHARA-Editor  ${editor.buffer.fileName || "[No Name]"}`;

        if (editor.buffer.modified) {
            title += " [+]";
        }

        title = title.padEnd(columns, "─").slice(0, columns);

        terminal.write(`${CYAN}${title}${RESET}\n`);
    }

    drawLine(row, columns) {
        const editor = this.editor;
        const line = editor.buffer.getLine(row);

        const number = String(row + 1).padStart(4, " ");

        let visibleLine = line;

        if (visibleLine.length > columns - 7) {
            visibleLine = visibleLine.slice(0, columns - 7);
        }

        terminal.write(
            `${BLUE}${number}${RESET} │ ${WHITE}${visibleLine}${RESET}\n`
        );
    }

    drawStatus(columns) {
        const editor = this.editor;

        let left = "";

        if (editor.mode === "COMMAND") {
            left = `:${editor.command}`;
        } else if (editor.mode === "SEARCH") {
            left = `/${editor.searchTerm}`;
        } else {
            left = ` ${editor.mode}`;
        }

        const right =
            `Ln ${editor.y + 1}, Col ${editor.x + 1}`;

        const spaces = Math.max(
            1,
            columns - left.length - right.length
        );

        const status =
            `${YELLOW}${left}${" ".repeat(spaces)}${right}${RESET}`;

        terminal.write(status.slice(0, columns));
    }

    positionCursor() {
        const editor = this.editor;

        const screenY = editor.y - editor.scrollY + 2;
        const screenX = editor.x + 8;

        terminal.moveTo(screenY, screenX);
    }
}

export default Renderer
