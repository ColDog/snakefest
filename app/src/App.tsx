import React, { Component } from "react";
import AceEditor from "react-ace";
import Learn from "./Learn";
import { v4 as uuid } from "uuid";
import * as api from "./api";

import "brace/mode/javascript";
import "brace/theme/clouds_midnight";
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
      this.frame.src = this.frame.src;
    }
  };

  render() {
    const { id, code, gameUrl, logs } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <code>{api.snakeUrl(id)}</code>
          <h1>SnakeFest</h1>
        </header>

        <div className="App-row">
          <div className="App-col App-col-light">
            <div className="App-col-header App-col-header-light">
              <p>Learn</p>
            </div>

            <div className="App-learn">
              <Learn />
            </div>
          </div>

          <div className="App-col App-col-editor">
            <div className="App-col-header App-col-header-dark">
              <button className="light" onClick={this.onSave}>
                Save
              </button>
            </div>
            <AceEditor
              width="100%"
              height="100%"
              fontSize={16}
              value={code}
              mode="javascript"
              theme="clouds_midnight"
              onChange={this.onChange}
            />
          </div>

          <div className="App-col App-col-game">
            <div className="App-col-header App-col-header-light">
              <button onClick={this.onPlay}>Play</button>
              <button onClick={this.onReload}>Replay</button>
            </div>

            <div className="App-game">
              {!gameUrl && <h3 className="App-game-empty">Start a game</h3>}
              {gameUrl && (
                <iframe
                  ref={ref => {
                    this.frame = ref;
                  }}
                  height="500"
                  width="100%"
                  frameBorder="0"
                  src={gameUrl}
                />
              )}
            </div>

            <div className="App-game-logs">
              <div className="App-game-logs-header">Console</div>
              <div className="App-game-logs-console">
                <pre>
                  <code>{logs}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        <footer className="App-footer" />
      </div>
    );
  }
}

export default App;
