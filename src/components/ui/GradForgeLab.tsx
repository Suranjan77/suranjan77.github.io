"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
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

type OpKind = "leaf" | "add" | "sub" | "mul" | "div" | "tanh" | "relu";
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
  pythonNote: string;
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

const pythonImplementations = {
  arena: `class Value:
    def __init__(self, data, _children=(), _op='', label=''):
        self.data = data
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op
        self.label = label`,
  backward: `def _backward():
    self.grad += out.grad * (1.0 - out.data**2)
out._backward = _backward`,
  ownership: `a = Value(2.0, label='a')
b = Value(-3.0, label='b')
c = a * b
d = c.tanh()
d.backward()`
};

function formatNumber(value: number | undefined) {
  if (value === undefined) return "?";
  if (!Number.isFinite(value)) return "undefined";
  if (Math.abs(value) < 0.00001) return "0.00";
  return value.toFixed(2);
}

function safeDivide(numerator: number, denominator: number) {
  const stableDenominator =
    Math.abs(denominator) < 1e-9 ? Math.sign(denominator || 1) * 1e-9 : denominator;
  return numerator / stableDenominator;
}

function edgeKey(edge: GraphEdge) {
  return `${edge.from}->${edge.to}${edge.slot === undefined ? "" : `:${edge.slot}`}`;
}

type EngineNode = Omit<GraphNode, "x" | "y" | "localRule" | "forward" | "backward" | "pythonNote">;

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

  if (node.op === "sub") {
    return `d${node.id}/d${leftId} = 1.0, d${node.id}/d${rightId} = -1.0`;
  }

  if (node.op === "mul") {
    return `d${node.id}/d${leftId} = ${rightId} = ${formatNumber(right?.data)}, d${node.id}/d${rightId} = ${leftId} = ${formatNumber(left?.data)}`;
  }

  if (node.op === "div") {
    const rightValue = right?.data ?? 1;
    const guardedRight = Math.abs(rightValue) < 1e-9 ? 1e-9 : rightValue;
    return `d${node.id}/d${leftId} = 1/${rightId} = ${formatNumber(safeDivide(1, rightValue))}, d${node.id}/d${rightId} = -${leftId}/${rightId}^2 = ${formatNumber(-(left?.data ?? 0) / (guardedRight ** 2))}`;
  }

  if (node.op === "relu") {
    return `d${node.id}/d${leftId} = ${leftId} > 0 ? 1 : 0 = ${formatNumber((left?.data ?? 0) > 0 ? 1 : 0)}`;
  }

  return `d${node.id}/d${leftId} = 1 - tanh(${leftId})^2 = ${formatNumber(1 - node.data * node.data)}`;
}

