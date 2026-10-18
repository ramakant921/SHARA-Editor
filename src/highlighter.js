
const RESET = "\x1b[0m"
const PURPLE = "\x1b[38;5;183m"
const GREEN = "\x1b[38;5;114m"
const ORANGE = "\x1b[38;5;209m"
const BLUE = "\x1b[38;5;111m"
const GRAY = "\x1b[38;5;244m"
const CYAN = "\x1b[38;5;116m"

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
    const pattern =
        /(\/\/.*|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g

    return line.replace(pattern, (token, _, offset) => {
        const previous = line.slice(0, offset)
        const inComment = previous.lastIndexOf("//") >
            Math.max(previous.lastIndexOf('"'), previous.lastIndexOf("'"))

        if (token.startsWith("//") || token.startsWith("/*")) {
            return `${GRAY}${token}${RESET}`
        }

        if (
            token.startsWith('"') ||
            token.startsWith("'") ||
            token.startsWith("`")
        ) {
            return `${GREEN}${token}${RESET}`
        }

        if (/^\d/.test(token)) {
            return `${ORANGE}${token}${RESET}`
        }

        if (keywords.has(token)) {
            return `${PURPLE}${token}${RESET}`
        }

        if (/^[A-Z]/.test(token)) {
            return `${CYAN}${token}${RESET}`
        }

        if (/\w/.test(token) && /\($/.test(line.slice(offset + token.length, offset + token.length + 1))) {
            return `${BLUE}${token}${RESET}`
        }

        return token
    })
}

export default highlight
