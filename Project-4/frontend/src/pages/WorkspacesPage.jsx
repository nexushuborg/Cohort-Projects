import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';
import { CreateWorkspaceModal } from '../components/workspace/CreateWorkspaceModal';
import { LayoutGrid, Plus, ArrowRight, Shield } from 'lucide-react';

export const WorkspacesPage = () => {
  const navigate = useNavigate();
  const { workspaces, setActiveWorkspace } = useWorkspaceStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSelectWorkspace = (ws) => {
    setActiveWorkspace(ws);
    navigate('/board');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <LayoutGrid className="w-7 h-7 text-blue-500" /> Workspaces
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your collaborative teams and project boards
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> Create Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => handleSelectWorkspace(ws)}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-blue-500/60 hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{ws.icon || '🚀'}</span>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-[11px] font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" /> {ws.userRole || ws.role || 'Member'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition">
                {ws.name}
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {ws.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-blue-400 font-semibold">
              <span>Open Boards</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        ))}

        {workspaces.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
            <p className="text-slate-400 text-sm">You are not a member of any workspace yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Your First Workspace
            </button>
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};