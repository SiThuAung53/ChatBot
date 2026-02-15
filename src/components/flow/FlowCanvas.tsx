'use client';

import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { useFlowStore } from '@/store/flowStore';
import { FlowNodeData, NodeType } from '@/types/flow';
import TriggerNode from './nodes/TriggerNode';
import MessageNode from './nodes/MessageNode';
import ConditionNode from './nodes/ConditionNode';
import ActionNode from './nodes/ActionNode';

const nodeTypes = {
  trigger: TriggerNode,
  sendMessage: MessageNode,
  sendImage: MessageNode,
  sendButton: MessageNode,
  sendQuickReply: MessageNode,
  condition: ConditionNode,
  delay: ActionNode,
  setVariable: ActionNode,
  httpRequest: ActionNode,
  googleSheet: ActionNode,
  assignAgent: ActionNode,
  ocrProcess: ActionNode,
};

function FlowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
  } = useFlowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type') as NodeType;
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 30,
      };

      const newNode: Node<FlowNodeData> = {
        id: uuidv4(),
        type,
        position,
        data: {
          label: label || type,
          type,
          triggerType: type === 'trigger' ? 'keyword' : undefined,
          buttons: type === 'sendButton' ? [] : undefined,
          quickReplies: type === 'sendQuickReply' ? [] : undefined,
          httpMethod: type === 'httpRequest' ? 'GET' : undefined,
          sheetAction: type === 'googleSheet' ? 'append' : undefined,
          delaySeconds: type === 'delay' ? 5 : undefined,
          conditionOperator: type === 'condition' ? 'equals' : undefined,
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<FlowNodeData>) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        }}
      >
        <Background gap={15} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            switch (n.type) {
              case 'trigger':
                return '#fbbf24';
              case 'condition':
                return '#f97316';
              case 'sendMessage':
              case 'sendImage':
              case 'sendButton':
              case 'sendQuickReply':
                return '#3b82f6';
              default:
                return '#6b7280';
            }
          }}
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
