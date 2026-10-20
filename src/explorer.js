
import fs from "node:fs"
import path from "node:path"
import * as terminal from "./terminal.js"

const RESET = "\x1b[0m"
const GREEN = "\x1b[38;5;114m"
const BLUE = "\x1b[38;5;111m"
const GRAY = "\x1b[38;5;244m"
const WHITE = "\x1b[38;5;252m"
const YELLOW = "\x1b[38;5;221m"
const BG = "\x1b[48;5;236m"

class Explorer {
    constructor(editor, startPath = process.cwd()) {
        this.editor = editor
        this.currentPath = path.resolve(startPath)
        this.selected = 0
        this.entries = []
        this.scrollY = 0
        this.active = true

        this.loadEntries()
    }

    loadEntries() {
        try {
            const names = fs.readdirSync(this.currentPath, {
                withFileTypes: true
            })

            this.entries = names
                .filter(entry => entry.name.startsWith(".") || !entry.name.startsWith("."))
                .map(entry => ({
                    name: entry.name,
                    isDirectory: entry.isDirectory(),
                    fullPath: path.join(this.currentPath, entry.name)
                }))
                .sort((a, b) => {
                    if (a.isDirectory !== b.isDirectory) {
                        return a.isDirectory ? -1 : 1
                    }

                    return a.name.localeCompare(b.name)
                })

            this.entries.unshift({
                name: "..",
                isDirectory: true,
                fullPath: path.dirname(this.currentPath)
            })

            this.selected = Math.min(
                this.selected,
                this.entries.length - 1
            )

            if (this.selected < 0) {
                this.selected = 0
            }
        } catch {
            this.entries = []
            this.editor.message = "Cannot read directory"
        }
    }

    draw() {
        const { rows, columns } = terminal.size()
        const visibleRows = Math.max(1, rows - 4)

        terminal.clear()
        terminal.hideCursor()

        terminal.moveTo(1, 1)
        terminal.write(
            `${BG}${GREEN}  SHARA-Explorer  ${RESET} ${WHITE}${this.currentPath}${RESET}`
        )

        for (let screenRow = 0; screenRow < visibleRows; screenRow++) {
            const index = this.scrollY + screenRow
            const entry = this.entries[index]
            const terminalRow = screenRow + 3

            terminal.moveTo(terminalRow, 1)
            terminal.write(" ".repeat(columns))

            if (!entry) {
                continue
            }

            const selected = index === this.selected
            const marker = selected ? "›" : " "
            const icon = entry.isDirectory ? "▸" : " "
            const color = entry.isDirectory ? BLUE : WHITE
            const name = `${icon} ${entry.name}`.slice(0, Math.max(0, columns - 5))

            terminal.moveTo(terminalRow, 1)
            terminal.write(
                `${selected ? BG + GREEN : color}${marker} ${name}${RESET}`
            )
        }

        terminal.moveTo(rows - 1, 1)
        terminal.write(
            `${GRAY} ↑/↓ Navigate   Enter Open   Backspace Back   q Close ${RESET}`
        )

        terminal.moveTo(rows, 1)
        terminal.write(`${GRAY}${this.entries.length} entries${RESET}`)

        terminal.showCursor()
    }

    updateScroll() {
        const { rows } = terminal.size()
        const visibleRows = Math.max(1, rows - 4)

        if (this.selected < this.scrollY) {
            this.scrollY = this.selected
        }

        if (this.selected >= this.scrollY + visibleRows) {
            this.scrollY = this.selected - visibleRows + 1
        }

        this.scrollY = Math.max(0, this.scrollY)
    }

    openSelected() {
        const entry = this.entries[this.selected]

        if (!entry) {
            return
        }

        if (entry.isDirectory) {
            this.currentPath = entry.fullPath
            this.selected = 0
            this.scrollY = 0
            this.loadEntries()
            return
        }

        this.active = false
        this.editor.openFile(entry.fullPath)
        this.editor.explorer = null
        this.editor.render()
    }

    handleKey(key) {
        if (key === "q" || key === "\x1b") {
            this.active = false
            this.editor.explorer = null
            this.editor.render()
            return
        }

        if (key === "\x1b[A" || key === "k") {
            this.selected = Math.max(0, this.selected - 1)
        } else if (key === "\x1b[B" || key === "j") {
            this.selected = Math.min(
            this.entries.length - 1,
            this.selected + 1
        )
        } else if (
            key === "\r" || key === "\n" || key === "\r\n") {
            this.openSelected()

            if(this.active){
                this.updateScroll()
                this.draw()
            }

        return
        } else if (key === "\x7f" || key === "\b") {
            this.currentPath = path.dirname(this.currentPath)
            this.selected = 0
            this.scrollY = 0
            this.loadEntries()
        } else if (key === "d") {
            this.createDirectory()
            return
        }

        this.updateScroll()
        this.draw()
    }

    createDirectory() {
        const name = this.editor.prompt("Directory name:")

        if (!name || !name.trim()) {
            return
        }

        const directoryPath = path.join(this.currentPath, name.trim())

        try {
            fs.mkdirSync(directoryPath)
            this.loadEntries()
            this.updateScroll()
            this.draw()
        } catch (error) {
            this.editor.message = `Cannot create directory: ${error.message}`
            this.draw()
        }
    }
}

export default Explorer
