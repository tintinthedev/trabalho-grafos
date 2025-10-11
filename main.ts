import { argv } from "node:process";
import entryFile from "./models/entryFile";

function main() {
  const filePath = argv[2];

  entryFile.read(filePath);
}

main();
