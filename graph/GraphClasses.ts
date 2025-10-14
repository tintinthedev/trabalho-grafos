import { Node } from "./Node";
import { Edge } from "./Edge";

export interface Graph {
  getNumberOfEdges(): number;
  getInDegree(nodeLabel: string): number;
  getOutDegree(nodeLabel: string): number;
  areAdjacent(node1Label: string, node2Label: string): boolean;
  getAdjacentVertices(nodeLabel: string): string[];
  getMaxMinDegreeNodes(): { max: string[]; min: string[] };
  dijkstra(startVertex: string): {
    [vertex: string]: { distance: number; path: string[] };
  };
  floydWarshall(): { [u: string]: { [v: string]: number } };
}

export class IncidenceListGraph implements Graph {
  private list: Map<Node<string>, Edge<string>[]>;
  private nodes: Node<string>[];
  private nodeMap: Map<string, Node<string>>;

  constructor(nodes: Node<string>[], edges: Edge<string>[]) {
    this.nodes = nodes;
    this.nodeMap = new Map(nodes.map((n) => [n.value, n]));
    this.list = new Map();
    for (const node of nodes) {
      this.list.set(node, []);
    }
    for (const edge of edges) {
      this.list.get(edge.from)!.push(edge);
    }
  }

  getNumberOfEdges(): number {
    return Array.from(this.list.values()).reduce(
      (sum, edges) => sum + edges.length,
      0
    );
  }

  getInDegree(nodeLabel: string): number {
    const node = this.nodeMap.get(nodeLabel);
    if (!node) return 0;
    return Array.from(this.list.values()).reduce(
      (sum, edges) => sum + edges.filter((e) => e.to === node).length,
      0
    );
  }

  getOutDegree(nodeLabel: string): number {
    const node = this.nodeMap.get(nodeLabel);
    if (!node) return 0;
    return this.list.get(node)!.length;
  }

  areAdjacent(node1Label: string, node2Label: string): boolean {
    const node1 = this.nodeMap.get(node1Label);
    const node2 = this.nodeMap.get(node2Label);
    if (!node1 || !node2) return false;
    return (
      this.list.get(node1)!.some((e) => e.to === node2) ||
      this.list.get(node2)!.some((e) => e.to === node1)
    );
  }

  getAdjacentVertices(nodeLabel: string): string[] {
    const node = this.nodeMap.get(nodeLabel);
    if (!node) return [];
    const adj = new Set<Node<string>>();
    this.list.get(node)!.forEach((e) => adj.add(e.to));
    Array.from(this.list.values()).forEach((edges) =>
      edges.forEach((e) => {
        if (e.to === node) adj.add(e.from);
      })
    );
    return Array.from(adj).map((n) => n.value);
  }

  getMaxMinDegreeNodes(): { max: string[]; min: string[] } {
    const degrees = this.nodes.map((node) => ({
      label: node.value,
      degree: this.getInDegree(node.value) + this.getOutDegree(node.value),
    }));
    const maxDeg = Math.max(...degrees.map((d) => d.degree));
    const minDeg = Math.min(...degrees.map((d) => d.degree));
    const max = degrees.filter((d) => d.degree === maxDeg).map((d) => d.label);
    const min = degrees.filter((d) => d.degree === minDeg).map((d) => d.label);
    return { max, min };
  }

