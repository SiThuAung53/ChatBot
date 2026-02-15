import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { FlowNodeData } from '@/types/flow';

interface FlowState {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  selectedNode: Node<FlowNodeData> | null;
  flowId: string | null;
  flowName: string;
  isDirty: boolean;

  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<FlowNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: Node<FlowNodeData> | null) => void;
  setFlowId: (id: string | null) => void;
  setFlowName: (name: string) => void;
  resetFlow: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  flowId: null,
  flowName: 'Untitled Flow',
  isDirty: false,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) =>
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    }),

  onEdgesChange: (changes) =>
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    }),

  onConnect: (connection) =>
    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        },
        get().edges
      ),
      isDirty: true,
    }),

  addNode: (node) =>
    set({
      nodes: [...get().nodes, node],
      isDirty: true,
    }),

  updateNodeData: (nodeId, data) =>
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
      isDirty: true,
    }),

  deleteNode: (nodeId) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNode:
        get().selectedNode?.id === nodeId ? null : get().selectedNode,
      isDirty: true,
    }),

  setSelectedNode: (node) => set({ selectedNode: node }),
  setFlowId: (id) => set({ flowId: id }),
  setFlowName: (name) => set({ flowName: name, isDirty: true }),

  resetFlow: () =>
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      flowId: null,
      flowName: 'Untitled Flow',
      isDirty: false,
    }),
}));
