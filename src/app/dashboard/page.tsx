import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  MessageSquare,
  Users,
  Workflow,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const stats = [
    {
      label: 'Total Conversations',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Contacts',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Active Flows',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Workflow,
      color: 'bg-purple-500',
    },
    {
      label: 'Messages Today',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your chatbots today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`flex items-center text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 ml-1" />
                  )}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/channels"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Connect Channel</p>
              <p className="text-sm text-gray-500">Add Messenger or Telegram</p>
            </div>
          </a>
          <a
            href="/dashboard/flows"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-purple-100 p-2 rounded-lg">
              <Workflow className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Create Flow</p>
              <p className="text-sm text-gray-500">Build a new automation</p>
            </div>
          </a>
          <a
            href="/dashboard/team"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Invite Team</p>
              <p className="text-sm text-gray-500">Add team members</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
