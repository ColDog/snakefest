import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import { v4 as uuid } from "uuid";
import * as api from "./api";

const styles = {
  panel: {
    width: "50%"
  },
  container: {
    height: "100%"
  }
};

class App extends Component {
  state = { code: "", id: uuid().toString(), gameUrl: null };

  editorDidMount = (editor: any) => {
    editor.focus();
  };

  onChange = (code: string) => {
    this.setState({ code });
  };

  onSave = async () => {
    const { id, code } = this.state;
    await api.save(id, code);
  };

  onPlay = async () => {
    const { id } = this.state;
    const gameUrl = await api.run(id);
    this.setState({ gameUrl });
  };

  render() {
    const { code, gameUrl } = this.state;

    return (
      <div style={styles.container}>
        <header>
          <h1>SnakeFest</h1>
        </header>

        <div>
          <button>Save</button>
          <button>Play</button>
        </div>

        <div style={styles.panel}>
          <MonacoEditor
            width="100%"
            height="70vh"
            value={code}
            onChange={this.onChange}
            editorDidMount={this.editorDidMount}
          />
        </div>

        <div>{gameUrl && <iframe src={gameUrl} />}</div>
      </div>
    );
  }
}

export default App;