  dijkstra(startVertex: string): {
    [vertex: string]: { distance: number; path: string[] };
  } {
    const startNode = this.nodeMap.get(startVertex);
    if (!startNode) throw new Error("Vértice não encontrado");
    const dist: Map<Node<string>, number> = new Map();
    const prev: Map<Node<string>, Node<string> | null> = new Map();
    const pq: [number, Node<string>][] = [];
    for (const node of this.nodes) {
      dist.set(node, Infinity);
      prev.set(node, null);
    }
    dist.set(startNode, 0);
    pq.push([0, startNode]);
    while (pq.length > 0) {
      pq.sort((a, b) => a[0] - b[0]);
      const [cost, u] = pq.shift()!;
      if (cost > dist.get(u)!) continue;
      for (const edge of this.list.get(u)!) {
        const v = edge.to;
        const alt = cost + edge.weight;
        if (alt < dist.get(v)!) {
          dist.set(v, alt);
          prev.set(v, u);
          pq.push([alt, v]);
        }
      }
    }
    const result: { [vertex: string]: { distance: number; path: string[] } } =
      {};
    for (const node of this.nodes) {
      const path: string[] = [];
      let current: Node<string> | null = node;
      while (current) {
        path.unshift(current.value);
        current = prev.get(current)!;
      }
      result[node.value] = { distance: dist.get(node)!, path };
    }
    return result;
  }

  floydWarshall(): { [u: string]: { [v: string]: number } } {
    const n = this.nodes.length;
    const dist: number[][] = this.nodes.map(() => new Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) {
      dist[i][i] = 0;
    }
    for (const [node, edges] of this.list) {
      const u = this.nodes.indexOf(node);
      for (const edge of edges) {
        const v = this.nodes.indexOf(edge.to);
        dist[u][v] = edge.weight;
      }
    }
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
          }
        }
      }
    }
    const result: { [u: string]: { [v: string]: number } } = {};
    for (let i = 0; i < n; i++) {
      result[this.nodes[i].value] = {};
      for (let j = 0; j < n; j++) {
        result[this.nodes[i].value][this.nodes[j].value] = dist[i][j];
      }
    }
    return result;
  }
}

export class IncidenceMatrixGraph implements Graph {
  private matrix: number[][];
  private nodes: Node<string>[];
  private edges: Edge<string>[];
  private nodeMap: Map<string, Node<string>>;

