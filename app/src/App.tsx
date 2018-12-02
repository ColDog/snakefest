import React, { Component } from "react";
import AceEditor from "react-ace";

import { v4 as uuid } from "uuid";
import * as api from "./api";

import "brace/mode/javascript";
import "brace/theme/monokai";
import "./App.css";

class App extends Component {
  frame: any = null;
  state = {
    code: localStorage.getItem("gameCode") || "",
    logs: "",
    id: localStorage.getItem("gameId") || uuid().toString(),
    gameUrl: null
  };

  pollLogs = async () => {
    const { id } = this.state;
    const logs = await api.logs(id);
    this.setState({ logs });
  };

  componentDidMount() {
    setInterval(this.pollLogs, 1000);
  }

  onChange = (code: string) => {
    this.setState({ code });
    localStorage.setItem("gameCode", code);
    localStorage.setItem("gameId", this.state.id);
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
    const { id, code, gameUrl, logs } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1>SnakeFest</h1>
          <code>{api.snakeUrl(id)}</code>
        </header>

        <div className="App-row">
          <div className="App-col App-col-editor">
            <div>
              <button className="light" onClick={this.onSave}>
                Save
              </button>
            </div>
            <AceEditor
              width="100%"
              height="100%"
              value={code}
              mode="javascript"
              theme="monokai"
              onChange={this.onChange}
            />
          </div>
          <div className="App-col App-col-game">
            <div className="App-col-game-header">
              <button onClick={this.onPlay}>Play</button>
              <button onClick={this.onPlay}>Replay</button>
            </div>
            {gameUrl && (
              <iframe
                className="App-game"
                ref={ref => {
                  this.frame = ref;
                }}
                height="400"
                width="100%"
                frameBorder="0"
                src={gameUrl}
              />
            )}

            <div className="App-game-logs">
              <pre>
                <code>{logs}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
