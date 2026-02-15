'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Check } from 'lucide-react';

interface ApiKeyEntry {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  createdAt: string;
  lastUsed: string | null;
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/settings/api-keys');
      if (res.ok) setApiKeys(await res.json());
    } catch (err) {
      console.error('Failed to fetch keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      if (res.ok) {
        const key = await res.json();
        setNewKey(key.key);
        setNewKeyName('');
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to create key:', err);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return;
    try {
      await fetch(`/api/settings/api-keys/${id}`, { method: 'DELETE' });
      setApiKeys(apiKeys.filter((k) => k.id !== id));
    } catch (err) {
      console.error('Failed to delete key:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your API keys and account settings
        </p>
      </div>

      {/* API Keys */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">API Keys</h2>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New Key
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          API keys are used to authenticate requests to the REST API from your
          Android app or external services.
        </p>

        {/* New key display */}
        {newKey && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-green-800 mb-2">
              API key created! Copy it now - it won&apos;t be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                {newKey}
              </code>
              <button
                onClick={() => copyToClipboard(newKey)}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="text-sm text-green-700 mt-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="input flex-1"
                placeholder="Key name (e.g. Android App, Production)"
              />
              <button onClick={createKey} className="btn-primary text-sm">
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Keys list */}
        {loading ? (
          <p className="text-gray-500 py-4">Loading...</p>
        ) : apiKeys.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">
            No API keys yet. Create one to get started.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">
                  Key
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">
                  Last Used
                </th>
                <th className="text-right py-2 text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm font-medium">{key.name}</td>
                  <td className="py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {key.key}
                    </code>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        key.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {key.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    {key.lastUsed
                      ? new Date(key.lastUsed).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => deleteKey(key.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
