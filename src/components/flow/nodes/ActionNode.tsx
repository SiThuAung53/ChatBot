'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Clock, Variable, Globe, Sheet, UserCheck, ScanLine } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

const configMap: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  delay: { icon: Clock, label: 'Delay', color: 'gray' },
  setVariable: { icon: Variable, label: 'Set Variable', color: 'gray' },
  httpRequest: { icon: Globe, label: 'HTTP Request', color: 'green' },
  googleSheet: { icon: Sheet, label: 'Google Sheet', color: 'green' },
  assignAgent: { icon: UserCheck, label: 'Assign Agent', color: 'purple' },
  ocrProcess: { icon: ScanLine, label: 'OCR Process', color: 'green' },
};

function ActionNode({ data, selected }: NodeProps<FlowNodeData>) {
  const config = configMap[data.type] || configMap.delay;
  const Icon = config.icon;
  const borderColor = selected ? `border-${config.color}-500` : `border-${config.color}-300`;
  const bgColor = `bg-${config.color}-100`;
  const textColor = `text-${config.color}-700`;

  const renderContent = () => {
    switch (data.type) {
      case 'delay':
        return (
          <p className="text-sm text-gray-700">
            Wait {data.delaySeconds || '?'} seconds
          </p>
        );
      case 'setVariable':
        return (
          <p className="text-sm text-gray-700">
            <span className="font-mono">{data.variableName || '?'}</span> ={' '}
            <span className="font-mono">{data.variableValue || '?'}</span>
          </p>
        );
      case 'httpRequest':
        return (
          <p className="text-sm text-gray-700">
            <span className="font-medium">{data.httpMethod || 'GET'}</span>{' '}
            {data.httpUrl || 'Set URL...'}
          </p>
        );
      case 'googleSheet':
        return (
          <p className="text-sm text-gray-700">
            {data.sheetAction === 'append'
              ? 'Append row'
              : data.sheetAction === 'read'
              ? 'Read data'
              : data.sheetAction === 'update'
              ? 'Update data'
              : 'Configure...'}
          </p>
        );
      case 'assignAgent':
        return (
          <p className="text-sm text-gray-700">
            {data.agentId ? 'Agent assigned' : 'Select agent...'}
          </p>
        );
      case 'ocrProcess':
        return (
          <p className="text-sm text-gray-700">
            {data.ocrInputVariable
              ? `Process: ${data.ocrInputVariable}`
              : 'Configure OCR...'}
          </p>
        );
      default:
        return <p className="text-sm text-gray-500">Configure...</p>;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 min-w-[200px] ${borderColor}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`!bg-${config.color}-500 !w-3 !h-3`}
      />
      <div className={`${bgColor} px-4 py-2 rounded-t-lg flex items-center gap-2`}>
        <Icon className={`w-4 h-4 ${textColor}`} />
        <span className={`text-sm font-semibold ${textColor}`}>
          {config.label}
        </span>
      </div>
      <div className="px-4 py-3">{renderContent()}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!bg-${config.color}-500 !w-3 !h-3`}
      />
    </div>
  );
}

export default memo(ActionNode);
