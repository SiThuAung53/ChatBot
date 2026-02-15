'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  Eye,
  Trash2,
  Mail,
} from 'lucide-react';

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) setMembers(await res.json());
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail) return;
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setShowInvite(false);
        setInviteEmail('');
        fetchMembers();
      }
    } catch (err) {
      console.error('Failed to invite:', err);
    }
  };

  const updateRole = async (memberId: string, role: string) => {
    try {
      await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      setMembers(
        members.map((m) => (m.id === memberId ? { ...m, role } : m))
      );
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await fetch(`/api/team/${memberId}`, { method: 'DELETE' });
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const roleIcons: Record<string, React.ReactNode> = {
    OWNER: <Crown className="w-4 h-4 text-yellow-500" />,
    ADMIN: <Shield className="w-4 h-4 text-blue-500" />,
    MEMBER: <Users className="w-4 h-4 text-gray-500" />,
    VIEWER: <Eye className="w-4 h-4 text-gray-400" />,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your team members and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Role legend */}
      <div className="card mb-6">
        <h3 className="font-medium mb-3">Roles & Permissions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Owner</p>
              <p className="text-xs text-gray-500">Full access</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-500">Manage team & bots</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Member</p>
              <p className="text-xs text-gray-500">Use inbox & flows</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Viewer</p>
              <p className="text-xs text-gray-500">Read-only access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members list */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Member
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Role
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <span className="font-medium text-sm">
                        {member.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {member.user.email}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {roleIcons[member.role]}
                      <select
                        value={member.role}
                        onChange={(e) => updateRole(member.id, e.target.value)}
                        className="text-sm border border-gray-200 rounded px-2 py-1"
                        disabled={member.role === 'OWNER'}
                      >
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {member.role !== 'OWNER' && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input pl-9"
                    placeholder="colleague@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="input"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInvite(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={inviteMember} className="btn-primary flex-1">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
