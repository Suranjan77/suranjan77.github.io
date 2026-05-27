"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Braces,
  Bug,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Info,
  Play,
  RotateCcw,
  StepForward,
} from "lucide-react";
import { clsx } from "clsx";

type OpKind = "leaf" | "add" | "mul" | "tanh";
type Phase = "Forward" | "Topo Sort" | "Seed Loss" | "Backward" | "Final";

interface GraphNode {
  id: string;
  label: string;
  op: OpKind;
  data: number;
  parents: string[];
  x: number;
  y: number;
  localRule: string;
  forward: string;
  backward: string;
  rustNote: string;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  slot?: number;
}

interface TraceStep {
  phase: Phase;
  activeNode: string;
  grads: Record<string, number>;
  activeEdges: string[];
  title: string;
  explanation: string;
  updates: string[];
}

interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  objective: string;
  code: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  topo: string[];
  trace: TraceStep[];
  gradientStories: Record<string, string[]>;
  finiteDiff: { variable: string; autograd: number; numeric: number };
  quiz: {
    prompt: string;
    options: string[];
    answer: string;
  };
}

const rustImplementations = {
  arena: `#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
struct NodeId(usize);

struct ValueNode {
    data: f64,
    grad: f64,
    op: Op,
    parents: Vec<NodeId>,
    label: &'static str,
}

struct Graph {
    nodes: Vec<ValueNode>,
}`,
  backward: `match node.op {
    Op::Add => {
        left.grad += out.grad * 1.0;
        right.grad += out.grad * 1.0;
    }
    Op::Mul => {
        left.grad += out.grad * right.data;
        right.grad += out.grad * left.data;
    }
    Op::Tanh => {
        input.grad += out.grad * (1.0 - out.data * out.data);
    }
    Op::Leaf => {}
}`,
  ownership: `// Good for a first toy engine:
type ValueRef = Rc<RefCell<Value>>;

// Better for visualisation:
// store nodes in one arena and pass stable IDs.
let x = graph.value("x", 2.0);
let y = graph.value("y", -3.0);
let z = graph.mul(x, y);`,
};

function formatNumber(value: number | undefined) {
  if (value === undefined) return "?";
  if (Math.abs(value) < 0.00001) return "0.00";
  return value.toFixed(2);
}

function edgeKey(edge: GraphEdge) {
  return `${edge.from}->${edge.to}${edge.slot === undefined ? "" : `:${edge.slot}`}`;
}

type EngineNode = Omit<GraphNode, "x" | "y" | "localRule" | "forward" | "backward" | "rustNote">;

interface EngineGraph {
  nodes: EngineNode[];
  outputId: string;
}

function localRuleFor(node: EngineNode, nodesById: Map<string, EngineNode>) {
  if (node.op === "leaf") {
    return "Leaf value. It receives accumulated gradient from child operations.";
  }

  const [leftId, rightId] = node.parents;
  const left = leftId ? nodesById.get(leftId) : undefined;
  const right = rightId ? nodesById.get(rightId) : undefined;

  if (node.op === "add") {
    return `d${node.id}/d${leftId} = 1.0, d${node.id}/d${rightId} = 1.0`;
  }

  if (node.op === "mul") {
    return `d${node.id}/d${leftId} = ${rightId} = ${formatNumber(right?.data)}, d${node.id}/d${rightId} = ${leftId} = ${formatNumber(left?.data)}`;
  }

  return `d${node.id}/d${leftId} = 1 - tanh(${leftId})^2 = ${formatNumber(1 - node.data * node.data)}`;
}

function backwardRuleFor(node: EngineNode) {
  const [leftId, rightId] = node.parents;

  if (node.op === "leaf") {
    return "No local backward function. Parents are empty.";
  }

  if (node.op === "add") {
    return `${leftId}.grad += ${node.id}.grad; ${rightId}.grad += ${node.id}.grad;`;
  }

  if (node.op === "mul") {
    return `${leftId}.grad += ${node.id}.grad * ${rightId}.data; ${rightId}.grad += ${node.id}.grad * ${leftId}.data;`;
  }

  return `${leftId}.grad += ${node.id}.grad * (1.0 - ${node.id}.data * ${node.id}.data);`;
}

function forwardTextFor(node: EngineNode, nodesById: Map<string, EngineNode>) {
  const [leftId, rightId] = node.parents;
  const left = leftId ? nodesById.get(leftId) : undefined;
  const right = rightId ? nodesById.get(rightId) : undefined;

  if (node.op === "leaf") return `${node.id} = ${formatNumber(node.data)}`;
  if (node.op === "add") {
    return `${node.id} = ${leftId} + ${rightId} = ${formatNumber(left?.data)} + ${formatNumber(right?.data)} = ${formatNumber(node.data)}`;
  }
  if (node.op === "mul") {
    return `${node.id} = ${leftId} * ${rightId} = ${formatNumber(left?.data)} * ${formatNumber(right?.data)} = ${formatNumber(node.data)}`;
  }
  return `${node.id} = tanh(${leftId}) = tanh(${formatNumber(left?.data)}) = ${formatNumber(node.data)}`;
}

function rustNoteFor(node: EngineNode) {
  if (node.op === "leaf") {
    return "This is an arena leaf: the code owns a stable NodeId and the Graph owns the mutable data.";
  }
  if (node.op === "add") {
    return "Add is a backward closure with two parent NodeIds and local derivatives equal to 1.";
  }
  if (node.op === "mul") {
    return "Mul reads both parent data values before mutating parent gradients, which keeps Rust borrowing simple in an arena.";
  }
  return "Tanh stores its output value so backward can compute 1 - out^2 without recomputing tanh.";
}

function topoSort(graph: EngineGraph) {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const visited = new Set<string>();
  const order: string[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const node = nodesById.get(id);
    if (!node) return;
    node.parents.forEach(visit);
    order.push(id);
  }

  visit(graph.outputId);
  return order;
}

