/// <reference types="react-scripts" />

declare module "*.md";

declare module "snarkdown" {
  function md(doc: string): string;
  export = md
}
