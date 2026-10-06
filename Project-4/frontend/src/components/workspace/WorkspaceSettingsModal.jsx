import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { workspaceService } from '../../services/workspaceService';
import { UserPlus, Trash2, LogOut, Shield } from 'lucide-react';

export const WorkspaceSettingsModal = ({ isOpen, onClose }) => {
  const { activeWorkspace, members, currentRole, updateWorkspaceInStore, removeWorkspaceFromStore } =
    useWorkspaceStore();
  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [isInviting, setIsInviting] = useState(false);
  const [wsName, setWsName] = useState(activeWorkspace?.name || '');
  const [wsDesc, setWsDesc] = useState(activeWorkspace?.description || '');
  const [wsIcon, setWsIcon] = useState(activeWorkspace?.icon || '🚀');

  const isOwner = currentRole === 'Owner' || activeWorkspace?.owner_id === currentUser?.id;
  const isAdmin = isOwner || currentRole === 'Admin';

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    try {
      const res = await workspaceService.updateWorkspace(activeWorkspace.id, {
        name: wsName,
        description: wsDesc,
        icon: wsIcon,
      });
      if (res.data) {
        updateWorkspaceInStore(res.data);
        alert('Workspace settings updated successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !activeWorkspace) return;
    try {
      setIsInviting(true);
      await workspaceService.inviteMember(activeWorkspace.id, inviteEmail, inviteRole);
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err) {
      alert(err.message || 'Failed to invite member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!activeWorkspace) return;
    try {
      await workspaceService.updateMemberRole(activeWorkspace.id, userId, newRole);
      const updatedMembers = members.map((m) =>
        m.id === userId ? { ...m, role: newRole } : m
      );
      useWorkspaceStore.getState().setMembers(updatedMembers);
    } catch (err) {
      alert(err.message || 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeWorkspace || !confirm('Remove this member from workspace?')) return;
    try {
      await workspaceService.removeMember(activeWorkspace.id, userId);
      const updatedMembers = members.filter((m) => m.id !== userId);
      useWorkspaceStore.getState().setMembers(updatedMembers);
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!activeWorkspace || !confirm('Are you sure you want to leave this workspace?')) return;
    try {
      await workspaceService.leaveWorkspace(activeWorkspace.id);
      removeWorkspaceFromStore(activeWorkspace.id);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to leave workspace');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace || !confirm('DANGER: Delete workspace permanently? This cannot be undone.')) return;
    try {
      await workspaceService.deleteWorkspace(activeWorkspace.id);
      removeWorkspaceFromStore(activeWorkspace.id);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to delete workspace');
    }
  };

  if (!activeWorkspace) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${activeWorkspace.name} - Settings`}>
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === 'members'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Members ({members.length})
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            General Settings
          </button>
        )}
      </div>

      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Invite Member Form */}
          {isAdmin && (
            <form onSubmit={handleInvite} className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" /> Invite Member by Email
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                >
                  Send Invite
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace Members</h4>
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name || m.username || m.email} avatarUrl={m.avatar_url} size="md" />
                    <div>
                      <p className="font-semibold text-slate-200">{m.name || m.username}</p>
                      <p className="text-slate-500">{m.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && m.id !== currentUser?.id && m.role !== 'Owner' ? (
                      <select
                        value={m.role || 'Member'}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 text-xs"
                      >
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-[11px] font-medium flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-400" /> {m.role || 'Member'}
                      </span>
                    )}

                    {isAdmin && m.id !== currentUser?.id && m.role !== 'Owner' && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Workspace Action */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={handleLeaveWorkspace}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" /> Leave Workspace
            </button>
          </div>
        </div>
      )}

      {activeTab === 'settings' && isAdmin && (
        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Workspace Name</label>
            <input
              type="text"
              required
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Icon (Emoji)</label>
            <input
              type="text"
              value={wsIcon}
              onChange={(e) => setWsIcon(e.target.value)}
              className="w-20 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-center text-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={wsDesc}
              onChange={(e) => setWsDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {isOwner && (
              <button
                type="button"
                onClick={handleDeleteWorkspace}
                className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-950/40 rounded-lg transition font-medium"
              >
                Delete Workspace
              </button>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};