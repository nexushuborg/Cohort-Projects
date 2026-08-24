import React, { useState } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useBoardStore } from '../../stores/useBoardStore';
import { boardService } from '../../services/boardService';
import { Modal } from '../common/Modal';
import { Plus, ChevronRight, Hash } from 'lucide-react';

export const Sidebar = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const { boards, activeBoard, setActiveBoard, setBoards } = useBoardStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDesc, setBoardDesc] = useState('');

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardName.trim() || !activeWorkspace) return;
    try {
      const res = await boardService.createBoard(activeWorkspace.id, { name: boardName, description: boardDesc });
      const created = res.data || { id: `board-${Date.now()}`, name: boardName, description: boardDesc };
      setBoards([...boards, created]);
      setActiveBoard(created);
      setBoardName('');
      setBoardDesc('');
      setShowCreateModal(false);
    } catch (err) {
      alert('Failed to create board');
    }
  };

  if (!activeWorkspace) return null;

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-100 flex items-center justify-between">
        <span className="truncate">{activeWorkspace.name}</span>
        <span className="text-[10px] text-slate-400 capitalize">{activeWorkspace.userRole || 'Member'}</span>
      </div>

      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1 mb-1">
          <span className="text-[11px] font-bold uppercase text-slate-500">Boards ({boards.length})</span>
          <button onClick={() => setShowCreateModal(true)} className="p-1 text-slate-400 hover:text-slate-200">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => setActiveBoard(board)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
              activeBoard?.id === board.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Hash className="w-3.5 h-3.5" />
              <span className="truncate">{board.name}</span>
            </div>
            {activeBoard?.id === board.id && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ))}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Board">
        <form onSubmit={handleCreateBoard} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Board Name *</label>
            <input
              type="text"
              required
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={boardDesc}
              onChange={(e) => setBoardDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-lg">Create Board</button>
          </div>
        </form>
      </Modal>
    </aside>
  );
};