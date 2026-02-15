'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Play } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import FlowCanvas from '@/components/flow/FlowCanvas';
import FlowNodePanel from '@/components/flow/FlowNodePanel';
import NodePropertiesPanel from '@/components/flow/NodePropertiesPanel';

export default function FlowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const {
    nodes,
    edges,
    selectedNode,
    flowName,
    setNodes,
    setEdges,
    setFlowId,
    setFlowName,
    resetFlow,
  } = useFlowStore();

  useEffect(() => {
    const loadFlow = async () => {
      try {
        const res = await fetch(`/api/flows/${params.id}`);
        if (res.ok) {
          const flow = await res.json();
          setFlowId(flow.id);
          setFlowName(flow.name);
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
        }
      } catch (err) {
        console.error('Failed to load flow:', err);
      }
    };

    if (params.id) {
      loadFlow();
    }

    return () => resetFlow();
  }, [params.id, setFlowId, setFlowName, setNodes, setEdges, resetFlow]);

  const saveFlow = async () => {
    setSaving(true);
    try {
      await fetch(`/api/flows/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: flowName,
          nodes,
          edges,
        }),
      });
    } catch (err) {
      console.error('Failed to save flow:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/flows')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveFlow}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        <FlowNodePanel />
        <FlowCanvas />
        {selectedNode && <NodePropertiesPanel />}
      </div>
    </div>
  );
}
