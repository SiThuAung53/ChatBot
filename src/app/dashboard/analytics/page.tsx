'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';

interface AnalyticsData {
  totalMessages: number;
  totalContacts: number;
  activeChats: number;
  messagesByDay: { date: string; incoming: number; outgoing: number }[];
  topFlows: { name: string; executions: number }[];
  channelBreakdown: { channel: string; count: number }[];
  contactGrowth: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading analytics...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Track and analyze your chatbot performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-auto"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-green-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-2xl font-bold">{data?.totalMessages ?? 0}</p>
          <p className="text-sm text-gray-500">Total Messages</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-2xl font-bold">{data?.totalContacts ?? 0}</p>
          <p className="text-sm text-gray-500">Total Contacts</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-green-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-2xl font-bold">{data?.activeChats ?? 0}</p>
          <p className="text-sm text-gray-500">Active Chats</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Messages by Day */}
        <div className="card">
          <h3 className="font-semibold mb-4">Messages Over Time</h3>
          <div className="space-y-3">
            {(data?.messagesByDay || []).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">{day.date}</span>
                <div className="flex-1 flex gap-1">
                  <div
                    className="h-6 bg-blue-400 rounded-l"
                    style={{
                      width: `${Math.max(
                        (day.incoming / Math.max(...(data?.messagesByDay || []).map(d => d.incoming + d.outgoing), 1)) * 100,
                        2
                      )}%`,
                    }}
                    title={`Incoming: ${day.incoming}`}
                  />
                  <div
                    className="h-6 bg-green-400 rounded-r"
                    style={{
                      width: `${Math.max(
                        (day.outgoing / Math.max(...(data?.messagesByDay || []).map(d => d.incoming + d.outgoing), 1)) * 100,
                        2
                      )}%`,
                    }}
                    title={`Outgoing: ${day.outgoing}`}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  {day.incoming + day.outgoing}
                </span>
              </div>
            ))}
            {(!data?.messagesByDay || data.messagesByDay.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                No message data yet
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded" /> Incoming
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded" /> Outgoing
            </span>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="card">
          <h3 className="font-semibold mb-4">Channel Breakdown</h3>
          <div className="space-y-4">
            {(data?.channelBreakdown || []).map((ch) => (
              <div key={ch.channel}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{ch.channel === 'FACEBOOK_MESSENGER' ? 'Messenger' : 'Telegram'}</span>
                  <span className="font-medium">{ch.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      ch.channel === 'FACEBOOK_MESSENGER'
                        ? 'bg-blue-500'
                        : 'bg-sky-400'
                    }`}
                    style={{
                      width: `${Math.min(
                        (ch.count / Math.max(...(data?.channelBreakdown || []).map(c => c.count), 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {(!data?.channelBreakdown || data.channelBreakdown.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                No channel data yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top Flows */}
      <div className="card">
        <h3 className="font-semibold mb-4">Top Performing Flows</h3>
        {(data?.topFlows || []).length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-500">
                  Flow Name
                </th>
                <th className="text-right py-2 text-sm font-medium text-gray-500">
                  Executions
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.topFlows.map((flow, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 text-sm">{flow.name}</td>
                  <td className="py-2 text-sm text-right font-medium">
                    {flow.executions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No flow execution data yet
          </p>
        )}
      </div>
    </div>
  );
}
