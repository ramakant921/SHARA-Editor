class Modes{
  handleNormal(editor, key) {

    if (editor.pendingKey === "d") {

      if (key === "d") {
        editor.deleteLine();
      }

      editor.pendingKey = "";

      return;
    }

    if (editor.pendingKey === "y") {

      if (key === "y") {
        editor.copyLine();
      }

      editor.pendingKey = "";

      return;
    }

    if (editor.pendingKey === "g") {

      if (key === "g") {
        editor.fileStart();
      }

      editor.pendingKey = "";

      return;
    }

    /*
      * ARROW KEYS
      */

      if (key === "\x1b[D") {
        editor.moveLeft();
      }

    else if (key === "\x1b[C") {
      editor.moveRight();
    }

    else if (key === "\x1b[A") {
      editor.moveUp();
    }

    else if (key === "\x1b[B") {
      editor.moveDown();
    }

    /*
      * VIM MOVEMENT
      */

      else if (key === "h") {
        editor.moveLeft();
      }

    else if (key === "j") {
      editor.moveDown();
    }

    else if (key === "k") {
      editor.moveUp();
    }

    else if (key === "l") {
      editor.moveRight();
    }

    else if (key === "w") {
      editor.wordForward();
    }

    else if (key === "b") {
      editor.wordBackward();
    }

    else if (key === "0") {
      editor.lineStart();
    }

    else if (key === "$") {
      editor.lineEnd();
    }

    else if (key === "G") {
      editor.fileEnd();
    }

    else if (key === "g") {
      editor.pendingKey = "g";
    }

    /*
      * DELETE
      */

      else if (key === "d") {
        editor.pendingKey = "d";
      }

    else if (key === "x") {
      editor.deleteCharacter();
    }

    /*
      * COPY / PASTE
      */

      else if (key === "y") {
        editor.pendingKey = "y";
      }

    else if (key === "p") {
      editor.pasteLine();
    }

    /*
      * UNDO / REDO
      */

      else if (key === "u") {
        editor.undo();
      }

    else if (key === "\u0012") {
      editor.redo();
    }

    /*
      * INSERT MODES
      */

      else if (key === "i") {
        editor.mode = "INSERT";
      }

    else if (key === "a") {
      editor.moveRight();

      editor.mode = "INSERT";
    }

    else if (key === "A") {
      editor.lineEnd();

      editor.mode = "INSERT";
    }

    else if (key === "I") {
      editor.lineStart();

      editor.mode = "INSERT";
    }

    else if (key === "o") {
      editor.newLineBelow();

      editor.mode = "INSERT";
    }

    else if (key === "O") {
      editor.newLineAbove();

      editor.mode = "INSERT";
    }

    /*
      * COMMAND MODE
      */

      else if (key === ":") {
        editor.mode = "COMMAND";

        editor.command = "";
      }

    /*
      * SEARCH
      */

      else if (key === "/") {
        editor.mode = "SEARCH";

        editor.searchTerm = "";
      }

    /*
      * CTRL+C
      */

      else if (key === "\u0003") {
        editor.quit();
      }
  }

  handleInsert(editor, key) {

    /*
      * ESC
      */

      if (key === "\u001b") {
        editor.mode = "NORMAL";

        editor.keepCursorValid();

        return;
      }

    /*
      * ENTER
      */

      if (key === "\r") {
        editor.splitLine();

        return;
      }

    /*
      * BACKSPACE
      */

      if (key === "\u007f") {
        editor.backspace();

        return;
      }

    /*
      * TAB
      */

      if (key === "\t") {
        editor.insertTab();

        return;
      }

    /*
      * ARROW KEYS
      */

      if (key === "\x1b[D") {
        editor.moveLeft();

        return;
      }

    if (key === "\x1b[C") {
      editor.moveRight();

      return;
    }

    if (key === "\x1b[A") {
      editor.moveUp();

      return;
    }

    if (key === "\x1b[B") {
      editor.moveDown();

      return;
    }

    /*
      * CTRL+C
      */

      if (key === "\u0003") {
        editor.quit();

        return;
      }

    /*
      * NORMAL CHARACTER
      */

      if (
        key.length === 1 &&
        key >= " "
      ) {
        editor.insertCharacter(key);
      }
  }

  handleCommand(editor, key) {

    if (key === "\u001b") {
      editor.cancelCommand()
      return;
    }

    if (key === "\r") {
      editor.executeCommand();

      return;
    }

    if (key === "\u007f") {
      editor.command =
        editor.command.slice(0, -1);

      return;
    }

    if (key.length === 1) {
      editor.command += key;
    }
  }

  handleSearch(editor, key) {
    if (key === "\u001b") {
      editor.cancelSearch()
      return
    }

    if (key === "\r") {
      editor.submitSearch()
      return
    }

    if (key === "\u007f") {
      editor.removeSearchCharacter()
      return
    }

    if (key.length === 1) {
      editor.updateSearchTerm(key)
    }
  }

  handleKey(editor, key) {
    if (!editor.running) {
      return;
    }

    if (editor.mode === "NORMAL") {
      this.handleNormal(editor, key);
    }

    else if (editor.mode === "INSERT") {
      this.handleInsert(editor, key);
    }

    else if (editor.mode === "COMMAND") {
      this.handleCommand(editor, key);
    }

    else if (editor.mode === "SEARCH") {
      this.handleSearch(editor, key);
    }

    editor.render();
  }
}

export default Modes
