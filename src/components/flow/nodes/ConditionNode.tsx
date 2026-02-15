'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

const operatorLabels: Record<string, string> = {
  equals: '=',
  notEquals: '!=',
  contains: 'contains',
  notContains: '!contains',
  greaterThan: '>',
  lessThan: '<',
  exists: 'exists',
  notExists: '!exists',
  regex: 'regex',
};

function ConditionNode({ data, selected }: NodeProps<FlowNodeData>) {
  const op = data.conditionOperator
    ? operatorLabels[data.conditionOperator] || data.conditionOperator
    : '?';

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 min-w-[220px] ${
        selected ? 'border-orange-500' : 'border-orange-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-orange-500 !w-3 !h-3"
      />
      <div className="bg-orange-100 px-4 py-2 rounded-t-lg flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-orange-700" />
        <span className="text-sm font-semibold text-orange-700">Condition</span>
      </div>
      <div className="px-4 py-3">
        {data.conditionField ? (
          <p className="text-sm text-gray-700">
            <span className="font-mono bg-gray-100 px-1 rounded">
              {data.conditionField}
            </span>{' '}
            <span className="text-orange-600 font-medium">{op}</span>{' '}
            {data.conditionValue && (
              <span className="font-mono bg-gray-100 px-1 rounded">
                {data.conditionValue}
              </span>
            )}
          </p>
        ) : (
          <p className="text-sm text-gray-500">Set condition...</p>
        )}
      </div>
      <div className="flex border-t border-gray-200">
        <div className="flex-1 text-center py-2 border-r border-gray-200">
          <span className="text-xs font-medium text-green-600">True</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="!bg-green-500 !w-3 !h-3 !left-1/4"
          />
        </div>
        <div className="flex-1 text-center py-2">
          <span className="text-xs font-medium text-red-600">False</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="!bg-red-500 !w-3 !h-3 !left-3/4"
          />
        </div>
      </div>
    </div>
  );
}

export default memo(ConditionNode);
