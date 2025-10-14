import { argv } from "node:process";
import entryFile from "./models/entryFile";
import { startMenu } from "./models/Menu";
import { parseGraph } from "./graph/Parser";

async function main() {
  const filePath = argv[2];
  const format = argv[3];

  const rawGraph = entryFile.read(filePath);
  if (!rawGraph) return;

  await startMenu(parseGraph(rawGraph, format), format);
}

main();
