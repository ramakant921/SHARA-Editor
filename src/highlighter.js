
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

function highlightJavaScript(line, state) {
    let result = ""
    let i = 0

    while (i < line.length) {
        const char = line[i]
        const next = line[i + 1]

        if (state.inBlockComment) {
            const end = line.indexOf("*/", i)

            if (end === -1) {
                result += `${GRAY}${line.slice(i)}${RESET}`
                break
            }

            result += `${GRAY}${line.slice(i, end + 2)}${RESET}`
            i = end + 2
            state.inBlockComment = false
            continue
        }

        if (state.inTemplate) {
            let end = i

            while (end < line.length) {
                if (line[end] === "\\") {
                    end += 2
                    continue
                }

                if (line[end] === "`") {
                    end++
                    state.inTemplate = false
                    break
                }

                end++
            }

            result += `${GREEN}${line.slice(i, end)}${RESET}`
            i = end
            continue
        }

        if (char === "/" && next === "/") {
            result += `${GRAY}${line.slice(i)}${RESET}`
            break
        }

        if (char === "/" && next === "*") {
            const end = line.indexOf("*/", i + 2)

            if (end === -1) {
                result += `${GRAY}${line.slice(i)}${RESET}`
                state.inBlockComment = true
                break
            }

            result += `${GRAY}${line.slice(i, end + 2)}${RESET}`
            i = end + 2
            continue
        }

        if (char === '"' || char === "'") {
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

        if (char === "`") {
            let end = i + 1

            while (end < line.length) {
                if (line[end] === "\\") {
                    end += 2
                    continue
                }

                if (line[end] === "`") {
                    end++
                    break
                }

                end++
            }

            if (end > line.length || line[end - 1] !== "`") {
                state.inTemplate = true
            }

            result += `${GREEN}${line.slice(i, end)}${RESET}`
            i = end
            continue
        }

        if (/[0-9]/.test(char)) {
            let end = i + 1

            while (end < line.length && /[\w.]/.test(line[end])) {
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

function highlightJSON(line) {
    return line.replace(
        /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|[{}[\]:,]/g,
        (match, string, colon, literal) => {
            if (string) {
                return colon
                    ? `${CYAN}${string}${RESET}${YELLOW}${colon}${RESET}`
                    : `${GREEN}${string}${RESET}`
            }

            if (literal) {
                return `${PURPLE}${match}${RESET}`
            }

            if (/^-?\d/.test(match)) {
                return `${ORANGE}${match}${RESET}`
            }

            return `${YELLOW}${match}${RESET}`
        }
    )
}

function highlightHTML(line, state) {
    if (state.inHTMLComment) {
        const end = line.indexOf("-->")

        if (end === -1) {
            return `${GRAY}${line}${RESET}`
        }

        state.inHTMLComment = false
        return `${GRAY}${line.slice(0, end + 3)}${RESET}` +
            highlightHTML(line.slice(end + 3), state)
    }

    const commentStart = line.indexOf("<!--")

    if (commentStart !== -1) {
        const end = line.indexOf("-->", commentStart + 4)

        if (end === -1) {
            state.inHTMLComment = true
            return line.slice(0, commentStart) +
                `${GRAY}${line.slice(commentStart)}${RESET}`
        }

        return line.slice(0, commentStart) +
            `${GRAY}${line.slice(commentStart, end + 3)}${RESET}` +
            highlightHTML(line.slice(end + 3), state)
    }

    return line.replace(
        /<\/?[\w-]+|\/?>|([\w-]+)(=)|("(?:\\.|[^"])*"|'(?:\\.|[^'])*')/g,
        (match, attribute, equals, quote) => {
            if (quote) return `${GREEN}${match}${RESET}`
            if (attribute) {
                return `${BLUE}${attribute}${RESET}${YELLOW}${equals}${RESET}`
            }
            return `${CYAN}${match}${RESET}`
        }
    )
}

function highlightCSS(line, state) {
    let result = ""
    let i = 0

    while (i < line.length) {
        if (state.inCSSComment) {
            const end = line.indexOf("*/", i)

            if (end === -1) {
                result += `${GRAY}${line.slice(i)}${RESET}`
                break
            }

            result += `${GRAY}${line.slice(i, end + 2)}${RESET}`
            i = end + 2
            state.inCSSComment = false
            continue
        }

        if (line.startsWith("/*", i)) {
            const end = line.indexOf("*/", i + 2)

            if (end === -1) {
                result += `${GRAY}${line.slice(i)}${RESET}`
                state.inCSSComment = true
                break
            }

            result += `${GRAY}${line.slice(i, end + 2)}${RESET}`
            i = end + 2
            continue
        }

        if (line[i] === '"' || line[i] === "'") {
            const quote = line[i]
            let end = i + 1

            while (end < line.length) {
                if (line[end] === "\\") {
                    end += 2
                    continue
                }

                if (line[end] === quote) {
                    end++
                    break
                }

                end++
            }

            result += `${GREEN}${line.slice(i, end)}${RESET}`
            i = end
            continue
        }

        const rest = line.slice(i)
        const color = rest.match(/^#[\da-fA-F]{3,8}\b/)

        if (color) {
            result += `${ORANGE}${color[0]}${RESET}`
            i += color[0].length
            continue
        }

        const word = rest.match(/^[A-Za-z_-][\w-]*/)

        if (word) {
            let next = i + word[0].length

            while (next < line.length && /\s/.test(line[next])) {
                next++
            }

            result += line[next] === ":"
                ? `${BLUE}${word[0]}${RESET}`
                : `${CYAN}${word[0]}${RESET}`

            i += word[0].length
            continue
        }

        if (/[0-9]/.test(line[i])) {
            const number = rest.match(/^[\d.]+(?:px|rem|em|%|vh|vw|s|ms)?/i)

            if (number) {
                result += `${ORANGE}${number[0]}${RESET}`
                i += number[0].length
                continue
            }
        }

        if ("{}:;(),".includes(line[i])) {
            result += `${YELLOW}${line[i]}${RESET}`
            i++
            continue
        }

        result += line[i]
        i++
    }

    return result
}

function highlight(line, language = "plain", state = {}) {
    if (language === "javascript") {
        return highlightJavaScript(line, state)
    }

    if (language === "json") {
        return highlightJSON(line)
    }

    if (language === "html") {
        return highlightHTML(line, state)
    }

    if (language === "css") {
        return highlightCSS(line, state)
    }

    return line
}

export default highlight
