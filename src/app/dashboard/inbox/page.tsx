'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  User,
  MessageSquare,
  Workflow,
  MoreVertical,
  CheckCircle2,
  Clock,
  UserPlus,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Chat {
  id: string;
  status: string;
  contact: {
    id: string;
    name: string;
    platformId: string;
    avatarUrl?: string;
  };
  channel: {
    type: string;
    name: string;
  };
  messages: Message[];
  updatedAt: string;
}

interface Message {
  id: string;
  direction: 'INCOMING' | 'OUTGOING';
  type: string;
  content: string;
  createdAt: string;
  sender?: { name: string };
}

interface Flow {
  id: string;
  name: string;
}

export default function InboxPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [showFlowMenu, setShowFlowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
    fetchFlows();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/inbox');
      if (res.ok) setChats(await res.json());
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlows = async () => {
    try {
      const res = await fetch('/api/flows');
      if (res.ok) setFlows(await res.json());
    } catch (err) {
      console.error('Failed to fetch flows:', err);
    }
  };

  const selectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    try {
      const res = await fetch(`/api/inbox/${chat.id}/messages`);
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const res = await fetch(`/api/inbox/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages([...messages, msg]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const sendFlow = async (flowId: string) => {
    if (!selectedChat) return;
    setShowFlowMenu(false);

    try {
      await fetch(`/api/inbox/${selectedChat.id}/send-flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId }),
      });
      // Refresh messages
      const res = await fetch(`/api/inbox/${selectedChat.id}/messages`);
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error('Failed to send flow:', err);
    }
  };

  const resolveChat = async () => {
    if (!selectedChat) return;
    try {
      await fetch(`/api/inbox/${selectedChat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      setChats(
        chats.map((c) =>
          c.id === selectedChat.id ? { ...c, status: 'RESOLVED' } : c
        )
      );
      setSelectedChat({ ...selectedChat, status: 'RESOLVED' });
    } catch (err) {
      console.error('Failed to resolve chat:', err);
    }
  };

  const filteredChats = chats.filter(
    (c) =>
      c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
      c.channel.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-48px)] -m-6">
      {/* Chat List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg mb-3">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="input pl-9 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : filteredChats.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No conversations</p>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {chat.contact.name}
                      </p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          chat.status === 'OPEN'
                            ? 'bg-green-100 text-green-700'
                            : chat.status === 'ASSIGNED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {chat.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {chat.channel.name} &middot;{' '}
                      {chat.channel.type === 'FACEBOOK_MESSENGER'
                        ? 'Messenger'
                        : 'Telegram'}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">{selectedChat.contact.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedChat.channel.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resolveChat}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Resolve
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.direction === 'OUTGOING' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.direction === 'OUTGOING'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.direction === 'OUTGOING'
                        ? 'text-primary-200'
                        : 'text-gray-400'
                    }`}
                  >
                    {formatDate(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFlowMenu(!showFlowMenu)}
                  className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                  title="Send Flow"
                >
                  <Workflow className="w-5 h-5" />
                </button>
                {showFlowMenu && (
                  <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 w-64 max-h-64 overflow-y-auto z-10">
                    <p className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                      Send a Flow
                    </p>
                    {flows.map((flow) => (
                      <button
                        key={flow.id}
                        onClick={() => sendFlow(flow.id)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Workflow className="w-4 h-4 text-purple-500" />
                        {flow.name}
                      </button>
                    ))}
                    {flows.length === 0 && (
                      <p className="px-3 py-4 text-sm text-gray-500 text-center">
                        No flows available
                      </p>
                    )}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="input flex-1"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="btn-primary p-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Select a conversation
            </h3>
            <p className="text-gray-500">
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
