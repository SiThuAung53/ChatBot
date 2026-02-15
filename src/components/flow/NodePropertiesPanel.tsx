'use client';

import { X, Plus, Trash2 } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { v4 as uuidv4 } from 'uuid';

export default function NodePropertiesPanel() {
  const { selectedNode, updateNodeData, deleteNode, setSelectedNode } =
    useFlowStore();

  if (!selectedNode) return null;

  const { data } = selectedNode;

  const handleChange = (field: string, value: unknown) => {
    updateNodeData(selectedNode.id, { [field]: value });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Node Properties</h3>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="input"
          />
        </div>

        {/* Trigger config */}
        {data.type === 'trigger' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Type
              </label>
              <select
                value={data.triggerType || 'keyword'}
                onChange={(e) => handleChange('triggerType', e.target.value)}
                className="input"
              >
                <option value="keyword">Keyword</option>
                <option value="firstMessage">First Message</option>
                <option value="buttonClick">Button Click</option>
                <option value="manual">Manual</option>
                <option value="api">API</option>
              </select>
            </div>
            {data.triggerType === 'keyword' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keyword
                </label>
                <input
                  type="text"
                  value={data.triggerValue || ''}
                  onChange={(e) => handleChange('triggerValue', e.target.value)}
                  className="input"
                  placeholder="e.g. hello, start"
                />
              </div>
            )}
          </>
        )}

        {/* Message config */}
        {(data.type === 'sendMessage' || data.type === 'sendButton' || data.type === 'sendQuickReply') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={data.message || ''}
              onChange={(e) => handleChange('message', e.target.value)}
              className="input min-h-[80px]"
              placeholder="Type your message... Use {{variable}} for dynamic content"
            />
          </div>
        )}

        {/* Image config */}
        {data.type === 'sendImage' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={data.imageUrl || ''}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              className="input"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}

        {/* Buttons config */}
        {data.type === 'sendButton' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buttons
            </label>
            <div className="space-y-2">
              {(data.buttons || []).map((btn, idx) => (
                <div key={btn.id} className="flex gap-2">
                  <input
                    type="text"
                    value={btn.label}
                    onChange={(e) => {
                      const buttons = [...(data.buttons || [])];
                      buttons[idx] = { ...btn, label: e.target.value };
                      handleChange('buttons', buttons);
                    }}
                    className="input flex-1"
                    placeholder="Button label"
                  />
                  <button
                    onClick={() => {
                      const buttons = (data.buttons || []).filter(
                        (_, i) => i !== idx
                      );
                      handleChange('buttons', buttons);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const buttons = [
                    ...(data.buttons || []),
                    { id: uuidv4(), label: 'Button', value: 'button' },
                  ];
                  handleChange('buttons', buttons);
                }}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" /> Add Button
              </button>
            </div>
          </div>
        )}

        {/* Quick Replies config */}
        {data.type === 'sendQuickReply' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quick Replies
            </label>
            <div className="space-y-2">
              {(data.quickReplies || []).map((qr, idx) => (
                <div key={qr.id} className="flex gap-2">
                  <input
                    type="text"
                    value={qr.label}
                    onChange={(e) => {
                      const quickReplies = [...(data.quickReplies || [])];
                      quickReplies[idx] = { ...qr, label: e.target.value };
                      handleChange('quickReplies', quickReplies);
                    }}
                    className="input flex-1"
                    placeholder="Reply text"
                  />
                  <button
                    onClick={() => {
                      const quickReplies = (data.quickReplies || []).filter(
                        (_, i) => i !== idx
                      );
                      handleChange('quickReplies', quickReplies);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const quickReplies = [
                    ...(data.quickReplies || []),
                    { id: uuidv4(), label: 'Reply', value: 'reply' },
                  ];
                  handleChange('quickReplies', quickReplies);
                }}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" /> Add Reply
              </button>
            </div>
          </div>
        )}

        {/* Condition config */}
        {data.type === 'condition' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field / Variable
              </label>
              <input
                type="text"
                value={data.conditionField || ''}
                onChange={(e) => handleChange('conditionField', e.target.value)}
                className="input"
                placeholder="e.g. {{user_input}}, {{name}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator
              </label>
              <select
                value={data.conditionOperator || 'equals'}
                onChange={(e) =>
                  handleChange('conditionOperator', e.target.value)
                }
                className="input"
              >
                <option value="equals">Equals</option>
                <option value="notEquals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="notContains">Not Contains</option>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
                <option value="exists">Exists</option>
                <option value="notExists">Not Exists</option>
                <option value="regex">Regex Match</option>
              </select>
            </div>
            {data.conditionOperator !== 'exists' &&
              data.conditionOperator !== 'notExists' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={data.conditionValue || ''}
                    onChange={(e) =>
                      handleChange('conditionValue', e.target.value)
                    }
                    className="input"
                    placeholder="Compare value"
                  />
                </div>
              )}
          </>
        )}

        {/* Delay config */}
        {data.type === 'delay' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay (seconds)
            </label>
            <input
              type="number"
              value={data.delaySeconds || 1}
              onChange={(e) =>
                handleChange('delaySeconds', parseInt(e.target.value))
              }
              className="input"
              min={1}
              max={86400}
            />
          </div>
        )}

        {/* Variable config */}
        {data.type === 'setVariable' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variable Name
              </label>
              <input
                type="text"
                value={data.variableName || ''}
                onChange={(e) => handleChange('variableName', e.target.value)}
                className="input"
                placeholder="my_variable"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="text"
                value={data.variableValue || ''}
                onChange={(e) => handleChange('variableValue', e.target.value)}
                className="input"
                placeholder="Value or {{variable}}"
              />
            </div>
          </>
        )}

        {/* HTTP Request config */}
        {data.type === 'httpRequest' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={data.httpMethod || 'GET'}
                onChange={(e) => handleChange('httpMethod', e.target.value)}
                className="input"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={data.httpUrl || ''}
                onChange={(e) => handleChange('httpUrl', e.target.value)}
                className="input"
                placeholder="https://api.example.com/data"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body (JSON)
              </label>
              <textarea
                value={data.httpBody || ''}
                onChange={(e) => handleChange('httpBody', e.target.value)}
                className="input min-h-[60px] font-mono text-sm"
                placeholder='{"key": "{{value}}"}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Save Response To
              </label>
              <input
                type="text"
                value={data.httpResponseVariable || ''}
                onChange={(e) =>
                  handleChange('httpResponseVariable', e.target.value)
                }
                className="input"
                placeholder="response_data"
              />
            </div>
          </>
        )}

        {/* Google Sheet config */}
        {data.type === 'googleSheet' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={data.sheetAction || 'append'}
                onChange={(e) => handleChange('sheetAction', e.target.value)}
                className="input"
              >
                <option value="append">Append Row</option>
                <option value="read">Read Data</option>
                <option value="update">Update Data</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spreadsheet ID
              </label>
              <input
                type="text"
                value={data.sheetId || ''}
                onChange={(e) => handleChange('sheetId', e.target.value)}
                className="input"
                placeholder="Sheet ID from URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Range
              </label>
              <input
                type="text"
                value={data.sheetRange || ''}
                onChange={(e) => handleChange('sheetRange', e.target.value)}
                className="input"
                placeholder="Sheet1!A:E"
              />
            </div>
          </>
        )}

        {/* OCR config */}
        {data.type === 'ocrProcess' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Variable (Image URL)
              </label>
              <input
                type="text"
                value={data.ocrInputVariable || ''}
                onChange={(e) =>
                  handleChange('ocrInputVariable', e.target.value)
                }
                className="input"
                placeholder="{{image_url}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Save Result To
              </label>
              <input
                type="text"
                value={data.ocrOutputVariable || ''}
                onChange={(e) =>
                  handleChange('ocrOutputVariable', e.target.value)
                }
                className="input"
                placeholder="ocr_text"
              />
            </div>
          </>
        )}

        {/* Delete button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              deleteNode(selectedNode.id);
              setSelectedNode(null);
            }}
            className="btn-danger w-full flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Node
          </button>
        </div>
      </div>
    </div>
  );
}
