'use client';

import { useState } from 'react';
import { Plug, Globe, ScanLine, Sheet, MessageSquare, Send, Webhook } from 'lucide-react';

export default function IntegrationsPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'api-docs'>('overview');

  const integrations = [
    {
      name: 'Facebook Messenger',
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      description: 'Connect your Facebook Page for automated messaging',
      status: 'available',
      link: '/dashboard/channels',
    },
    {
      name: 'Telegram',
      icon: <Send className="w-6 h-6 text-sky-500" />,
      description: 'Connect Telegram bots for automated conversations',
      status: 'available',
      link: '/dashboard/channels',
    },
    {
      name: 'Google Sheets',
      icon: <Sheet className="w-6 h-6 text-green-600" />,
      description: 'Sync chatbot data with Google Sheets',
      status: 'available',
      link: '/dashboard/sheets',
    },
    {
      name: 'OCR Service',
      icon: <ScanLine className="w-6 h-6 text-purple-600" />,
      description: 'Extract text from images via OCR',
      status: 'available',
      link: '#',
    },
    {
      name: 'External APIs',
      icon: <Globe className="w-6 h-6 text-orange-500" />,
      description: 'Connect to any external REST API via Flow Builder',
      status: 'available',
      link: '#',
    },
    {
      name: 'Webhooks',
      icon: <Webhook className="w-6 h-6 text-gray-600" />,
      description: 'Receive and send webhook events',
      status: 'available',
      link: '#',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-1">
          Connect external services and manage API access
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'overview'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('api-docs')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'api-docs'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          API Documentation
        </button>
      </div>

      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <a
              key={integration.name}
              href={integration.link}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="bg-gray-50 p-2 rounded-lg">
                  {integration.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{integration.name}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Available
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {integration.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {selectedTab === 'api-docs' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">REST API for Android App</h2>
          <p className="text-sm text-gray-600 mb-6">
            Use these API endpoints to integrate with your Android app or any
            other client. All requests require an API key via the{' '}
            <code className="bg-gray-100 px-1 rounded">x-api-key</code> header.
          </p>

          <div className="space-y-6">
            <ApiEndpoint
              method="POST"
              path="/api/v1/auth"
              description="Verify API key and get team info"
            />
            <ApiEndpoint
              method="GET"
              path="/api/v1/contacts?page=1&limit=50&search=query"
              description="List contacts with pagination and search"
            />
            <ApiEndpoint
              method="GET"
              path="/api/v1/chats?page=1&limit=50&status=OPEN"
              description="List chats with pagination and filtering"
            />
            <ApiEndpoint
              method="GET"
              path="/api/v1/chats/:chatId/messages"
              description="Get messages for a chat"
            />
            <ApiEndpoint
              method="POST"
              path="/api/v1/chats/:chatId/messages"
              description="Send a message in a chat"
              body='{ "content": "Hello!", "type": "TEXT" }'
            />
            <ApiEndpoint
              method="GET"
              path="/api/v1/flows"
              description="List all flows"
            />
            <ApiEndpoint
              method="POST"
              path="/api/v1/flows/:flowId/trigger"
              description="Trigger a flow via API"
              body='{ "contactId": "...", "chatId": "...", "variables": {} }'
            />
            <ApiEndpoint
              method="GET"
              path="/api/v1/analytics?period=7d"
              description="Get analytics summary"
            />
            <ApiEndpoint
              method="POST"
              path="/api/v1/ocr"
              description="Process image with OCR"
              body='{ "imageUrl": "https://..." }'
            />
            <ApiEndpoint
              method="POST"
              path="/api/v1/external"
              description="Proxy request to external service"
              body='{ "url": "https://...", "method": "GET", "headers": {}, "body": {} }'
            />
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Example Request</h4>
            <pre className="text-xs text-gray-700 overflow-x-auto">
{`curl -X GET https://your-domain.com/api/v1/chats \\
  -H "x-api-key: cb_your_api_key_here" \\
  -H "Content-Type: application/json"`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function ApiEndpoint({
  method,
  path,
  description,
  body,
}: {
  method: string;
  path: string;
  description: string;
  body?: string;
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PATCH: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
            methodColors[method] || 'bg-gray-100 text-gray-700'
          }`}
        >
          {method}
        </span>
        <code className="text-sm text-gray-800">{path}</code>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
      {body && (
        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
          {body}
        </pre>
      )}
    </div>
  );
}
