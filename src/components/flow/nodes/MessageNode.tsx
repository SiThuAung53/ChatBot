'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MessageSquare, Image, MousePointerClick, MessageCircle } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

const iconMap = {
  sendMessage: MessageSquare,
  sendImage: Image,
  sendButton: MousePointerClick,
  sendQuickReply: MessageCircle,
};

const labelMap = {
  sendMessage: 'Send Message',
  sendImage: 'Send Image',
  sendButton: 'Send Buttons',
  sendQuickReply: 'Quick Reply',
};

function MessageNode({ data, selected }: NodeProps<FlowNodeData>) {
  const Icon = iconMap[data.type as keyof typeof iconMap] || MessageSquare;
  const label = labelMap[data.type as keyof typeof labelMap] || data.label;

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 min-w-[200px] ${
        selected ? 'border-blue-500' : 'border-blue-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3"
      />
      <div className="bg-blue-100 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-700" />
        <span className="text-sm font-semibold text-blue-700">{label}</span>
      </div>
      <div className="px-4 py-3">
        {data.type === 'sendMessage' && (
          <p className="text-sm text-gray-700 line-clamp-3">
            {data.message || 'Enter message...'}
          </p>
        )}
        {data.type === 'sendImage' && (
          <p className="text-sm text-gray-500">
            {data.imageUrl ? 'Image configured' : 'Set image URL...'}
          </p>
        )}
        {data.type === 'sendButton' && (
          <div className="space-y-1">
            <p className="text-sm text-gray-700">{data.message || 'Message...'}</p>
            {data.buttons?.map((btn) => (
              <div
                key={btn.id}
                className="text-xs bg-blue-50 px-2 py-1 rounded text-blue-600"
              >
                {btn.label}
              </div>
            ))}
          </div>
        )}
        {data.type === 'sendQuickReply' && (
          <div className="flex flex-wrap gap-1">
            {data.quickReplies?.map((qr) => (
              <span
                key={qr.id}
                className="text-xs bg-blue-50 px-2 py-1 rounded-full text-blue-600"
              >
                {qr.label}
              </span>
            )) || <p className="text-sm text-gray-500">Add quick replies...</p>}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(MessageNode);
