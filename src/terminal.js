const stdin = process.stdin;
const stdout = process.stdout;

function setup() {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
}

function restore() {
    if (stdin.isTTY) {
        stdin.setRawMode(false);
    }

    stdin.pause();

    stdout.write("\x1b[?25h");
    stdout.write("\x1b[0m");
    stdout.write("\x1b[2J\x1b[H");
}

function clear() {
    stdout.write("\x1b[2J\x1b[H");
}

function hideCursor() {
    stdout.write("\x1b[?25l");
}

function showCursor() {
    stdout.write("\x1b[?25h");
}

function moveTo(row, column) {
    stdout.write(`\x1b[${row};${column}H`);
}

function write(text) {
    stdout.write(text);
}

function size() {
    return {
        rows: stdout.rows || 24,
        columns: stdout.columns || 80
    };
}

module.exports = {
    setup,
    restore,
    clear,
    hideCursor,
    showCursor,
    moveTo,
    write,
    size
};