  constructor(nodes: Node<string>[], edges: Edge<string>[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeMap = new Map(nodes.map((n) => [n.value, n]));
    this.matrix = nodes.map(() => new Array(edges.length).fill(0));
    edges.forEach((edge, index) => {
      const fromIndex = nodes.indexOf(edge.from);
      const toIndex = nodes.indexOf(edge.to);
      this.matrix[fromIndex][index] = 1;
      this.matrix[toIndex][index] = -1;
    });
  }

  getNumberOfEdges(): number {
    return this.edges.length;
  }

  getInDegree(nodeLabel: string): number {
    const node = this.nodeMap.get(nodeLabel);
    if (!node) return 0;
    const index = this.nodes.indexOf(node);
    return this.matrix[index].filter((val) => val === -1).length;
  }

  getOutDegree(nodeLabel: string): number {
    const node = this.nodeMap.get(nodeLabel);
    if (!node) return 0;
    const index = this.nodes.indexOf(node);
    return this.matrix[index].filter((val) => val === 1).length;
  }

  areAdjacent(node1Label: string, node2Label: string): boolean {
    const node1 = this.nodeMap.get(node1Label);
    const node2 = this.nodeMap.get(node2Label);
    if (!node1 || !node2) return false;
    const idx1 = this.nodes.indexOf(node1);
    const idx2 = this.nodes.indexOf(node2);
    for (let e = 0; e < this.edges.length; e++) {
      if (this.matrix[idx1][e] !== 0 && this.matrix[idx2][e] !== 0) return true;
    }
    return false;
  }

  getAdjacentVertices(nodeLabel: string): string[] {
    const node = this.nodeMap.get(nodeLabel);
    if (!node) return [];
    const index = this.nodes.indexOf(node);
    const adj = new Set<string>();
    for (let e = 0; e < this.edges.length; e++) {
      if (this.matrix[index][e] !== 0) {
        for (let n = 0; n < this.nodes.length; n++) {
          if (n !== index && this.matrix[n][e] !== 0) {
            adj.add(this.nodes[n].value);
          }
        }
      }
    }
    return Array.from(adj);
  }

  getMaxMinDegreeNodes(): { max: string[]; min: string[] } {
    const degrees = this.nodes.map((node) => ({
      label: node.value,
      degree: this.getInDegree(node.value) + this.getOutDegree(node.value),
    }));
    const maxDeg = Math.max(...degrees.map((d) => d.degree));
    const minDeg = Math.min(...degrees.map((d) => d.degree));
    const max = degrees.filter((d) => d.degree === maxDeg).map((d) => d.label);
    const min = degrees.filter((d) => d.degree === minDeg).map((d) => d.label);
    return { max, min };
  }

  dijkstra(startVertex: string): {
    [vertex: string]: { distance: number; path: string[] };
  } {
    // Convert to adj list for simplicity
    const adjList: Map<
      Node<string>,
      { node: Node<string>; weight: number }[]
    > = new Map();
    for (const node of this.nodes) {
      adjList.set(node, []);
    }
    for (let e = 0; e < this.edges.length; e++) {
      const edge = this.edges[e];
      const fromIndex = this.nodes.indexOf(edge.from);
      if (this.matrix[fromIndex][e] === 1) {
        adjList.get(edge.from)!.push({ node: edge.to, weight: edge.weight });
      }
    }
    const startNode = this.nodeMap.get(startVertex);
    if (!startNode) throw new Error("Vértice não encontrado");
    const dist: Map<Node<string>, number> = new Map();
    const prev: Map<Node<string>, Node<string> | null> = new Map();
    const pq: [number, Node<string>][] = [];
    for (const node of this.nodes) {
      dist.set(node, Infinity);
      prev.set(node, null);
    }
    dist.set(startNode, 0);
    pq.push([0, startNode]);
    while (pq.length > 0) {
      pq.sort((a, b) => a[0] - b[0]);
      const [cost, u] = pq.shift()!;
      if (cost > dist.get(u)!) continue;
      for (const { node: v, weight } of adjList.get(u)!) {
        const alt = cost + weight;
        if (alt < dist.get(v)!) {
          dist.set(v, alt);
          prev.set(v, u);
          pq.push([alt, v]);
        }
      }
    }
    const result: { [vertex: string]: { distance: number; path: string[] } } =
      {};
    for (const node of this.nodes) {
      const path: string[] = [];
      let current: Node<string> | null = node;
      while (current) {
        path.unshift(current.value);
        current = prev.get(current)!;
      }
      result[node.value] = { distance: dist.get(node)!, path };
    }
    return result;
  }

  floydWarshall(): { [u: string]: { [v: string]: number } } {
    const n = this.nodes.length;
    const dist: number[][] = this.nodes.map(() => new Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) {
      dist[i][i] = 0;
    }
    for (let e = 0; e < this.edges.length; e++) {
      const edge = this.edges[e];
      const u = this.nodes.indexOf(edge.from);
      const v = this.nodes.indexOf(edge.to);
      dist[u][v] = edge.weight;
    }
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
          }
        }
      }
    }
    const result: { [u: string]: { [v: string]: number } } = {};
    for (let i = 0; i < n; i++) {
      result[this.nodes[i].value] = {};
      for (let j = 0; j < n; j++) {
        result[this.nodes[i].value][this.nodes[j].value] = dist[i][j];
      }
    }
    return result;
  }
}

export class AdjacencyMatrixGraph implements Graph {
  private matrix: number[][];
  private nodes: Node<string>[];
  private nodeMap: Map<string, Node<string>>;

  constructor(nodes: Node<string>[], edges: Edge<string>[]) {
    this.nodes = nodes;
    this.nodeMap = new Map(nodes.map((n) => [n.value, n]));
    this.matrix = nodes.map(() => new Array(nodes.length).fill(0));
    edges.forEach((edge) => {
      const fromIndex = nodes.indexOf(edge.from);
      const toIndex = nodes.indexOf(edge.to);
      this.matrix[fromIndex][toIndex] = edge.weight;
    });
  }

  getNumberOfEdges(): number {
    return this.matrix.reduce(
      (sum, row) => sum + row.filter((val) => val !== 0).length,
      0
    );
  }

