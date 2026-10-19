
import path from "node:path"

const extensions = {
    ".js": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".json": "json",
    ".html": "html",
    ".htm": "html",
    ".css": "css"
}

function detectLanguage(fileName) {
    if (!fileName) {
        return "plain"
    }

    const extension = path.extname(fileName).toLowerCase()

    return extensions[extension] || "plain"
}

export default detectLanguage
