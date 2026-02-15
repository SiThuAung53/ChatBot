'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface Channel {
  id: string;
  type: 'FACEBOOK_MESSENGER' | 'TELEGRAM';
  name: string;
  isConnected: boolean;
  pageId?: string;
  webhookUrl?: string;
  createdAt: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<'FACEBOOK_MESSENGER' | 'TELEGRAM' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    accessToken: '',
    pageId: '',
    botToken: '',
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        setChannels(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch channels:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectChannel = async () => {
    if (!showModal) return;

    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: showModal,
          name: formData.name,
          accessToken: showModal === 'FACEBOOK_MESSENGER' ? formData.accessToken : undefined,
          pageId: showModal === 'FACEBOOK_MESSENGER' ? formData.pageId : undefined,
          botToken: showModal === 'TELEGRAM' ? formData.botToken : undefined,
        }),
      });

      if (res.ok) {
        setShowModal(null);
        setFormData({ name: '', accessToken: '', pageId: '', botToken: '' });
        fetchChannels();
      }
    } catch (err) {
      console.error('Failed to connect channel:', err);
    }
  };

  const deleteChannel = async (id: string) => {
    if (!confirm('Disconnect this channel?')) return;
    try {
      await fetch(`/api/channels/${id}`, { method: 'DELETE' });
      setChannels(channels.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete channel:', err);
    }
  };

  const channelIcons = {
    FACEBOOK_MESSENGER: <MessageSquare className="w-6 h-6 text-blue-600" />,
    TELEGRAM: <Send className="w-6 h-6 text-sky-500" />,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Channels</h1>
          <p className="text-gray-600 mt-1">
            Connect your messaging platforms with one click
          </p>
        </div>
      </div>

      {/* Connect buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setShowModal('FACEBOOK_MESSENGER')}
          className="card flex items-center gap-4 hover:shadow-md transition-shadow text-left"
        >
          <div className="bg-blue-100 p-3 rounded-xl">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Facebook Messenger</h3>
            <p className="text-sm text-gray-500">
              Connect your Facebook Page to receive and send messages
            </p>
          </div>
          <Plus className="w-5 h-5 text-gray-400 ml-auto" />
        </button>

        <button
          onClick={() => setShowModal('TELEGRAM')}
          className="card flex items-center gap-4 hover:shadow-md transition-shadow text-left"
        >
          <div className="bg-sky-100 p-3 rounded-xl">
            <Send className="w-8 h-8 text-sky-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Telegram</h3>
            <p className="text-sm text-gray-500">
              Connect your Telegram bot to automate conversations
            </p>
          </div>
          <Plus className="w-5 h-5 text-gray-400 ml-auto" />
        </button>
      </div>

      {/* Connected channels */}
      <h2 className="text-lg font-semibold mb-4">Connected Channels</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : channels.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No channels connected yet. Click above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {channelIcons[channel.type]}
                <div>
                  <p className="font-medium text-gray-900">{channel.name}</p>
                  <p className="text-sm text-gray-500">
                    {channel.type === 'FACEBOOK_MESSENGER'
                      ? 'Facebook Messenger'
                      : 'Telegram'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {channel.isConnected ? (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-red-500">
                    <XCircle className="w-4 h-4" /> Disconnected
                  </span>
                )}
                <button
                  onClick={() => deleteChannel(channel.id)}
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
            <h3 className="text-lg font-semibold mb-4">
              Connect{' '}
              {showModal === 'FACEBOOK_MESSENGER'
                ? 'Facebook Messenger'
                : 'Telegram'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                  placeholder="e.g. My Business Page"
                />
              </div>

              {showModal === 'FACEBOOK_MESSENGER' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Access Token
                    </label>
                    <input
                      type="password"
                      value={formData.accessToken}
                      onChange={(e) =>
                        setFormData({ ...formData, accessToken: e.target.value })
                      }
                      className="input"
                      placeholder="Paste your Page Access Token"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page ID
                    </label>
                    <input
                      type="text"
                      value={formData.pageId}
                      onChange={(e) =>
                        setFormData({ ...formData, pageId: e.target.value })
                      }
                      className="input"
                      placeholder="Your Facebook Page ID"
                    />
                  </div>
                </>
              )}

              {showModal === 'TELEGRAM' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bot Token
                  </label>
                  <input
                    type="password"
                    value={formData.botToken}
                    onChange={(e) =>
                      setFormData({ ...formData, botToken: e.target.value })
                    }
                    className="input"
                    placeholder="Paste your bot token from @BotFather"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={connectChannel} className="btn-primary flex-1">
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
