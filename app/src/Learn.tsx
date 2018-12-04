import React from "react";
import { Converter } from "showdown";
import beginner from "./tutorials/1-beginner.md";

async function markdown(url: string) {
  const res = await fetch(url);
  const doc = await res.text();
  return new Converter().makeHtml(doc);
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

const Learn = () => <Markdown url={beginner} />;

export default Learn;
