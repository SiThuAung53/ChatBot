export type NodeType =
  | 'trigger'
  | 'sendMessage'
  | 'sendImage'
  | 'sendButton'
  | 'sendQuickReply'
  | 'condition'
  | 'delay'
  | 'setVariable'
  | 'httpRequest'
  | 'googleSheet'
  | 'assignAgent'
  | 'ocrProcess';

export interface FlowNodeData {
  label: string;
  type: NodeType;
  // Trigger
  triggerType?: 'keyword' | 'firstMessage' | 'buttonClick' | 'manual' | 'api';
  triggerValue?: string;
  // Message
  message?: string;
  imageUrl?: string;
  // Buttons
  buttons?: { id: string; label: string; value: string }[];
  quickReplies?: { id: string; label: string; value: string }[];
  // Condition
  conditionField?: string;
  conditionOperator?: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists' | 'regex';
  conditionValue?: string;
  // Delay
  delaySeconds?: number;
  // Variable
  variableName?: string;
  variableValue?: string;
  // HTTP Request
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  httpUrl?: string;
  httpHeaders?: Record<string, string>;
  httpBody?: string;
  httpResponseVariable?: string;
  // Google Sheet
  sheetId?: string;
  sheetAction?: 'read' | 'append' | 'update';
  sheetRange?: string;
  sheetData?: Record<string, string>;
  // Agent
  agentId?: string;
  // OCR
  ocrInputVariable?: string;
  ocrOutputVariable?: string;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
}
