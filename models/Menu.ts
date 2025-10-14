import * as readline from "readline";
import { Graph } from "../graph/GraphClasses";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

export async function startMenu(graph: Graph, format: string) {
  if (
    ["incidence-list", "incidence-matrix", "adjacency-matrix"].indexOf(
      format
    ) === -1
  ) {
    console.log(
      "[ERRO] Formato inválido. Use: incidence-list, incidence-matrix ou adjacency-matrix"
    );
    rl.close();
    return;
  }

  console.log("Bem-vindo ao analisador de grafos!");
  console.log(`Grafo carregado no formato: ${format}`);

  while (true) {
    console.log("\nMenu de Opções:");
    console.log("1. Número de arestas");
    console.log("2. Grau de entrada e saída de um vértice");
    console.log("3. Verificar se dois vértices são adjacentes");
    console.log("4. Listar vértices adjacentes a um vértice");
    console.log("5. Vértices de maior e menor grau");
    console.log("6. Caminhos mínimos a partir de um vértice (Dijkstra)");
    console.log("7. Caminhos mínimos para todos os pares (Floyd-Warshall)");
    console.log("8. Sair");

    const choice = await ask("Escolha uma opção (1-8): ");

    switch (choice) {
      case "1":
        console.log(`Número de arestas: ${graph.getNumberOfEdges()}`);
        break;
      case "2":
        await showDegrees(graph);
        break;
      case "3":
        await checkAdjacency(graph);
        break;
      case "4":
        await showAdjacents(graph);
        break;
      case "5":
        showMaxMinDegrees(graph);
        break;
      case "6":
        await showDijkstra(graph);
        break;
      case "7":
        showFloydWarshall(graph);
        break;
      case "8":
        console.log("Saindo...");
        rl.close();
        return;
      default:
        console.log("Opção inválida. Tente novamente.");
    }
  }
}

async function showDegrees(graph: Graph) {
  const vertex = await ask("Digite o rótulo do vértice: ");
  const inDeg = graph.getInDegree(vertex);
  const outDeg = graph.getOutDegree(vertex);
  console.log(`Grau de entrada de ${vertex}: ${inDeg}`);
  console.log(`Grau de saída de ${vertex}: ${outDeg}`);
}

async function checkAdjacency(graph: Graph) {
  const v1 = await ask("Digite o rótulo do primeiro vértice: ");
  const v2 = await ask("Digite o rótulo do segundo vértice: ");
  const adj = graph.areAdjacent(v1, v2);
  console.log(`${v1} e ${v2} ${adj ? "são" : "não são"} adjacentes.`);
}

async function showAdjacents(graph: Graph) {
  const vertex = await ask("Digite o rótulo do vértice: ");
  const adj = graph.getAdjacentVertices(vertex);
  console.log(`Vértices adjacentes a ${vertex}: ${adj.join(", ") || "nenhum"}`);
}

function showMaxMinDegrees(graph: Graph) {
  const { max, min } = graph.getMaxMinDegreeNodes();
  console.log(`Vértices de maior grau: ${max.join(", ")}`);
  console.log(`Vértices de menor grau: ${min.join(", ")}`);
}

async function showDijkstra(graph: Graph) {
  const start = await ask("Digite o rótulo do vértice inicial: ");
  try {
    const result = graph.dijkstra(start);
    console.log(`Caminhos mínimos a partir de ${start}:`);
    for (const [vertex, { distance, path }] of Object.entries(result)) {
      console.log(
        `  ${vertex}: Distância ${
          distance === Infinity ? "∞" : distance
        }, Caminho: ${path.join(" -> ")}`
      );
    }
  } catch (error) {
    console.log((error as Error).message);
  }
}

function showFloydWarshall(graph: Graph) {
  const distances = graph.floydWarshall();
  console.log("Matriz de distâncias mínimas (Floyd-Warshall):");
  const vertices = Object.keys(distances);
  console.log("   " + vertices.join("  "));
  for (const u of vertices) {
    let row = `${u} `;
    for (const v of vertices) {
      const d = distances[u][v];
      row += `${d === Infinity ? "∞" : d} `;
    }
    console.log(row);
  }
}