  getInDegree(nodeLabel: string): number {
    const node = this.nodeMap.get(nodeLabel);
    if (!node) return 0;
    const index = this.nodes.indexOf(node);
    return this.matrix.reduce(
      (sum, row) => sum + (row[index] !== 0 ? 1 : 0),
      0
    );
  }

  getOutDegree(nodeLabel: string): number {
    const node = this.nodeMap.get(nodeLabel);
    if (!node) return 0;
    const index = this.nodes.indexOf(node);
    return this.matrix[index].filter((val) => val !== 0).length;
  }

  areAdjacent(node1Label: string, node2Label: string): boolean {
    const idx1 = this.nodes.findIndex((n) => n.value === node1Label);
    const idx2 = this.nodes.findIndex((n) => n.value === node2Label);
    if (idx1 === -1 || idx2 === -1) return false;
    return this.matrix[idx1][idx2] !== 0 || this.matrix[idx2][idx1] !== 0;
  }

  getAdjacentVertices(nodeLabel: string): string[] {
    const idx = this.nodes.findIndex((n) => n.value === nodeLabel);
    if (idx === -1) return [];
    const adj = new Set<string>();
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.matrix[idx][i] !== 0) adj.add(this.nodes[i].value);
      if (this.matrix[i][idx] !== 0) adj.add(this.nodes[i].value);
    }
    adj.delete(nodeLabel);
    return Array.from(adj);
  }

  getMaxMinDegreeNodes(): { max: string[]; min: string[] } {
    const degrees = this.nodes.map((node) => ({
      label: node.value,
      degree: this.getInDegree(node.value) + this.getOutDegree(node.value),
    }));
    const maxDeg = Math.max(...degrees.map((d) => d.degree));
    const minDeg = Math.min(...degrees.map((d) => d.degree));
    const max = degrees.filter((d) => d.degree === maxDeg).map((d) => d.label);
    const min = degrees.filter((d) => d.degree === minDeg).map((d) => d.label);
    return { max, min };
  }

  dijkstra(startVertex: string): {
    [vertex: string]: { distance: number; path: string[] };
  } {
    const startIndex = this.nodes.findIndex((n) => n.value === startVertex);
    if (startIndex === -1) throw new Error("Vértice não encontrado");
    const dist: number[] = new Array(this.nodes.length).fill(Infinity);
    const prev: (number | null)[] = new Array(this.nodes.length).fill(null);
    const pq: [number, number][] = [];
    dist[startIndex] = 0;
    pq.push([0, startIndex]);
    while (pq.length > 0) {
      pq.sort((a, b) => a[0] - b[0]);
      const [cost, u] = pq.shift()!;
      if (cost > dist[u]) continue;
      for (let v = 0; v < this.nodes.length; v++) {
        if (this.matrix[u][v] !== 0) {
          const alt = cost + this.matrix[u][v];
          if (alt < dist[v]) {
            dist[v] = alt;
            prev[v] = u;
            pq.push([alt, v]);
          }
        }
      }
    }
    const result: { [vertex: string]: { distance: number; path: string[] } } =
      {};
    for (let i = 0; i < this.nodes.length; i++) {
      const path: string[] = [];
      let current: number | null = i;
      while (current !== null) {
        path.unshift(this.nodes[current].value);
        current = prev[current];
      }
      result[this.nodes[i].value] = { distance: dist[i], path };
    }
    return result;
  }

  floydWarshall(): { [u: string]: { [v: string]: number } } {
    const n = this.nodes.length;
    const dist = this.matrix.map((row) => [...row]);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && dist[i][j] === 0) dist[i][j] = Infinity;
      }
    }
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
          }
        }
      }
    }
    const result: { [u: string]: { [v: string]: number } } = {};
    for (let i = 0; i < n; i++) {
      result[this.nodes[i].value] = {};
      for (let j = 0; j < n; j++) {
        result[this.nodes[i].value][this.nodes[j].value] = dist[i][j];
      }
    }
    return result;
  }
}
