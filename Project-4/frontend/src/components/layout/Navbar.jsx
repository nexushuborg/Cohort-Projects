import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { WorkspaceSettingsModal } from '../workspace/WorkspaceSettingsModal';
import { CreateWorkspaceModal } from '../workspace/CreateWorkspaceModal';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { ChevronDown, Plus, Settings, User, LogOut, LayoutGrid } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();

  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);

  return (
    <>
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0 select-none">
        <div className="flex items-center gap-6">
          <Link to="/workspaces" className="flex items-center gap-2 font-bold text-lg text-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              CT
            </div>
            <span>CollabTask</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-semibold"
            >
              <span>{activeWorkspace?.icon || '🚀'}</span>
              <span className="max-w-[140px] truncate">{activeWorkspace?.name || 'Select Workspace'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showWorkspaceDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => { setActiveWorkspace(ws); setShowWorkspaceDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    {ws.name}
                  </button>
                ))}
                <button
                  onClick={() => { setShowWorkspaceDropdown(false); setShowCreateWsModal(true); }}
                  className="w-full text-left px-3 py-2 text-xs text-blue-400 font-medium hover:bg-slate-800 border-t border-slate-800"
                >
                  + Create Workspace
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeWorkspace && (
            <button onClick={() => setShowSettingsModal(true)} className="p-2 text-slate-400 hover:text-slate-200">
              <Settings className="w-5 h-5" />
            </button>
          )}

          <NotificationDropdown />

          <div className="relative">
            <button onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <Avatar name={user?.name || user?.username} avatarUrl={user?.avatar_url} size="md" />
            </button>
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-slate-100">{user?.name || user?.username}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <Link to="/profile" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800">
                  <User className="w-4 h-4 text-slate-400" /> My Profile
                </Link>
                <Link to="/workspaces" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800">
                  <LayoutGrid className="w-4 h-4 text-slate-400" /> Workspaces Overview
                </Link>
                <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-950/40 border-t border-slate-800">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <WorkspaceSettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <CreateWorkspaceModal isOpen={showCreateWsModal} onClose={() => setShowCreateWsModal(false)} />
    </>
  );
};