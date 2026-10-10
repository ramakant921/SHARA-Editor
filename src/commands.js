function execute(editor, command) {
    switch (command) {
        case "w":
            editor.save();
            break;

        case "q":
            if (editor.buffer.modified) {
                editor.message = "No write since last change. Use :q!";
                return;
            }

            editor.quit();
            break;

        case "wq":
            editor.save();
            editor.quit();
            break;

        case "q!":
            editor.quit();
            break;

        case "wq!":
            editor.save();
            editor.quit();
            break;

        case "e":
            editor.message = "Use :e filename";
            break;

        default:
            if (command.startsWith("e ")) {
                const fileName = command.slice(2).trim();

                if (fileName) {
                    editor.openFile(fileName);
                } else {
                    editor.message = "Filename required";
                }
            } else {
                editor.message = `Unknown command: ${command}`;
            }
    }
}

export default execute;
