import { readFileSync } from "node:fs";
import entryFile from "../constants/entryFile";
import { Node } from "../graph/Node";
import { Edge } from "../graph/Edge";

export function read(filePath: string) {
  function readFile(filePath: string) {
    if (!filePath)
      throw new Error(
        "[ERRO] Usagem incorreta. Use: npm start <arquivo> <formato> (formatos: adjacency-matrix, incidence-matrix, incidence-list)"
      );

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

    const vertices = new Set<string>();
    const edgesData: { from: string; to: string; weight: number }[] = [];

    for (const line of fileLines) {
      const trimmed = line.trim();
      if (trimmed === entryFile.LAST_LINE) break;
      const parts = trimmed.split(/\s+/);
      if (parts.length !== 3) {
        throw new Error(`[ERRO] Formato de linha inválido: ${line}`);
      }
      const i = parts[0];
      const j = parts[1];
      const k = Number(parts[2]);
      if (isNaN(k)) {
        throw new Error(`[ERRO] Valor inválido na linha: ${line}`);
      }
      vertices.add(i);
      vertices.add(j);
      edgesData.push({ from: i, to: j, weight: k });
    }

    if (vertices.size !== numVertices) {
      throw new Error(
        `[ERRO] Número de vértices não corresponde: esperado ${numVertices}, encontrado ${vertices.size}`
      );
    }

    const nodes: Node<string>[] = [];
    const nodeMap = new Map<string, Node<string>>();
    for (const vertex of vertices) {
      const node = { value: vertex };
      nodes.push(node);
      nodeMap.set(vertex, node);
    }

    const edges: Edge<string>[] = [];
    for (const { from, to, weight } of edgesData) {
      edges.push({ from: nodeMap.get(from)!, to: nodeMap.get(to)!, weight });
    }

    return { nodes, edges };
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