function layoutNodes(nodes: EngineNode[], outputId: string): GraphNode[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const depthMemo = new Map<string, number>();

  function depthOf(id: string): number {
    const memo = depthMemo.get(id);
    if (memo !== undefined) return memo;
    const node = nodesById.get(id);
    if (!node || node.parents.length === 0) {
      depthMemo.set(id, 0);
      return 0;
    }
    const depth = 1 + Math.max(...node.parents.map(depthOf));
    depthMemo.set(id, depth);
    return depth;
  }

  nodes.forEach((node) => depthOf(node.id));
  const maxDepth = Math.max(1, ...Array.from(depthMemo.values()));
  const groups = new Map<number, EngineNode[]>();
  nodes.forEach((node) => {
    const depth = depthMemo.get(node.id) ?? 0;
    groups.set(depth, [...(groups.get(depth) ?? []), node]);
  });

  const nodesByEngineId = new Map(nodes.map((node) => [node.id, node]));
  return nodes.map((node) => {
    const depth = depthMemo.get(node.id) ?? 0;
    const group = groups.get(depth) ?? [node];
    const index = group.findIndex((item) => item.id === node.id);
    const yGap = 260 / (group.length + 1);
    const x = 76 + (depth * 468) / maxDepth;
    const y = 50 + yGap * (index + 1);
    const decorated = {
      ...node,
      x,
      y,
      label: node.id === outputId ? `${node.id} = output` : node.label,
      localRule: localRuleFor(node, nodesByEngineId),
      forward: forwardTextFor(node, nodesByEngineId),
      backward: backwardRuleFor(node),
      rustNote: rustNoteFor(node),
    };
    return decorated;
  });
}

function makeEdges(nodes: EngineNode[]) {
  return nodes.flatMap((node) =>
    node.parents.map((parentId, index) => ({
      from: parentId,
      to: node.id,
      label:
        node.op === "tanh"
          ? "input"
          : index === 0
            ? "left"
            : index === 1
              ? "right"
              : "input",
      slot: index,
    })),
  );
}

function makeGradientStories(nodes: EngineNode[], finalGrads: Record<string, number>) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const childMap = new Map<string, string[]>();

  nodes.forEach((node) => {
    node.parents.forEach((parentId) => {
      childMap.set(parentId, [...(childMap.get(parentId) ?? []), node.id]);
    });
  });

  return Object.fromEntries(
    nodes.map((node) => {
      const children = childMap.get(node.id) ?? [];
      const lines =
        children.length === 0 && node.parents.length > 0
          ? [`${node.id} is the selected output, so its gradient is seeded at 1.0.`]
          : children.map((childId) => {
              const child = nodesById.get(childId);
              if (!child) return `${childId} contributes to ${node.id}.grad.`;
              if (child.op === "add") return `${childId} adds a direct contribution because d${childId}/d${node.id} = 1.`;
              if (child.op === "mul") {
                const otherId = child.parents.find((parentId) => parentId !== node.id) ?? node.id;
                const other = nodesById.get(otherId);
                return `${childId} contributes ${childId}.grad * ${otherId}.data = ${formatNumber(finalGrads[childId])} * ${formatNumber(other?.data)}.`;
              }
              return `${childId} contributes through tanh with local derivative 1 - ${childId}.data^2.`;
            });

      return [
        node.id,
        lines.length > 0
          ? [...lines, `Total ${node.id}.grad = ${formatNumber(finalGrads[node.id])}.`]
          : [`${node.id} is not on an active path from the selected output.`],
      ];
    }),
  );
}

function runBackwardTrace(nodes: EngineNode[], outputId: string) {
  const topo = topoSort({ nodes, outputId });
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const grads = Object.fromEntries(nodes.map((node) => [node.id, 0]));
  const edges = makeEdges(nodes);
  const forwardUpdates = nodes.map((node) => forwardTextFor(node, nodesById));
  const trace: TraceStep[] = [
    {
      phase: "Forward",
      activeNode: outputId,
      grads: {},
      activeEdges: edges.map(edgeKey),
      title: "Build the graph during the forward pass",
      explanation: "Every graph.value, graph.add, graph.mul, and graph.tanh call appends a node to the arena.",
      updates: forwardUpdates,
    },
    {
      phase: "Topo Sort",
      activeNode: outputId,
      grads: {},
      activeEdges: edges.filter((edge) => edge.to === outputId).map(edgeKey),
      title: "Create a topological ordering",
      explanation: "DFS visits parents before children, then backward traverses that list in reverse.",
      updates: [`Topo order: [${topo.join(", ")}]`, `Backward order: [${[...topo].reverse().join(", ")}]`],
    },
  ];

  grads[outputId] = 1;
  trace.push({
    phase: "Seed Loss",
    activeNode: outputId,
    grads: { ...grads },
    activeEdges: [],
    title: "Seed the output gradient",
    explanation: "The derivative of the selected output with respect to itself is 1.0.",
    updates: [`${outputId}.grad = 1.0`],
  });

  [...topo].reverse().forEach((nodeId) => {
    const node = nodesById.get(nodeId);
    if (!node || node.op === "leaf") return;

    const updates: string[] = [];

    if (node.op === "add") {
      node.parents.forEach((parentId) => {
        const previous = grads[parentId] ?? 0;
        const contribution = grads[node.id];
        grads[parentId] = previous + contribution;
        updates.push(`${parentId}.grad += ${formatNumber(contribution)} * 1.0 = ${formatNumber(contribution)}, total ${formatNumber(grads[parentId])}`);
      });
    }

    if (node.op === "mul") {
      const [leftId, rightId] = node.parents;
      const left = nodesById.get(leftId);
      const right = nodesById.get(rightId);
      const pairs = [
        [leftId, right?.data ?? 0, rightId],
        [rightId, left?.data ?? 0, leftId],
      ] as const;

      pairs.forEach(([parentId, localDerivative, otherId]) => {
        const previous = grads[parentId] ?? 0;
        const contribution = grads[node.id] * localDerivative;
        grads[parentId] = previous + contribution;
        updates.push(`${parentId}.grad += ${formatNumber(grads[node.id])} * ${otherId}.data (${formatNumber(localDerivative)}) = ${formatNumber(contribution)}, total ${formatNumber(grads[parentId])}`);
      });
    }

    if (node.op === "tanh") {
      const [parentId] = node.parents;
      const localDerivative = 1 - node.data * node.data;
      const contribution = grads[node.id] * localDerivative;
      grads[parentId] = (grads[parentId] ?? 0) + contribution;
      updates.push(`${parentId}.grad += ${formatNumber(grads[node.id])} * (1 - ${node.id}.data^2) = ${formatNumber(contribution)}, total ${formatNumber(grads[parentId])}`);
    }

    trace.push({
      phase: "Backward",
      activeNode: node.id,
      grads: { ...grads },
      activeEdges: edges.filter((edge) => edge.to === node.id).map(edgeKey),
      title: `Backprop through ${node.id}`,
      explanation: localRuleFor(node, nodesById),
      updates,
    });
  });

  trace.push({
    phase: "Final",
    activeNode: outputId,
    grads: { ...grads },
    activeEdges: [],
    title: "Final gradients",
    explanation: "All reverse-topological backward functions have run, so leaf gradients are complete.",
    updates: Object.entries(grads).map(([id, grad]) => `${id}.grad = ${formatNumber(grad)}`),
  });

  return { trace, topo, finalGrads: grads };
}

