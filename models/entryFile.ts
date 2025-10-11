import { readFileSync } from "node:fs";
import entryFile from "../constants/entryFile";
import { Node } from "../graph/Node";
import { Edge } from "../graph/Edge";

export function read(filePath: string) {
  function readFile(filePath: string) {
    if (!filePath)
      throw new Error("[ERRO] Usagem incorreta. Use: npm start <arquivo>");

    const fileData = readFileSync(filePath, {
      encoding: "utf8",
    });

    return fileData;
  }

  function getLines(fileData: string) {
    return fileData.split("\n");
  }

  function extractDataFromLines(fileLines: string[]) {
    const numVertices = Number(fileLines[0]);

    if (isNaN(numVertices))
      throw new Error(
        "[ERRO] Número de vértices especificado incorretamente ou não especificado."
      );

    fileLines.shift();

    let nodes: Node<unknown>[] = [];
    let edges: Edge<unknown>[] = [];

    fileLines.forEach((line) => {
      if (line === entryFile.LAST_LINE) return { nodes, edges };

      // TODO
    });
  }

  let fileData: string = "";

  try {
    fileData = readFile(filePath);
  } catch (error) {
    console.error("[ERRO] Não foi possível ler o arquivo.");

    if (error instanceof Error) console.error(error.message);

    return;
  }

  try {
    return extractDataFromLines(getLines(fileData));
  } catch (error) {
    console.error("[ERRO] Erro ao interpretar arquivo.");
    if (error instanceof Error) console.error(error.message);
    return;
  }
}

export default {
  read,
};
