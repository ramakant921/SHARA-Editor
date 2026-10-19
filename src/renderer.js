import highlight from "./highlighter.js"
import * as terminal from "./terminal.js"
import detectLanguage from "./language.js"

const RESET = "\x1b[0m"
const GREEN = "\x1b[38;5;154m"
const DIM = "\x1b[38;5;245m"
const WHITE = "\x1b[38;5;252m"
const MUTED = "\x1b[38;5;240m"
const YELLOW = "\x1b[38;5;221m"
const BG = "\x1b[48;5;236m"
const MODE_BG = "\x1b[48;5;154m"
const DARK = "\x1b[38;5;232m"

class Renderer {
    constructor(editor) {
        this.editor = editor
    }

    draw() {
        const editor = this.editor
        const { rows, columns } = terminal.size()
        const visibleRows = Math.max(1, rows - 3)

        terminal.clear()
        terminal.hideCursor()

        this.drawHeader(columns)

        for (let screenRow = 0; screenRow < visibleRows; screenRow++) {
            const fileRow = editor.scrollY + screenRow

            if (fileRow >= editor.buffer.lineCount()) {
                terminal.moveTo(screenRow + 2, 1)
                terminal.write(`${MUTED}  ~${RESET}`)
                continue
            }

            this.drawLine(fileRow, screenRow, columns)
        }

        this.drawStatus(columns)
        this.drawFooter(columns)
        this.positionCursor()

        terminal.showCursor()
    }

    drawHeader(columns) {
        const editor = this.editor
        const fileName = editor.buffer.fileName || "[No Name]"
        const modified = editor.buffer.modified ? " ●" : ""
        const title = `  SHARA ${DIM}›${RESET} ${WHITE}${fileName}${RESET}${YELLOW}${modified}${RESET}`
        const label = " NODE.JS EDITOR "

        terminal.moveTo(1, 1)
        terminal.write(
            `${BG}${GREEN}  SHARA-Editor  ${RESET}${BG}${DIM}│${RESET}${BG}${WHITE} ${fileName}${modified} ${RESET}`
        )

        const used = 20 + fileName.length + modified.length
        const remaining = Math.max(0, columns - used - label.length)

        terminal.write(
            `${BG}${MUTED}${"─".repeat(remaining)}${RESET}${DIM}${label}${RESET}\n`
        )
    }

    drawLine(row, screenRow, columns) {
        const editor = this.editor
        const line = editor.buffer.getLine(row)
        const numberWidth = Math.max(4, String(editor.buffer.lineCount()).length)
        const number = String(row + 1).padStart(numberWidth, " ")
        const lineWidth = Math.max(0, columns - numberWidth - 4)
        const language = detectLanguage(editor.buffer.fileName)
        const visibleLine = highlight(line.slice(0, lineWidth), language)
        const current = row === editor.y

        terminal.moveTo(screenRow + 2, 1)

        const numberColor = current ? GREEN : MUTED
        const marker = current ? `${GREEN}›${RESET}` : " "

        terminal.write(
            `${marker}${numberColor}${number}${RESET} ${DIM}│${RESET} ${WHITE}${visibleLine}${RESET}`
        )
    }

    drawStatus(columns) {
        const editor = this.editor
        const { rows } = terminal.size()

        let modeColor = GREEN
        let mode = editor.mode

        if (mode === "INSERT") {
            modeColor = "\x1b[38;5;81m"
        } else if (mode === "COMMAND" || mode === "SEARCH") {
            modeColor = YELLOW
        }

        let left = ` ${mode} `

        if (mode === "COMMAND") {
            left += `:${editor.command}`
        } else if (mode === "SEARCH") {
            left += `/${editor.searchTerm}`
        }

        const right = `Ln ${editor.y + 1}, Col ${editor.x + 1} `
        const gap = Math.max(1, columns - left.length - right.length)

        terminal.moveTo(rows - 1, 1)
        terminal.write(
            `${modeColor}${left}${RESET}${BG}${" ".repeat(gap)}${DIM}${right}${RESET}`
        )
    }

    drawFooter(columns) {
        const { rows } = terminal.size()
        const text = "  h j k l  Move   i  Insert   :w  Save   :q  Quit   /  Search"
        const footer = text.slice(0, columns).padEnd(columns, " ")

        terminal.moveTo(rows, 1)
        terminal.write(`${DIM}${footer}${RESET}`)
    }

    positionCursor() {
        const editor = this.editor
        const { rows, columns } = terminal.size()
        const visibleRows = Math.max(1, rows - 3)

        const screenY = editor.y - editor.scrollY + 2
        const screenX = editor.x + 7

        if (screenY >= 2 && screenY < visibleRows + 2) {
            terminal.moveTo(
                screenY,
                Math.min(screenX, columns)
            )
        }
    }
}

export default Renderer
