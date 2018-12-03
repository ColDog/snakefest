import React from "react";
import md from "snarkdown";
import basicSnake from "./tutorials/1-basic-snake.md";

async function markdown(url: string) {
  const res = await fetch(url);
  const doc = await res.text();
  return md(doc);
}

class Markdown extends React.Component<{ url: string }> {
  state = { md: "" };

  async componentDidMount() {
    const md = await markdown(this.props.url);
    this.setState({ md });
  }

  render() {
    const { md } = this.state;
    return <div dangerouslySetInnerHTML={{ __html: md }} />;
  }
}

const Learn = () => <Markdown url={basicSnake} />;

export default Learn;
