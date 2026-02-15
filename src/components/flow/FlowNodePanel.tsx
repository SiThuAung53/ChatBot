'use client';

import {
  MessageSquare,
  Image,
  MousePointerClick,
  GitBranch,
  Clock,
  Variable,
  Globe,
  Sheet,
  UserCheck,
  Zap,
  ScanLine,
  MessageCircle,
} from 'lucide-react';

const nodeCategories = [
  {
    label: 'Triggers',
    items: [
      {
        type: 'trigger',
        label: 'Trigger',
        icon: Zap,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      },
    ],
  },
  {
    label: 'Messages',
    items: [
      {
        type: 'sendMessage',
        label: 'Send Message',
        icon: MessageSquare,
        color: 'bg-blue-100 text-blue-700 border-blue-300',
      },
      {
        type: 'sendImage',
        label: 'Send Image',
        icon: Image,
        color: 'bg-blue-100 text-blue-700 border-blue-300',
      },
      {
        type: 'sendButton',
        label: 'Send Buttons',
        icon: MousePointerClick,
        color: 'bg-blue-100 text-blue-700 border-blue-300',
      },
      {
        type: 'sendQuickReply',
        label: 'Quick Reply',
        icon: MessageCircle,
        color: 'bg-blue-100 text-blue-700 border-blue-300',
      },
    ],
  },
  {
    label: 'Logic',
    items: [
      {
        type: 'condition',
        label: 'Condition',
        icon: GitBranch,
        color: 'bg-orange-100 text-orange-700 border-orange-300',
      },
      {
        type: 'delay',
        label: 'Delay',
        icon: Clock,
        color: 'bg-gray-100 text-gray-700 border-gray-300',
      },
      {
        type: 'setVariable',
        label: 'Set Variable',
        icon: Variable,
        color: 'bg-gray-100 text-gray-700 border-gray-300',
      },
    ],
  },
  {
    label: 'Integrations',
    items: [
      {
        type: 'httpRequest',
        label: 'HTTP Request',
        icon: Globe,
        color: 'bg-green-100 text-green-700 border-green-300',
      },
      {
        type: 'googleSheet',
        label: 'Google Sheet',
        icon: Sheet,
        color: 'bg-green-100 text-green-700 border-green-300',
      },
      {
        type: 'ocrProcess',
        label: 'OCR Process',
        icon: ScanLine,
        color: 'bg-green-100 text-green-700 border-green-300',
      },
    ],
  },
  {
    label: 'Actions',
    items: [
      {
        type: 'assignAgent',
        label: 'Assign Agent',
        icon: UserCheck,
        color: 'bg-purple-100 text-purple-700 border-purple-300',
      },
    ],
  },
];

export default function FlowNodePanel() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Node Types</h3>
      {nodeCategories.map((category) => (
        <div key={category.label} className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            {category.label}
          </p>
          <div className="space-y-2">
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type, item.label)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
