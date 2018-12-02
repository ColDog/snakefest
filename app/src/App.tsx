import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import { v4 as uuid } from "uuid";
import * as api from "./api";

import './App.css';

class App extends Component {
  frame: any = null;
  state = {
    code: "",
    id: uuid().toString(),
    gameUrl: encodeURI(
      "https://board.battlesnake.io?engine=https://engine.battlesnake.io&game=26f7016b-e743-43bf-b4d8-8aa6094d6c22"
    )
  };

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

  onReload = () => {
    if (this.frame) {
      this.frame.location.reload();
    }
  };

  render() {
    const { id, code, gameUrl } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1>SnakeFest</h1>
          <code>{api.snakeUrl(id)}</code>
        </header>

        <div className="App-row">
          <div className="App-col App-col-editor">
            <div>
              <button className="light" onClick={this.onSave}>Save</button>
            </div>
            <MonacoEditor
              width="100%"
              height="100%"
              value={code}
              options={{
                automaticLayout: true,
                minimap: {
                  enabled: false,
                }
              }}
              onChange={this.onChange}
              editorDidMount={this.editorDidMount}
              language="javascript"
              theme="vs-dark"
            />
          </div>
          <div className="App-col App-col-game">
            <div className="App-col-game-header">
              <button onClick={this.onPlay}>Play</button>
              <button onClick={this.onPlay}>Replay</button>
            </div>
            {gameUrl && (
              <iframe
                ref={ref => {
                  this.frame = ref;
                }}
                height="100%"
                width="100%"
                frameBorder="0"
                src={gameUrl}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