function backwardRuleFor(node: EngineNode) {
  const [leftId, rightId] = node.parents;

  if (node.op === "leaf") {
    return "Leaves don't have parents to pass gradients to!";
  }

  if (node.op === "add") {
    return `${leftId}.grad += ${node.id}.grad; ${rightId}.grad += ${node.id}.grad;`;
  }

  if (node.op === "sub") {
    return `${leftId}.grad += ${node.id}.grad; ${rightId}.grad -= ${node.id}.grad;`;
  }

  if (node.op === "mul") {
    return `${leftId}.grad += ${node.id}.grad * ${rightId}.data; ${rightId}.grad += ${node.id}.grad * ${leftId}.data;`;
  }

  if (node.op === "div") {
    return `${leftId}.grad += ${node.id}.grad / ${rightId}.data; ${rightId}.grad -= ${node.id}.grad * ${leftId}.data / (${rightId}.data * ${rightId}.data);`;
  }

  if (node.op === "relu") {
    return `${leftId}.grad += ${node.id}.grad * (${node.id}.data > 0 ? 1.0 : 0.0);`;
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
  if (node.op === "sub") {
    return `${node.id} = ${leftId} - ${rightId} = ${formatNumber(left?.data)} - ${formatNumber(right?.data)} = ${formatNumber(node.data)}`;
  }
  if (node.op === "mul") {
    return `${node.id} = ${leftId} * ${rightId} = ${formatNumber(left?.data)} * ${formatNumber(right?.data)} = ${formatNumber(node.data)}`;
  }
  if (node.op === "div") {
    return `${node.id} = ${leftId} / ${rightId} = ${formatNumber(left?.data)} / ${formatNumber(right?.data)} = ${formatNumber(node.data)}`;
  }
  if (node.op === "relu") {
    return `${node.id} = relu(${leftId}) = relu(${formatNumber(left?.data)}) = ${formatNumber(node.data)}`;
  }
  return `${node.id} = tanh(${leftId}) = tanh(${formatNumber(left?.data)}) = ${formatNumber(node.data)}`;
}

function pythonNoteFor(node: EngineNode) {
  if (node.op === "leaf") {
    return "This is a starting value! It holds our data and collects gradients, but since it has no parents, the backward step stops here.";
  }
  if (node.op === "add") {
    return "Addition is super simple: it just passes the incoming gradient equally to both of its inputs!";
  }
  if (node.op === "sub") {
    return "Subtraction passes the gradient to the first input as-is, but flips the sign for the second input.";
  }
  if (node.op === "mul") {
    return "Multiplication is a cross-over! It scales the gradient for one input using the data from the other input.";
  }
  if (node.op === "div") {
    return "Division uses the classic quotient rule to figure out how much gradient goes to the top and bottom inputs.";
  }
  if (node.op === "relu") {
    return "ReLU acts like a gatekeeper. If the data was positive, it lets the gradient flow through. Otherwise, it blocks it (0)!";
  }
  return "Tanh squishes the numbers. Its backward step scales the gradient based on how 'squished' the data got.";
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
      pythonNote: pythonNoteFor(node),
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
              if (child.op === "sub") return `${childId} adds a contribution because d${childId}/d${node.id} = ${child.parents[0] === node.id ? '1' : '-1'}.`;
              if (child.op === "mul") {
                const otherId = child.parents.find((parentId) => parentId !== node.id) ?? node.id;
                const other = nodesById.get(otherId);
                return `${childId} contributes ${childId}.grad * ${otherId}.data = ${formatNumber(finalGrads[childId])} * ${formatNumber(other?.data)}.`;
              }
              if (child.op === "div") {
                const isLeft = child.parents[0] === node.id;
                const otherId = child.parents.find((parentId) => parentId !== node.id) ?? node.id;
                const other = nodesById.get(otherId);
                return isLeft
                  ? `${childId} contributes ${childId}.grad / ${otherId}.data = ${formatNumber(finalGrads[childId])} / ${formatNumber(other?.data)}.`
                  : `${childId} contributes -${childId}.grad * ${otherId}.data / ${node.id}.data^2.`;
              }
              if (child.op === "relu") {
                return `${childId} contributes through relu with local derivative ${childId}.data > 0 ? 1 : 0.`;
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

    if (node.op === "sub") {
      const [leftId, rightId] = node.parents;
      const leftContribution = grads[node.id];
      const rightContribution = -grads[node.id];
      grads[leftId] = (grads[leftId] ?? 0) + leftContribution;
      grads[rightId] = (grads[rightId] ?? 0) + rightContribution;
      updates.push(`${leftId}.grad += ${formatNumber(leftContribution)} * 1.0 = ${formatNumber(leftContribution)}, total ${formatNumber(grads[leftId])}`);
      updates.push(`${rightId}.grad += ${formatNumber(rightContribution)} * -1.0 = ${formatNumber(rightContribution)}, total ${formatNumber(grads[rightId])}`);
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

    if (node.op === "div") {
      const [leftId, rightId] = node.parents;
      const left = nodesById.get(leftId);
      const right = nodesById.get(rightId);
      const rightValue = right?.data ?? 1;
      const guardedRight = Math.abs(rightValue) < 1e-9 ? 1e-9 : rightValue;
      const leftDeriv = safeDivide(1, rightValue);
      const rightDeriv = -(left?.data ?? 0) / (guardedRight ** 2);
      const leftContribution = grads[node.id] * leftDeriv;
      const rightContribution = grads[node.id] * rightDeriv;
      grads[leftId] = (grads[leftId] ?? 0) + leftContribution;
      grads[rightId] = (grads[rightId] ?? 0) + rightContribution;
      updates.push(`${leftId}.grad += ${formatNumber(grads[node.id])} / ${rightId}.data (${formatNumber(leftDeriv)}) = ${formatNumber(leftContribution)}, total ${formatNumber(grads[leftId])}`);
      updates.push(`${rightId}.grad += ${formatNumber(grads[node.id])} * -${leftId}.data / ${rightId}.data^2 (${formatNumber(rightDeriv)}) = ${formatNumber(rightContribution)}, total ${formatNumber(grads[rightId])}`);
    }

    if (node.op === "tanh") {
      const [parentId] = node.parents;
      const localDerivative = 1 - node.data * node.data;
      const contribution = grads[node.id] * localDerivative;
      grads[parentId] = (grads[parentId] ?? 0) + contribution;
      updates.push(`${parentId}.grad += ${formatNumber(grads[node.id])} * (1 - ${node.id}.data^2) = ${formatNumber(contribution)}, total ${formatNumber(grads[parentId])}`);
    }

    if (node.op === "relu") {
      const [parentId] = node.parents;
      const localDerivative = node.data > 0 ? 1 : 0;
      const contribution = grads[node.id] * localDerivative;
      grads[parentId] = (grads[parentId] ?? 0) + contribution;
      updates.push(`${parentId}.grad += ${formatNumber(grads[node.id])} * (${node.id}.data > 0 ? 1 : 0) = ${formatNumber(contribution)}, total ${formatNumber(grads[parentId])}`);
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
    if (node.op === "sub") values.set(node.id, left - right);
    if (node.op === "mul") values.set(node.id, left * right);
    if (node.op === "div") values.set(node.id, safeDivide(left, right));
    if (node.op === "tanh") values.set(node.id, Math.tanh(left));
    if (node.op === "relu") values.set(node.id, Math.max(0, left));
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
    title: "Your Python Code Playground",
    subtitle:
      "Type your own code! Write everyday Python math and see how it builds the computational graph.",
    objective: "Hit the 'Run My Code' button below to watch the engine break your math down step by step.",
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

function positionsFor(nodes: GraphNode[]) {
  const initialPositions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node) => {
    initialPositions[node.id] = { x: node.x, y: node.y };
  });
  return initialPositions;
}

function parsePythonLabCode(sourceCode: string): Lesson {
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
    .filter((line) => line && !line.startsWith("#"))
    .forEach((line) => {
      const numericLiteral = "[-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][-+]?\\d+)?";
      const valueMatch = line.match(new RegExp(`^([a-zA-Z_]\\w*)\\s*=\\s*Value\\((${numericLiteral})(?:,\\s*label=['"]([^'"]+)['"])?\\)$`));
      if (valueMatch) {
        const [, variable, rawValue, label] = valueMatch;
        const node: EngineNode = {
          id: variable,
          label: label || variable,
          op: "leaf",
          data: Number(rawValue),
          parents: [],
        };
        env.set(variable, node);
        nodes.push(node);
        return;
      }

      const binaryMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\s*([\+\-\*\/])\s*([a-zA-Z_]\w*)$/);
      if (binaryMatch) {
        const [, variable, leftId, opChar, rightId] = binaryMatch;
        const left = getNode(leftId, line);
        const right = getNode(rightId, line);
        const op = opChar === "+" ? "add" : opChar === "-" ? "sub" : opChar === "*" ? "mul" : "div";
        const data = op === "add" ? left.data + right.data : op === "sub" ? left.data - right.data : op === "mul" ? left.data * right.data : safeDivide(left.data, right.data);
        const node: EngineNode = {
          id: variable,
          label: `${variable} = ${leftId} ${opChar} ${rightId}`,
          op: op,
          data,
          parents: [leftId, rightId],
        };
        env.set(variable, node);
        nodes.push(node);
        return;
      }

      const unaryMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\.(tanh|relu)\(\)$/);
      if (unaryMatch) {
        const [, variable, inputId, op] = unaryMatch;
        const input = getNode(inputId, line);
        const node: EngineNode = {
          id: variable,
          label: `${variable} = ${inputId}.${op}()`,
          op: op as "tanh" | "relu",
          data: op === "tanh" ? Math.tanh(input.data) : Math.max(0, input.data),
          parents: [inputId],
        };
        env.set(variable, node);
        nodes.push(node);
        return;
      }

      const backwardMatch = line.match(/^([a-zA-Z_]\w*)\.backward\(\)$/);
      if (backwardMatch) {
        const [, id] = backwardMatch;
        getNode(id, line);
        outputId = id;
        return;
      }

      throw new Error(`Unsupported line: ${line}`);
    });

  if (nodes.length === 0) {
    throw new Error("Add at least one Value() assignment.");
  }

  if (!outputId) {
    outputId = nodes[nodes.length - 1].id;
  }

  return createLessonFromEngine(sourceCode, { nodes, outputId });
}

function circleEdgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
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
      pythonNote: "A leaf is a NodeId whose op is Op::Leaf and parents is empty.",
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
      pythonNote: "Leaves hold trainable data in the same node table as ops.",
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
      pythonNote: "Mul needs both parent data values, so the arena lookup happens before mutation.",
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
      pythonNote: "Because x is reused, Add contributes one path and Mul contributes another.",
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
      pythonNote: "This is the bug finder for grad = contribution versus grad += contribution.",
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
      pythonNote: "The arena stores one x node, while the op records two parent references to it.",
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
      pythonNote: "NodeId(0) can be copied freely; the graph owns the node data.",
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
      pythonNote: "No shared mutation is needed until the backward pass.",
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
      pythonNote: "Backward order must visit d before c so c.grad is ready.",
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
      pythonNote: "Tanh can use the output value already stored in the node.",
    },
  ];

  return [
    {
      id: "reuse",
      title: "Multiplication & Gradient Accumulation",
      subtitle: "z = x * y + x",
      objective:
        "Let's see what happens when we use the same variable 'x' twice! It should collect gradients from both paths.",
      code: `x = Value(2.0, label="x")
y = Value(-3.0, label="y")
c = x * y
d = c + x
d.backward()`,
      nodes: sharedNodes,
      edges: sharedEdges,
      topo: ["x", "y", "c", "d"],
      trace: [
        {
          phase: "Forward",
          activeNode: "d",
          grads: {},
          activeEdges: sharedEdges.map(edgeKey),
          title: "Build the graph!",
          explanation:
            "We just created four nodes. Notice how our output 'd' remembers it was made by adding 'c' and 'x'.",
          updates: ["x = 2.0", "y = -3.0", "c = x * y = -6.0", "d = c + x = -4.0"],
        },
        {
          phase: "Topo Sort",
          activeNode: "d",
          grads: {},
          activeEdges: ["c->d", "x->d"],
          title: "Figure out the backward order",
          explanation:
            "We need to figure out the right order to go backwards. Topo sort makes sure parents are visited after children.",
          updates: ["Topo order: [x, y, c, d]", "Backward order: [d, c, y, x]"],
        },
        {
          phase: "Seed Loss",
          activeNode: "d",
          grads: { d: 1 },
          activeEdges: [],
          title: "Spark the gradient",
          explanation:
            "We always start the backward pass by giving the final output a gradient of 1.0. It's the spark that starts the fire!",
          updates: ["d.grad = 1.0"],
        },
        {
          phase: "Backward",
          activeNode: "d",
          grads: { d: 1, c: 1, x: 1 },
          activeEdges: ["c->d", "x->d"],
          title: "Backprop through add",
          explanation:
            "Addition is a gradient distributor! It passes that 1.0 gradient equally to both 'c' and 'x'.",
          updates: ["c.grad += 1.0 * 1.0 = 1.0", "x.grad += 1.0 * 1.0 = 1.0"],
        },
        {
          phase: "Backward",
          activeNode: "c",
          grads: { d: 1, c: 1, x: -2, y: 2 },
          activeEdges: ["x->c", "y->c"],
          title: "Backprop through multiply",
          explanation:
            "Multiplication is a switcher. It sends y's data to x, and x's data to y, scaling by the incoming gradient.",
          updates: ["x.grad += 1.0 * -3.0 = -3.0, total -2.0", "y.grad += 1.0 * 2.0 = 2.0"],
        },
        {
          phase: "Final",
          activeNode: "x",
          grads: { d: 1, c: 1, x: -2, y: 2 },
          activeEdges: [],
          title: "Final gradients",
          explanation:
            "Because 'x' was used twice, it neatly collected gradients from both the addition and the multiplication paths!",
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
        "Let's use the same node twice in a single operation! We'll see why gradients must be added up (accumulated).",
      code: `x = Value(3.0, label="x")
y = x * x
y.backward()`,
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
            "Notice how both inputs for our multiply node point back to the very same 'x' node!",
          updates: ["x = 3.0", "y = 9.0"],
        },
        {
          phase: "Topo Sort",
          activeNode: "y",
          grads: {},
          activeEdges: ["x->y"],
          title: "Reverse the topo order",
          explanation:
            "We can only go backwards from y to x. If we tried doing x first, we wouldn't have the gradient from y yet!",
          updates: ["Topo order: [x, y]", "Backward order: [y, x]"],
        },
        {
          phase: "Seed Loss",
          activeNode: "y",
          grads: { y: 1 },
          activeEdges: [],
          title: "Seed y.grad",
          explanation: "Just like before, we kickstart the process by giving our output 'y' a gradient of 1.0.",
          updates: ["y.grad = 1.0"],
        },
        {
          phase: "Backward",
          activeNode: "y",
          grads: { y: 1, x: 6 },
          activeEdges: ["x->y"],
          title: "Apply the multiply rule twice",
          explanation:
            "The multiply node asks 'what was the other input?' for both sides. Since both are 3.0, it sends 3.0 down both paths!",
          updates: ["left contribution = 1.0 * 3.0 = 3.0", "right contribution = 1.0 * 3.0 = 3.0"],
        },
        {
          phase: "Final",
          activeNode: "x",
          grads: { y: 1, x: 6 },
          activeEdges: [],
          title: "Final gradient",
          explanation: "Our 'x' node caught 3.0 from the left and 3.0 from the right, giving a total of 6.0! This matches the calculus rule d(x²)/dx = 2x.",
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
      title: "Squishing Gradients with Tanh",
      subtitle: "d = tanh(a * b)",
      objective:
        "Watch what happens when a number gets too big! Tanh 'squishes' it, which almost completely stops the gradient from flowing backwards.",
      code: `a = Value(2.0, label="a")
b = Value(3.0, label="b")
c = a * b
d = c.tanh()
d.backward()`,
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
          explanation: "Our multiplication gave us 6.0. Tanh squishes 6.0 down to almost exactly 1.0 (it's nearly maxed out or 'saturated').",
          updates: ["c = 6.0", "d = tanh(c) = 0.9999877"],
        },
        {
          phase: "Topo Sort",
          activeNode: "d",
          grads: {},
          activeEdges: ["c->d"],
          title: "Topological dependency",
          explanation: "To go backwards, 'd' has to run first so it can pass its gradient down to 'c'.",
          updates: ["Topo order: [a, b, c, d]", "Backward order: [d, c, b, a]"],
        },
        {
          phase: "Seed Loss",
          activeNode: "d",
          grads: { d: 1 },
          activeEdges: [],
          title: "Seed d.grad",
          explanation: "We start the backward chain by giving our final output a gradient of 1.0.",
          updates: ["d.grad = 1.0"],
        },
        {
          phase: "Backward",
          activeNode: "d",
          grads: { d: 1, c: 0.000025 },
          activeEdges: ["c->d"],
          title: "Backprop through tanh",
          explanation:
            "Because our tanh was nearly maxed out, its derivative is tiny! It chokes the 1.0 gradient down to just 0.000025.",
          updates: ["c.grad += 1.0 * (1 - 0.9999877^2) = 0.000025"],
        },
        {
          phase: "Backward",
          activeNode: "c",
          grads: { d: 1, c: 0.000025, a: 0.000074, b: 0.000049 },
          activeEdges: ["a->c", "b->c"],
          title: "Backprop through multiply",
          explanation: "That tiny gradient reaches the multiply node, which splits and scales it for 'a' and 'b'.",
          updates: ["a.grad += 0.000025 * 3.0 = 0.000074", "b.grad += 0.000025 * 2.0 = 0.000049"],
        },
        {
          phase: "Final",
          activeNode: "a",
          grads: { d: 1, c: 0.000025, a: 0.000074, b: 0.000049 },
          activeEdges: [],
          title: "Final gradients",
          explanation: "The whole network suffers! Because tanh squished the forward pass, very little learning signal reaches the start.",
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
    {
      ...parsePythonLabCode(`a = Value(-2.0, label="a")
b = a.relu()
b.backward()`),
      id: "relu",
      title: "Dead ReLU",
      subtitle: "b = relu(a)",
      objective: "Watch what happens when a negative number hits a ReLU! It completely kills the gradient.",
      quiz: {
        prompt: "Why is a's gradient zero?",
        options: ["a is negative", "ReLU output is zero", "Topological sort failed"],
        answer: "a is negative",
      },
    },
  ];
}

function nodeAccent(op: OpKind) {
  if (op === "leaf") return "var(--color-primary)";
  if (op === "mul" || op === "div") return "var(--color-warning)";
  if (op === "tanh" || op === "relu") return "var(--color-error)";
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
  const [implTab, setImplTab] = useState<keyof typeof pythonImplementations>("arena");
  const [runMessage, setRunMessage] = useState(
    "Ready: edit Value(...), then run.",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(
    () => positionsFor(lessons[0].nodes),
  );

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (stepIndex >= activeLesson.trace.length - 1) {
        setIsPlaying(false);
      } else {
        setStepIndex((s) => s + 1);
      }
    }, stepIndex >= activeLesson.trace.length - 1 ? 0 : 1200);
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, activeLesson.trace.length]);

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
    setNodePositions(positionsFor(next.nodes));
    setCodeDraft(next.code);
    setQuizChoice("");
    setIsPlaying(false);
    setRunMessage("Loaded preset lesson.");
  }

  function advanceStep() {
    setStepIndex((current) => Math.min(current + 1, lesson.trace.length - 1));
  }

  function runEditorCode() {
    try {
      const customLesson = parsePythonLabCode(codeDraft);
      setActiveLesson(customLesson);
      setLessonIndex(-1);
      setStepIndex(0);
      setSelectedNodeId(customLesson.nodes[0].id);
      setNodePositions(positionsFor(customLesson.nodes));
      setQuizChoice("");
      setIsPlaying(true);
      setRunMessage("Trace complete: the expression ran through the autograd engine.");
    } catch (error) {
      setRunMessage(error instanceof Error ? error.message : "Could not run this code.");
    }
  }

  return (
    <div
      className="border border-outline bg-surface"
      data-testid="gradforge-workspace"
    >
      <div className="grid border-b border-outline bg-border lg:grid-cols-[310px_minmax(0,1fr)_330px]">
        <section className="bg-surface p-5 lg:border-r lg:border-outline">
          <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
            <BookOpen size={14} aria-hidden="true" />
            Guided Lessons
          </div>
          <div className="mb-3 border border-outline bg-surface-container-low p-3 text-xs leading-5 text-on-surface-variant">
            <p className="mb-1 font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
              Start here
            </p>
            Load a preset, step through its trace, then modify the Python
            expression in the editor below.
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
                <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
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
              <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
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
              className="absolute inset-0 size-full pointer-events-none"
              style={{ zIndex: 0 }}
              xmlns="http://www.w3.org/2000/svg"
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
                
                const posFrom = nodePositions[from.id] || { x: from.x, y: from.y };
                const posTo = nodePositions[to.id] || { x: to.x, y: to.y };

                const path = circleEdgePath(
                  posFrom,
                  posTo,
                  Math.max(siblingIndex, index),
                  siblings.length,
                );
                return (
                  <g key={`${edge.from}-${edge.to}-${index}`}>
                    <motion.path
                      initial={false}
                      animate={{
                        d: path.d,
                        stroke: active ? "var(--color-warning)" : "var(--color-outline-dark)",
                        strokeWidth: active ? 2.8 : 1.4,
                        strokeDasharray: active ? "7 5" : "0",
                        strokeDashoffset: active ? [0, -24] : 0,
                      }}
                      transition={{
                        default: { type: "spring", stiffness: 300, damping: 30 },
                        strokeDashoffset: active ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring" }
                      }}
                      fill="none"
                      markerEnd={active ? "url(#gradforge-arrow-active)" : "url(#gradforge-arrow)"}
                    />
                    <motion.text
                      initial={false}
                      animate={{ x: path.labelX, y: path.labelY - 8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      textAnchor="middle"
                      className="fill-on-surface-variant font-mono text-[9px]"
                    >
                      {edge.label}
                    </motion.text>
                  </g>
                );
              })}
            </svg>

            {lesson.nodes.map((node) => {
              const active = node.id === step.activeNode;
              const selected = node.id === selectedNode.id;
              const grad = step.grads[node.id];
              const labelParts = node.label.split(" = ");
              const pos = nodePositions[node.id] || { x: node.x, y: node.y };

              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  onDrag={(_, info) => {
                    setNodePositions(prev => ({
                      ...prev,
                      [node.id]: {
                        x: prev[node.id].x + info.delta.x,
                        y: prev[node.id].y + info.delta.y,
                      }
                    }));
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedNodeId(node.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSelectedNodeId(node.id);
                  }}
                  className="absolute cursor-pointer select-none"
                  initial={false}
                  animate={{
                    x: pos.x - 70, // offset by half width
                    y: pos.y - 35, // offset by half height
                    scale: active ? 1.05 : 1,
                    boxShadow: active
                      ? "0 0 20px 0px var(--color-primary)"
                      : selected
                        ? "0 0 0px 2px var(--color-outline)"
                        : "0 0 0px 1px var(--color-outline-dark)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{
                    width: 140,
                    height: 70,
                    borderRadius: 9999,
                    backgroundColor: active
                      ? "var(--color-primary-container)"
                      : selected
                        ? "var(--color-surface-container-high)"
                        : "var(--color-surface)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `2px solid ${active || selected ? nodeAccent(node.op) : "var(--color-outline-dark)"}`,
                    zIndex: active || selected ? 10 : 1,
                  }}
                >
                  <div className="font-mono text-[13px] font-semibold text-on-surface">
                    {labelParts[0]}
                  </div>
                  {labelParts[1] && (
                    <div className="font-mono text-[12px] text-on-surface-variant">
                      {labelParts[1].slice(0, 14)}
                    </div>
                  )}
                  <div className="mt-1 flex gap-2 font-mono text-[12px] uppercase tracking-wider">
                    <span className="text-on-surface-variant">data {formatNumber(node.data)}</span>
                    <span className="text-primary">grad {formatNumber(grad)}</span>
                  </div>
                </motion.div>
              );
            })}

            <div className="absolute left-4 top-4 border border-outline bg-surface/95 px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
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
              <div className="shrink-0 font-mono text-[13px] uppercase tracking-[0.08em] text-on-surface-variant">
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
                    "min-h-10 border px-2 py-2 font-mono text-[12px] uppercase tracking-[0.08em]",
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
          <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
            <Info size={14} />
            Maths Inspector
          </div>
          <div className="border border-outline bg-surface-container-lowest p-4">
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
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
                  <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                    {label}
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-on-surface">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-4 border border-outline bg-surface-container-lowest p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                Math Lens
              </p>
              <span className="font-mono text-[12px] text-primary">Level {lens}</span>
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
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
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
            <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
              <Braces size={14} />
              Python Editor
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
                  setNodePositions(positionsFor(next.nodes));
                  setIsPlaying(false);
                  setRunMessage("Reset to the lesson source.");
                }}
                className="inline-flex items-center gap-2 border border-outline bg-surface-container-lowest px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant hover:border-primary"
              >
                <RotateCcw size={13} />
                Reset
              </button>
              <button
                type="button"
                onClick={runEditorCode}
                className="inline-flex items-center gap-2 border border-on-surface bg-on-surface px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-background hover:bg-primary"
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
            aria-label="Python editor"
          />
          <p
            className={clsx(
              "mt-3 border px-3 py-2 font-mono text-[13px] leading-5",
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
                className="border border-outline bg-surface-container-lowest px-3 py-3 font-mono text-[13px] leading-5 text-on-surface-variant"
              >
                {update}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface p-5">
          <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
            <GitBranch size={14} />
            Python Engine Notes
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
                onClick={() => setImplTab(id as keyof typeof pythonImplementations)}
                className={clsx(
                  "bg-surface px-2 py-2 font-mono text-[12px] uppercase tracking-[0.08em]",
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
            <code>{pythonImplementations[implTab]}</code>
          </pre>
          <p className="mt-4 border border-outline bg-surface-container-lowest p-4 text-sm leading-6 text-on-surface-variant">
            {selectedNode.pythonNote}
          </p>
        </section>
      </div>

      <div className="grid bg-border lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="bg-surface p-5 lg:border-r lg:border-outline">
          <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
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
            <p className="mt-3 font-mono text-[13px] uppercase tracking-[0.08em] text-primary">
              {quizChoice === lesson.quiz.answer
                ? "Correct: the gradient trace keeps every path."
                : `Answer: ${lesson.quiz.answer}`}
            </p>
          )}
        </section>

        <section className="bg-surface p-5">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
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
                <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
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
              className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant hover:text-primary"
            >
              <ChevronLeft size={13} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => selectLesson(Math.min(lessonIndex + 1, lessons.length - 1))}
              className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant hover:text-primary"
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