function evaluateGraph(nodes: EngineNode[], replacements: Record<string, number>) {
  const values = new Map<string, number>();

  nodes.forEach((node) => {
    if (node.op === "leaf") {
      values.set(node.id, replacements[node.id] ?? node.data);
      return;
    }

    const [leftId, rightId] = node.parents;
    const left = values.get(leftId) ?? 0;
    const right = values.get(rightId) ?? 0;
    if (node.op === "add") values.set(node.id, left + right);
    if (node.op === "mul") values.set(node.id, left * right);
    if (node.op === "tanh") values.set(node.id, Math.tanh(left));
  });

  return values;
}

function finiteDifference(nodes: EngineNode[], outputId: string, variable: string, autograd: number) {
  const node = nodes.find((item) => item.id === variable);
  if (!node) return { variable, autograd, numeric: autograd };
  const h = 1e-5;
  const plus = evaluateGraph(nodes, { [variable]: node.data + h }).get(outputId) ?? 0;
  const minus = evaluateGraph(nodes, { [variable]: node.data - h }).get(outputId) ?? 0;
  return { variable, autograd, numeric: (plus - minus) / (2 * h) };
}

function createLessonFromEngine(sourceCode: string, graph: EngineGraph): Lesson {
  const { trace, topo, finalGrads } = runBackwardTrace(graph.nodes, graph.outputId);
  const nodes = layoutNodes(graph.nodes, graph.outputId);
  const leaf = graph.nodes.find((node) => node.op === "leaf") ?? graph.nodes[0];

  return {
    id: "custom",
    title: "Custom Rust Autograd Trace",
    subtitle: `${graph.outputId} = browser-executed arena graph`,
    objective: "Run the edited Rust-shaped code through the scalar autograd interpreter.",
    code: sourceCode,
    nodes,
    edges: makeEdges(graph.nodes),
    topo,
    trace,
    gradientStories: makeGradientStories(graph.nodes, finalGrads),
    finiteDiff: finiteDifference(graph.nodes, graph.outputId, leaf.id, finalGrads[leaf.id] ?? 0),
    quiz: {
      prompt: "Which implementation detail keeps reused variables correct?",
      options: ["grad += contribution", "grad = contribution", "Skip topological sorting"],
      answer: "grad += contribution",
    },
  };
}

function parseRustLabCode(sourceCode: string): Lesson {
  const env = new Map<string, EngineNode>();
  const nodes: EngineNode[] = [];
  let outputId = "";

  function getNode(id: string, line: string) {
    const node = env.get(id);
    if (!node) throw new Error(`Unknown value '${id}' in: ${line}`);
    return node;
  }

  sourceCode
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"))
    .forEach((line) => {
      const valueMatch = line.match(/^let\s+([a-zA-Z_]\w*)\s*=\s*graph\.value\("([^"]+)",\s*(-?\d+(?:\.\d+)?)\)\s*;?$/);
      if (valueMatch) {
        const [, variable, label, rawValue] = valueMatch;
        const node: EngineNode = {
          id: variable,
          label,
          op: "leaf",
          data: Number(rawValue),
          parents: [],
        };
        env.set(variable, node);
        nodes.push(node);
        return;
      }

      const binaryMatch = line.match(/^let\s+([a-zA-Z_]\w*)\s*=\s*graph\.(add|mul)\(([a-zA-Z_]\w*),\s*([a-zA-Z_]\w*)\)\s*;?$/);
      if (binaryMatch) {
        const [, variable, op, leftId, rightId] = binaryMatch;
        const left = getNode(leftId, line);
        const right = getNode(rightId, line);
        const data = op === "add" ? left.data + right.data : left.data * right.data;
        const node: EngineNode = {
          id: variable,
          label: `${variable} = ${leftId} ${op === "add" ? "+" : "*"} ${rightId}`,
          op: op as "add" | "mul",
          data,
          parents: [leftId, rightId],
        };
        env.set(variable, node);
        nodes.push(node);
        return;
      }

      const tanhMatch = line.match(/^let\s+([a-zA-Z_]\w*)\s*=\s*graph\.tanh\(([a-zA-Z_]\w*)\)\s*;?$/);
      if (tanhMatch) {
        const [, variable, inputId] = tanhMatch;
        const input = getNode(inputId, line);
        const node: EngineNode = {
          id: variable,
          label: `${variable} = tanh(${inputId})`,
          op: "tanh",
          data: Math.tanh(input.data),
          parents: [inputId],
        };
        env.set(variable, node);
        nodes.push(node);
        return;
      }

      const backwardMatch = line.match(/^graph\.backward\(([a-zA-Z_]\w*)\)\s*;?$/);
      if (backwardMatch) {
        const [, id] = backwardMatch;
        getNode(id, line);
        outputId = id;
        return;
      }

      throw new Error(`Unsupported line: ${line}`);
    });

  if (nodes.length === 0) {
    throw new Error("Add at least one graph.value call.");
  }

  if (!outputId) {
    outputId = nodes[nodes.length - 1].id;
  }

  return createLessonFromEngine(sourceCode, { nodes, outputId });
}

