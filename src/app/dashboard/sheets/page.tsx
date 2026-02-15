'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface GoogleSheetEntry {
  id: string;
  name: string;
  spreadsheetId: string;
  sheetName: string;
  isConnected: boolean;
  createdAt: string;
}

export default function SheetsPage() {
  const [sheets, setSheets] = useState<GoogleSheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    spreadsheetId: '',
    sheetName: 'Sheet1',
  });

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const res = await fetch('/api/sheets');
      if (res.ok) setSheets(await res.json());
    } catch (err) {
      console.error('Failed to fetch sheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectSheet = async () => {
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', spreadsheetId: '', sheetName: 'Sheet1' });
        fetchSheets();
      }
    } catch (err) {
      console.error('Failed to connect sheet:', err);
    }
  };

  const deleteSheet = async (id: string) => {
    if (!confirm('Disconnect this sheet?')) return;
    try {
      await fetch(`/api/sheets/${id}`, { method: 'DELETE' });
      setSheets(sheets.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete sheet:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google Sheets</h1>
          <p className="text-gray-600 mt-1">
            Connect Google Sheets to store and manage chatbot data
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Connect Sheet
        </button>
      </div>

      {/* One-click connect info */}
      <div className="card mb-6 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <Sheet className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">One-Click Integration</h3>
            <p className="text-sm text-green-700 mt-1">
              Simply paste your Google Sheet ID (from the URL) and we&apos;ll connect
              it automatically. Use the Google Sheet node in Flow Builder to
              read/write data.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : sheets.length === 0 ? (
        <div className="card text-center py-12">
          <Sheet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No sheets connected
          </h3>
          <p className="text-gray-500 mb-4">
            Connect a Google Sheet to start syncing data with your chatbots
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Connect Sheet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Sheet className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{sheet.name}</p>
                  <p className="text-sm text-gray-500">
                    Sheet: {sheet.sheetName} &middot; ID: {sheet.spreadsheetId.slice(0, 20)}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {sheet.isConnected ? (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-red-500">
                    <XCircle className="w-4 h-4" /> Error
                  </span>
                )}
                <button
                  onClick={() => deleteSheet(sheet.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Connect Google Sheet</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                  placeholder="e.g. Customer Leads"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spreadsheet ID
                </label>
                <input
                  type="text"
                  value={formData.spreadsheetId}
                  onChange={(e) =>
                    setFormData({ ...formData, spreadsheetId: e.target.value })
                  }
                  className="input"
                  placeholder="From your Google Sheet URL"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this in your sheet URL: docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sheet Name
                </label>
                <input
                  type="text"
                  value={formData.sheetName}
                  onChange={(e) =>
                    setFormData({ ...formData, sheetName: e.target.value })
                  }
                  className="input"
                  placeholder="Sheet1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={connectSheet} className="btn-primary flex-1">
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
