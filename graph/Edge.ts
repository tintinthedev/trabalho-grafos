import { Node } from "./Node";

export type Edge<T> = {
  from: Node<T>;
  to: Node<T>;
  weight: number;
};