function circleEdgePath(
  from: GraphNode,
  to: GraphNode,
  index: number,
  siblings: number,
) {
  const radius = 54;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const ux = dx / distance;
  const uy = dy / distance;
  const startX = from.x + ux * radius;
  const startY = from.y + uy * radius;
  const endX = to.x - ux * (radius + 8);
  const endY = to.y - uy * (radius + 8);
  const normalX = -uy;
  const normalY = ux;
  const curveOffset = siblings > 1 ? (index - (siblings - 1) / 2) * 42 : 24 * Math.sign(dy || 1);
  const midX = (startX + endX) / 2 + normalX * curveOffset;
  const midY = (startY + endY) / 2 + normalY * curveOffset;

  return {
    d: `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`,
    labelX: midX,
    labelY: midY,
  };
}

function createLessons(): Lesson[] {
  const sharedNodes: GraphNode[] = [
    {
      id: "x",
      label: "x",
      op: "leaf",
      data: 2,
      parents: [],
      x: 88,
      y: 92,
      localRule: "Leaf value. It receives gradient from every child path.",
      forward: "x = 2.0",
      backward: "No local backward function. Children accumulate into x.grad.",
      rustNote: "A leaf is a NodeId whose op is Op::Leaf and parents is empty.",
    },
    {
      id: "y",
      label: "y",
      op: "leaf",
      data: -3,
      parents: [],
      x: 88,
      y: 248,
      localRule: "Leaf value. It receives gradient from the multiply node.",
      forward: "y = -3.0",
      backward: "No local backward function. The multiply rule writes y.grad.",
      rustNote: "Leaves hold trainable data in the same node table as ops.",
    },
    {
      id: "c",
      label: "c = x * y",
      op: "mul",
      data: -6,
      parents: ["x", "y"],
      x: 292,
      y: 170,
      localRule: "dc/dx = y = -3.0, dc/dy = x = 2.0",
      forward: "c = 2.0 * -3.0 = -6.0",
      backward: "x.grad += c.grad * y.data; y.grad += c.grad * x.data;",
      rustNote: "Mul needs both parent data values, so the arena lookup happens before mutation.",
    },
    {
      id: "d",
      label: "d = c + x",
      op: "add",
      data: -4,
      parents: ["c", "x"],
      x: 508,
      y: 170,
      localRule: "dd/dc = 1.0, dd/dx = 1.0",
      forward: "d = -6.0 + 2.0 = -4.0",
      backward: "c.grad += d.grad; x.grad += d.grad;",
      rustNote: "Because x is reused, Add contributes one path and Mul contributes another.",
    },
  ];

  const sharedEdges = [
    { from: "x", to: "c", label: "left" },
    { from: "y", to: "c", label: "right" },
    { from: "c", to: "d", label: "left" },
    { from: "x", to: "d", label: "right" },
  ];

  const accumulationNodes: GraphNode[] = [
    {
      id: "x",
      label: "x",
      op: "leaf",
      data: 3,
      parents: [],
      x: 104,
      y: 170,
      localRule: "The same NodeId is used twice by the multiply op.",
      forward: "x = 3.0",
      backward: "Two parent slots both target x, so both contributions must be added.",
      rustNote: "This is the bug finder for grad = contribution versus grad += contribution.",
    },
    {
      id: "y",
      label: "y = x * x",
      op: "mul",
      data: 9,
      parents: ["x", "x"],
      x: 366,
      y: 170,
      localRule: "dy/dx(left) = x = 3.0 and dy/dx(right) = x = 3.0",
      forward: "y = 3.0 * 3.0 = 9.0",
      backward: "x.grad += y.grad * 3.0; x.grad += y.grad * 3.0;",
      rustNote: "The arena stores one x node, while the op records two parent references to it.",
    },
  ];

  const tanhNodes: GraphNode[] = [
    {
      id: "a",
      label: "a",
      op: "leaf",
      data: 2,
      parents: [],
      x: 72,
      y: 105,
      localRule: "Leaf input to multiplication.",
      forward: "a = 2.0",
      backward: "Receives gradient from c.",
      rustNote: "NodeId(0) can be copied freely; the graph owns the node data.",
    },
    {
      id: "b",
      label: "b",
      op: "leaf",
      data: 3,
      parents: [],
      x: 72,
      y: 245,
      localRule: "Leaf input to multiplication.",
      forward: "b = 3.0",
      backward: "Receives gradient from c.",
      rustNote: "No shared mutation is needed until the backward pass.",
    },
    {
      id: "c",
      label: "c = a * b",
      op: "mul",
      data: 6,
      parents: ["a", "b"],
      x: 286,
      y: 175,
      localRule: "dc/da = b = 3.0, dc/db = a = 2.0",
      forward: "c = 2.0 * 3.0 = 6.0",
      backward: "a.grad += c.grad * b.data; b.grad += c.grad * a.data;",
      rustNote: "Backward order must visit d before c so c.grad is ready.",
    },
    {
      id: "d",
      label: "d = tanh(c)",
      op: "tanh",
      data: 0.9999877,
      parents: ["c"],
      x: 510,
      y: 175,
      localRule: "dd/dc = 1 - tanh(c)^2 = 0.000025",
      forward: "d = tanh(6.0) = 0.9999877",
      backward: "c.grad += d.grad * (1.0 - d.data * d.data);",
      rustNote: "Tanh can use the output value already stored in the node.",
    },
  ];

  return [
    {
      id: "reuse",
      title: "Multiplication and Gradient Accumulation",
      subtitle: "z = x * y + x",
      objective:
        "See why a reused variable receives gradient through multiple paths.",
      code: `let x = graph.value("x", 2.0);
let y = graph.value("y", -3.0);
let c = graph.mul(x, y);
let d = graph.add(c, x);

graph.backward(d);`,
      nodes: sharedNodes,
      edges: sharedEdges,
      topo: ["x", "y", "c", "d"],
      trace: [
        {
          phase: "Forward",
          activeNode: "d",
          grads: {},
          activeEdges: sharedEdges.map(edgeKey),
          title: "Build the graph during the forward pass",
          explanation:
            "The arena stores four nodes. The output d remembers that it came from c and x.",
          updates: ["x = 2.0", "y = -3.0", "c = x * y = -6.0", "d = c + x = -4.0"],
        },
        {
          phase: "Topo Sort",
          activeNode: "d",
          grads: {},
          activeEdges: ["c->d", "x->d"],
          title: "Create a topological ordering",
          explanation:
            "DFS visits parents before children, giving [x, y, c, d]. Backward reverses it.",
          updates: ["Topo order: [x, y, c, d]", "Backward order: [d, c, y, x]"],
        },
        {
          phase: "Seed Loss",
          activeNode: "d",
          grads: { d: 1 },
          activeEdges: [],
          title: "Seed the output gradient",
          explanation:
            "The derivative of the output with respect to itself is 1.0.",
          updates: ["d.grad = 1.0"],
        },
        {
          phase: "Backward",
          activeNode: "d",
          grads: { d: 1, c: 1, x: 1 },
          activeEdges: ["c->d", "x->d"],
          title: "Backprop through add",
          explanation:
            "Addition copies the incoming gradient to both parents because both local derivatives are 1.",
          updates: ["c.grad += 1.0 * 1.0 = 1.0", "x.grad += 1.0 * 1.0 = 1.0"],
        },
        {
          phase: "Backward",
          activeNode: "c",
          grads: { d: 1, c: 1, x: -2, y: 2 },
          activeEdges: ["x->c", "y->c"],
          title: "Backprop through multiply",
          explanation:
            "The multiply node sends y.data to x and x.data to y, scaled by c.grad.",
          updates: ["x.grad += 1.0 * -3.0 = -3.0, total -2.0", "y.grad += 1.0 * 2.0 = 2.0"],
        },
        {
          phase: "Final",
          activeNode: "x",
          grads: { d: 1, c: 1, x: -2, y: 2 },
          activeEdges: [],
          title: "Final gradients",
          explanation:
            "x has two paths into d, so the contributions 1.0 and -3.0 accumulate.",
          updates: ["x.grad = -2.0", "y.grad = 2.0", "c.grad = 1.0", "d.grad = 1.0"],
        },
      ],
      gradientStories: {
        x: [
          "x affects d through the direct add path: x -> d, contribution = 1.",
          "x also affects d through multiplication: x -> c -> d, contribution = y = -3.",
          "Total x.grad = 1 + -3 = -2.",
        ],
        y: ["y affects d only through c = x * y.", "Contribution = d.grad * dc/dy = 1 * x = 2."],
        c: ["d = c + x, so dd/dc = 1.", "c.grad is seeded by d's add rule as 1."],
      },
      finiteDiff: { variable: "x", autograd: -2, numeric: -2.0000000003 },
      quiz: {
        prompt: "What breaks if the engine writes x.grad = contribution here?",
        options: ["The direct add path is overwritten", "The forward value changes", "The topo order disappears"],
        answer: "The direct add path is overwritten",
      },
    },
    {
      id: "square",
      title: "The Classic x Squared Test",
      subtitle: "y = x * x",
      objective:
        "Use one graph node twice and prove that accumulation is required.",
      code: `let x = graph.value("x", 3.0);
let y = graph.mul(x, x);

graph.backward(y);`,
      nodes: accumulationNodes,
      edges: [
        { from: "x", to: "y", label: "left parent" },
        { from: "x", to: "y", label: "right parent" },
      ],
      topo: ["x", "y"],
      trace: [
        {
          phase: "Forward",
          activeNode: "y",
          grads: {},
          activeEdges: ["x->y"],
          title: "Build y = x * x",
          explanation:
            "Both parent slots point to the same x node. This is one variable reused twice.",
          updates: ["x = 3.0", "y = 9.0"],
        },
        {
          phase: "Topo Sort",
          activeNode: "y",
          grads: {},
          activeEdges: ["x->y"],
          title: "Reverse the topo order",
          explanation:
            "The only valid backward order is [y, x]. x cannot run before y has sent its gradient.",
          updates: ["Topo order: [x, y]", "Backward order: [y, x]"],
        },
        {
          phase: "Seed Loss",
          activeNode: "y",
          grads: { y: 1 },
          activeEdges: [],
          title: "Seed y.grad",
          explanation: "dy/dy = 1.0, so the output starts the backward pass.",
          updates: ["y.grad = 1.0"],
        },
        {
          phase: "Backward",
          activeNode: "y",
          grads: { y: 1, x: 6 },
          activeEdges: ["x->y"],
          title: "Apply the multiply rule twice",
          explanation:
            "The left slot contributes 3.0 and the right slot contributes 3.0 to the same node.",
          updates: ["left contribution = 1.0 * 3.0 = 3.0", "right contribution = 1.0 * 3.0 = 3.0"],
        },
        {
          phase: "Final",
          activeNode: "x",
          grads: { y: 1, x: 6 },
          activeEdges: [],
          title: "Final gradient",
          explanation: "x.grad = 3.0 + 3.0 = 6.0, matching d(x^2)/dx = 2x.",
          updates: ["x.grad = 6.0"],
        },
      ],
      gradientStories: {
        x: [
          "x is both the left and right parent of the multiply node.",
          "Left contribution = out.grad * right.data = 1 * 3.",
          "Right contribution = out.grad * left.data = 1 * 3.",
          "Total x.grad = 6.",
        ],
      },
      finiteDiff: { variable: "x", autograd: 6, numeric: 6.0000000008 },
      quiz: {
        prompt: "Why is x.grad 6 instead of 3?",
        options: ["x is used in two parent slots", "tanh doubles every gradient", "Topo sort duplicates leaves"],
        answer: "x is used in two parent slots",
      },
    },
    {
      id: "tanh",
      title: "Topological Order with tanh",
      subtitle: "d = tanh(a * b)",
      objective:
        "Watch a nonlinear local derivative gate the gradient before multiplication runs.",
      code: `let a = graph.value("a", 2.0);
let b = graph.value("b", 3.0);
let c = graph.mul(a, b);
let d = graph.tanh(c);

graph.backward(d);`,
      nodes: tanhNodes,
      edges: [
        { from: "a", to: "c", label: "left" },
        { from: "b", to: "c", label: "right" },
        { from: "c", to: "d", label: "input" },
      ],
      topo: ["a", "b", "c", "d"],
      trace: [
        {
          phase: "Forward",
          activeNode: "d",
          grads: {},
          activeEdges: ["a->c", "b->c", "c->d"],
          title: "Forward values",
          explanation: "The output is almost saturated because tanh(6) is close to 1.",
          updates: ["c = 6.0", "d = tanh(c) = 0.9999877"],
        },
        {
          phase: "Topo Sort",
          activeNode: "d",
          grads: {},
          activeEdges: ["c->d"],
          title: "Topological dependency",
          explanation: "d must run before c because c.grad is produced by tanh's backward rule.",
          updates: ["Topo order: [a, b, c, d]", "Backward order: [d, c, b, a]"],
        },
        {
          phase: "Seed Loss",
          activeNode: "d",
          grads: { d: 1 },
          activeEdges: [],
          title: "Seed d.grad",
          explanation: "The output gradient starts at 1.0.",
          updates: ["d.grad = 1.0"],
        },
        {
          phase: "Backward",
          activeNode: "d",
          grads: { d: 1, c: 0.000025 },
          activeEdges: ["c->d"],
          title: "Backprop through tanh",
          explanation:
            "tanh is saturated, so 1 - d.data^2 is tiny. The gradient entering c is tiny too.",
          updates: ["c.grad += 1.0 * (1 - 0.9999877^2) = 0.000025"],
        },
        {
          phase: "Backward",
          activeNode: "c",
          grads: { d: 1, c: 0.000025, a: 0.000074, b: 0.000049 },
          activeEdges: ["a->c", "b->c"],
          title: "Backprop through multiply",
          explanation: "The tiny gradient at c is scaled by the opposite parent values.",
          updates: ["a.grad += 0.000025 * 3.0 = 0.000074", "b.grad += 0.000025 * 2.0 = 0.000049"],
        },
        {
          phase: "Final",
          activeNode: "a",
          grads: { d: 1, c: 0.000025, a: 0.000074, b: 0.000049 },
          activeEdges: [],
          title: "Final gradients",
          explanation: "Saturation makes the whole upstream gradient small.",
          updates: ["a.grad ~= 0.000074", "b.grad ~= 0.000049"],
        },
      ],
      gradientStories: {
        a: ["a affects d through a -> c -> d.", "Contribution = dd/dc * dc/da = 0.000025 * b = 0.000074."],
        b: ["b affects d through b -> c -> d.", "Contribution = dd/dc * dc/db = 0.000025 * a = 0.000049."],
        c: ["c.grad comes from tanh only.", "dd/dc = 1 - tanh(c)^2, which is tiny near tanh saturation."],
      },
      finiteDiff: { variable: "a", autograd: 0.000074, numeric: 0.000074 },
      quiz: {
        prompt: "Why must d run before c in the backward pass?",
        options: ["d creates c.grad", "c has no data", "Leaves must always run first"],
        answer: "d creates c.grad",
      },
    },
  ];
}

