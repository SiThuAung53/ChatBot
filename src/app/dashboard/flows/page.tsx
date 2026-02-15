'use client';

import { useState, useEffect } from 'react';
import { Plus, Workflow, Search, MoreVertical, Trash2, Copy, Power } from 'lucide-react';
import Link from 'next/link';

interface Flow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  triggerType: string;
  createdAt: string;
  updatedAt: string;
  _count?: { executions: number };
}

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      const res = await fetch('/api/flows');
      if (res.ok) {
        const data = await res.json();
        setFlows(data);
      }
    } catch (err) {
      console.error('Failed to fetch flows:', err);
    } finally {
      setLoading(false);
    }
  };

  const createFlow = async () => {
    try {
      const res = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Flow' }),
      });
      if (res.ok) {
        const flow = await res.json();
        window.location.href = `/dashboard/flows/${flow.id}`;
      }
    } catch (err) {
      console.error('Failed to create flow:', err);
    }
  };

  const deleteFlow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flow?')) return;
    try {
      await fetch(`/api/flows/${id}`, { method: 'DELETE' });
      setFlows(flows.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Failed to delete flow:', err);
    }
  };

  const toggleFlow = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/flows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setFlows(
          flows.map((f) => (f.id === id ? { ...f, isActive: !isActive } : f))
        );
      }
    } catch (err) {
      console.error('Failed to toggle flow:', err);
    }
  };

  const filteredFlows = flows.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flow Builder</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your chatbot conversation flows
          </p>
        </div>
        <button onClick={createFlow} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Flow
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search flows..."
          className="input pl-10"
        />
      </div>

      {/* Flows Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredFlows.length === 0 ? (
        <div className="text-center py-12">
          <Workflow className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flows yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first flow to start automating conversations
          </p>
          <button onClick={createFlow} className="btn-primary">
            Create Flow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlows.map((flow) => (
            <div key={flow.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Link
                  href={`/dashboard/flows/${flow.id}`}
                  className="font-semibold text-gray-900 hover:text-primary-600"
                >
                  {flow.name}
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFlow(flow.id, flow.isActive)}
                    className={`p-1 rounded ${
                      flow.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={flow.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFlow(flow.id)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {flow.description && (
                <p className="text-sm text-gray-500 mb-3">{flow.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Trigger: {flow.triggerType.toLowerCase().replace('_', ' ')}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    flow.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {flow.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
