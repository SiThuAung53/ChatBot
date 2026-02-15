'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

function TriggerNode({ data, selected }: NodeProps<FlowNodeData>) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 min-w-[200px] ${
        selected ? 'border-yellow-500' : 'border-yellow-300'
      }`}
    >
      <div className="bg-yellow-100 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-700" />
        <span className="text-sm font-semibold text-yellow-700">Trigger</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500">When</p>
        <p className="text-sm font-medium">
          {data.triggerType === 'keyword'
            ? `Keyword: "${data.triggerValue || '...'}"`
            : data.triggerType === 'firstMessage'
            ? 'First Message'
            : data.triggerType === 'buttonClick'
            ? 'Button Click'
            : data.triggerType === 'manual'
            ? 'Manual Trigger'
            : data.triggerType === 'api'
            ? 'API Trigger'
            : 'Select trigger...'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-yellow-500 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(TriggerNode);