function nodeAccent(op: OpKind) {
  if (op === "leaf") return "var(--color-primary)";
  if (op === "mul") return "var(--color-warning)";
  if (op === "tanh") return "var(--color-error)";
  return "var(--color-secondary)";
}

export default function GradForgeLab() {
  const lessons = useMemo(() => createLessons(), []);
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => lessons[0]);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState("x");
  const [lens, setLens] = useState(2);
  const [codeDraft, setCodeDraft] = useState(lessons[0].code);
  const [quizChoice, setQuizChoice] = useState("");
  const [implTab, setImplTab] = useState<keyof typeof rustImplementations>("arena");
  const [runMessage, setRunMessage] = useState(
    "Ready: edit graph.value, graph.add, graph.mul, graph.tanh, then run.",
  );

  const lesson = activeLesson;
  const step = lesson.trace[stepIndex];
  const selectedNode =
    lesson.nodes.find((node) => node.id === selectedNodeId) ?? lesson.nodes[0];
  const selectedStory =
    lesson.gradientStories[selectedNode.id] ??
    ["This node has no upstream gradient story in the current lesson step."];

  function selectLesson(nextIndex: number) {
    const next = lessons[nextIndex];
    setLessonIndex(nextIndex);
    setActiveLesson(next);
    setStepIndex(0);
    setSelectedNodeId(next.nodes[0].id);
    setCodeDraft(next.code);
    setQuizChoice("");
    setRunMessage("Loaded preset lesson.");
  }

  function advanceStep() {
    setStepIndex((current) => Math.min(current + 1, lesson.trace.length - 1));
  }

  function runEditorCode() {
    try {
      const customLesson = parseRustLabCode(codeDraft);
      setActiveLesson(customLesson);
      setLessonIndex(-1);
      setStepIndex(customLesson.trace.length - 1);
      setSelectedNodeId(customLesson.nodes[0].id);
      setQuizChoice("");
      setRunMessage("Executed in the browser scalar autograd engine.");
    } catch (error) {
      setRunMessage(error instanceof Error ? error.message : "Could not run this code.");
    }
  }

  return (
    <div className="border border-outline bg-surface">
      <div className="grid border-b border-outline bg-border lg:grid-cols-[310px_minmax(0,1fr)_330px]">
        <section className="bg-surface p-5 lg:border-r lg:border-outline">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            <BookOpen size={14} />
            Learn Mode
          </div>
          <div className="space-y-2">
            {lessons.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectLesson(index)}
                className={clsx(
                  "w-full border px-4 py-3 text-left transition-colors",
                  index === lessonIndex
                    ? "border-primary bg-primary-container"
                    : "border-outline bg-surface-container-lowest hover:border-outline-dark",
                )}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                  Module 0{index + 1}
                </span>
                <span className="mt-1 block font-headline text-xl font-medium text-on-surface">
                  {item.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-on-surface-variant">
                  {item.objective}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-surface p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                {lesson.subtitle}
              </p>
              <h2 className="mt-1 font-headline text-3xl font-medium text-on-surface">
                {step.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStepIndex(0)}
                className="inline-flex h-9 w-9 items-center justify-center border border-outline bg-surface-container-lowest text-on-surface hover:border-primary"
                aria-label="Reset timeline"
                title="Reset timeline"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={advanceStep}
                className="inline-flex h-9 w-9 items-center justify-center border border-on-surface bg-on-surface text-background hover:bg-primary"
                aria-label="Step forward"
                title="Step forward"
              >
                <StepForward size={15} />
              </button>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden border border-outline bg-surface-container-lowest">
            <svg
              viewBox="0 0 620 360"
              className="h-full min-h-[360px] w-full"
              role="img"
              aria-label="Interactive computation graph"
            >
              <defs>
                <marker
                  id="gradforge-arrow"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-outline-dark)" />
                </marker>
                <marker
                  id="gradforge-arrow-active"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-warning)" />
                </marker>
              </defs>

              {lesson.edges.map((edge, index) => {
                const from = lesson.nodes.find((node) => node.id === edge.from);
                const to = lesson.nodes.find((node) => node.id === edge.to);
                if (!from || !to) return null;
                const active = step.activeEdges.includes(edgeKey(edge));
                const siblings = lesson.edges.filter(
                  (candidate) =>
                    candidate.from === edge.from && candidate.to === edge.to,
                );
                const siblingIndex = siblings.findIndex(
                  (candidate) => candidate.slot === edge.slot,
                );
                const path = circleEdgePath(
                  from,
                  to,
                  Math.max(siblingIndex, index),
                  siblings.length,
                );
                return (
                  <g key={`${edge.from}-${edge.to}-${index}`}>
                    <path
                      d={path.d}
                      fill="none"
                      stroke={active ? "var(--color-warning)" : "var(--color-outline-dark)"}
                      strokeWidth={active ? 2.8 : 1.4}
                      strokeDasharray={active ? "7 5" : "0"}
                      markerEnd={active ? "url(#gradforge-arrow-active)" : "url(#gradforge-arrow)"}
                    />
                    <text
                      x={path.labelX}
                      y={path.labelY - 8}
                      textAnchor="middle"
                      className="fill-on-surface-variant font-mono text-[9px]"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {lesson.nodes.map((node) => {
                const active = node.id === step.activeNode;
                const selected = node.id === selectedNode.id;
                const grad = step.grads[node.id];
                const labelParts = node.label.split(" = ");
                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedNodeId(node.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setSelectedNodeId(node.id);
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="54"
                      fill={
                        active
                          ? "var(--color-primary-container)"
                          : selected
                            ? "var(--color-surface-container-high)"
                            : "var(--color-surface)"
                      }
                      stroke={active || selected ? nodeAccent(node.op) : "var(--color-outline-dark)"}
                      strokeWidth={active ? 2.3 : 1.2}
                    />
                    <text
                      x={node.x}
                      y={node.y - 24}
                      textAnchor="middle"
                      className="fill-on-surface font-mono text-[11px]"
                    >
                      {labelParts[0]}
                    </text>
                    {labelParts[1] && (
                      <text
                        x={node.x}
                        y={node.y - 8}
                        textAnchor="middle"
                        className="fill-on-surface-variant font-mono text-[9px]"
                      >
                        {labelParts[1].slice(0, 14)}
                      </text>
                    )}
                    <text
                      x={node.x}
                      y={node.y + 15}
                      textAnchor="middle"
                      className="fill-on-surface-variant font-mono text-[10px]"
                    >
                      data {formatNumber(node.data)}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 34}
                      textAnchor="middle"
                      className="fill-primary font-mono text-[10px]"
                    >
                      grad {formatNumber(grad)}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="absolute left-4 top-4 border border-outline bg-surface/95 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
              Phase: <span className="text-primary">{step.phase}</span>
            </div>
          </div>

          <div className="mt-4 border border-outline bg-surface-container-lowest p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="range"
                min={0}
                max={lesson.trace.length - 1}
                value={stepIndex}
                onChange={(event) => setStepIndex(Number(event.target.value))}
                className="w-full accent-[var(--color-primary)]"
                aria-label="Execution timeline"
              />
              <div className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">
                {stepIndex + 1}/{lesson.trace.length}
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-5">
              {lesson.trace.map((trace, index) => (
                <button
                  key={`${trace.phase}-${index}`}
                  type="button"
                  onClick={() => setStepIndex(index)}
                  className={clsx(
                    "min-h-10 border px-2 py-2 font-mono text-[9px] uppercase tracking-[0.12em]",
                    index === stepIndex
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline bg-surface text-on-surface-variant hover:border-outline-dark",
                  )}
                >
                  {trace.phase}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface p-5 lg:border-l lg:border-outline">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            <Info size={14} />
            Maths Inspector
          </div>
          <div className="border border-outline bg-surface-container-lowest p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Selected Node
            </p>
            <h3 className="mt-1 font-headline text-2xl font-medium text-on-surface">
              {selectedNode.label}
            </h3>
            <dl className="mt-4 grid grid-cols-2 gap-px border border-outline bg-border">
              {[
                ["data", formatNumber(selectedNode.data)],
                ["grad", formatNumber(step.grads[selectedNode.id])],
                ["op", selectedNode.op],
                ["parents", selectedNode.parents.join(", ") || "none"],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface px-3 py-3">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
                    {label}
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-on-surface">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-4 border border-outline bg-surface-container-lowest p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                Math Lens
              </p>
              <span className="font-mono text-[10px] text-primary">Level {lens}</span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              value={lens}
              onChange={(event) => setLens(Number(event.target.value))}
              className="w-full accent-[var(--color-primary)]"
              aria-label="Math detail level"
            />
            <div className="mt-4 space-y-3 text-sm leading-6 text-on-surface-variant">
              <p>{selectedNode.forward}</p>
              {lens >= 2 && <p>{selectedNode.localRule}</p>}
              {lens >= 3 && <p>{selectedNode.backward}</p>}
              {lens >= 4 && <p>{selectedStory.join(" ")}</p>}
            </div>
          </div>

          <div className="mt-4 border border-outline bg-surface-container-lowest p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Explain This Gradient
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant">
              {selectedStory.map((line, index) => (
                <li
                  key={`${selectedNode.id}-story-${index}-${line}`}
                  className="border-l-2 border-primary pl-3"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="grid border-b border-outline bg-border lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="bg-surface p-5 lg:border-r lg:border-outline">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              <Braces size={14} />
              Rust Editor
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = lessonIndex >= 0 ? lessons[lessonIndex] : lessons[0];
                  setActiveLesson(next);
                  setLessonIndex(lessonIndex >= 0 ? lessonIndex : 0);
                  setCodeDraft(next.code);
                  setStepIndex(0);
                  setSelectedNodeId(next.nodes[0].id);
                  setRunMessage("Reset to the lesson source.");
                }}
                className="inline-flex items-center gap-2 border border-outline bg-surface-container-lowest px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant hover:border-primary"
              >
                <RotateCcw size={13} />
                Reset
              </button>
              <button
                type="button"
                onClick={runEditorCode}
                className="inline-flex items-center gap-2 border border-on-surface bg-on-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-background hover:bg-primary"
              >
                <Play size={13} />
                Run Trace
              </button>
            </div>
          </div>
          <textarea
            value={codeDraft}
            onChange={(event) => setCodeDraft(event.target.value)}
            spellCheck={false}
            className="min-h-[270px] w-full resize-y border border-outline bg-surface-container-lowest p-4 font-mono text-sm leading-7 text-on-surface outline-none focus:border-primary"
            aria-label="Rust editor"
          />
          <p
            className={clsx(
              "mt-3 border px-3 py-2 font-mono text-[11px] leading-5",
              runMessage.startsWith("Unsupported") ||
                runMessage.startsWith("Unknown") ||
                runMessage.startsWith("Add at least")
                ? "border-error bg-error-container text-on-error-container"
                : "border-outline bg-surface-container-lowest text-on-surface-variant",
            )}
          >
            {runMessage}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {step.updates.map((update, index) => (
              <div
                key={`${step.phase}-${step.activeNode}-update-${index}-${update}`}
                className="border border-outline bg-surface-container-lowest px-3 py-3 font-mono text-[11px] leading-5 text-on-surface-variant"
              >
                {update}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface p-5">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            <GitBranch size={14} />
            Rust Engine Notes
          </div>
          <div className="mb-3 grid grid-cols-3 gap-px border border-outline bg-border">
            {[
              ["arena", "Arena"],
              ["backward", "Rules"],
              ["ownership", "Ownership"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setImplTab(id as keyof typeof rustImplementations)}
                className={clsx(
                  "bg-surface px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]",
                  implTab === id
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <pre className="overflow-auto border border-outline bg-surface-container-lowest p-4 text-[12px] leading-6 text-on-surface">
            <code>{rustImplementations[implTab]}</code>
          </pre>
          <p className="mt-4 border border-outline bg-surface-container-lowest p-4 text-sm leading-6 text-on-surface-variant">
            {selectedNode.rustNote}
          </p>
        </section>
      </div>

      <div className="grid bg-border lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="bg-surface p-5 lg:border-r lg:border-outline">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            <Bug size={14} />
            Prediction Task
          </div>
          <p className="text-sm font-medium leading-7 text-on-surface-variant">
            {lesson.quiz.prompt}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {lesson.quiz.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setQuizChoice(option)}
                className={clsx(
                  "min-h-14 border px-3 py-3 text-left text-sm font-medium leading-5",
                  quizChoice === option && option === lesson.quiz.answer
                    ? "border-primary bg-primary-container text-on-primary-container"
                    : quizChoice === option
                      ? "border-error bg-error-container text-on-error-container"
                      : "border-outline bg-surface-container-lowest text-on-surface-variant hover:border-outline-dark",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          {quizChoice && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              {quizChoice === lesson.quiz.answer
                ? "Correct: the gradient trace keeps every path."
                : `Answer: ${lesson.quiz.answer}`}
            </p>
          )}
        </section>

        <section className="bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            Finite Difference Check
          </p>
          <div className="mt-4 grid gap-px border border-outline bg-border">
            {[
              ["variable", lesson.finiteDiff.variable],
              ["autograd", formatNumber(lesson.finiteDiff.autograd)],
              ["numeric", formatNumber(lesson.finiteDiff.numeric)],
              [
                "error",
                formatNumber(
                  Math.abs(lesson.finiteDiff.autograd - lesson.finiteDiff.numeric),
                ),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 bg-surface-container-lowest px-4 py-3"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                  {label}
                </span>
                <span className="font-mono text-sm text-on-surface">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border border-outline bg-surface-container-lowest px-4 py-3">
            <button
              type="button"
              onClick={() => selectLesson(Math.max(lessonIndex - 1, 0))}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant hover:text-primary"
            >
              <ChevronLeft size={13} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => selectLesson(Math.min(lessonIndex + 1, lessons.length - 1))}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant hover:text-primary"
            >
              Next
              <ChevronRight size={13} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
