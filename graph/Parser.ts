import { Edge } from "./Edge";
import {
  AdjacencyMatrixGraph,
  IncidenceListGraph,
  IncidenceMatrixGraph,
} from "./GraphClasses";
import { Node } from "./Node";

export function parseGraph(
  rawGraph: {
    nodes: Node<string>[];
    edges: Edge<string>[];
  },
  format: string
) {
  switch (format) {
    case "incidence-list":
      return new IncidenceListGraph(rawGraph.nodes, rawGraph.edges);
    case "incidence-matrix":
      return new IncidenceMatrixGraph(rawGraph.nodes, rawGraph.edges);
    case "adjacency-matrix":
      return new AdjacencyMatrixGraph(rawGraph.nodes, rawGraph.edges);
    default:
      return new IncidenceListGraph(rawGraph.nodes, rawGraph.edges); // default
  }
}
