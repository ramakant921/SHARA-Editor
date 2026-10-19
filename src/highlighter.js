
const RESET = "\x1b[0m"
const PURPLE = "\x1b[38;5;183m"
const GREEN = "\x1b[38;5;114m"
const ORANGE = "\x1b[38;5;209m"
const BLUE = "\x1b[38;5;111m"
const GRAY = "\x1b[38;5;244m"
const CYAN = "\x1b[38;5;116m"
const YELLOW = "\x1b[38;5;221m"

const keywords = new Set([
    "const", "let", "var", "function", "return",
    "class", "new", "this", "if", "else", "for",
    "while", "do", "switch", "case", "break",
    "continue", "try", "catch", "finally", "throw",
    "import", "from", "export", "default", "extends",
    "super", "static", "async", "await", "typeof",
    "instanceof", "in", "of", "delete", "void",
    "true", "false", "null", "undefined"
])

function highlight(line) {
    let result = ""
    let i = 0

    while (i < line.length) {
        const char = line[i]
        const next = line[i + 1]

        if (char === "/" && next === "/") {
            result += `${GRAY}${line.slice(i)}${RESET}`
            break
        }

        if (char === "/" && next === "*") {
            const end = line.indexOf("*/", i + 2)
            const stop = end === -1 ? line.length : end + 2

            result += `${GRAY}${line.slice(i, stop)}${RESET}`
            i = stop
            continue
        }

        if (char === '"' || char === "'" || char === "`") {
            let end = i + 1

            while (end < line.length) {
                if (line[end] === "\\") {
                    end += 2
                    continue
                }

                if (line[end] === char) {
                    end++
                    break
                }

                end++
            }

            result += `${GREEN}${line.slice(i, end)}${RESET}`
            i = end
            continue
        }

        if (/[0-9]/.test(char)) {
            let end = i + 1

            while (end < line.length && /[0-9.]/.test(line[end])) {
                end++
            }

            result += `${ORANGE}${line.slice(i, end)}${RESET}`
            i = end
            continue
        }

        if (/[A-Za-z_$]/.test(char)) {
            let end = i + 1

            while (end < line.length && /[\w$]/.test(line[end])) {
                end++
            }

            const word = line.slice(i, end)
            const following = line.slice(end).trimStart()

            if (keywords.has(word)) {
                result += `${PURPLE}${word}${RESET}`
            } else if (following.startsWith("(")) {
                result += `${BLUE}${word}${RESET}`
            } else if (/^[A-Z]/.test(word)) {
                result += `${CYAN}${word}${RESET}`
            } else {
                result += word
            }

            i = end
            continue
        }

        if ("=+-*/%<>!&|?:".includes(char)) {
            result += `${YELLOW}${char}${RESET}`
            i++
            continue
        }

        result += char
        i++
    }

    return result
}

export default highlight
