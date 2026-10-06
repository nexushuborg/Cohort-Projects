import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useBoardStore } from '../../stores/useBoardStore';
import { boardService } from '../../services/boardService';
import { UserCheck } from 'lucide-react';

export const BoardMembersModal = ({ isOpen, onClose }) => {
  const { activeBoard, setActiveBoard } = useBoardStore();
  const { members } = useWorkspaceStore();

  const boardMemberIds = (activeBoard?.members || []).map((m) => m.id);
  const [selectedIds, setSelectedIds] = useState(boardMemberIds);
  const [isSaving, setIsSaving] = useState(false);

  const toggleMember = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!activeBoard) return;
    try {
      setIsSaving(true);
      await boardService.assignMembers(activeBoard.id, selectedIds);
      const updatedMembers = members.filter((m) => selectedIds.includes(m.id));
      setActiveBoard({ ...activeBoard, members: updatedMembers });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to update board members');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeBoard) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Members to "${activeBoard.name}"`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Select workspace members who have access to this board:
        </p>

        <div className="max-h-64 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/50">
          {members.map((m) => {
            const isSelected = selectedIds.includes(m.id);
            return (
              <div
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className={`flex items-center justify-between p-3 cursor-pointer text-xs transition ${
                  isSelected ? 'bg-blue-950/30' : 'hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.name || m.username} avatarUrl={m.avatar_url} size="md" />
                  <div>
                    <p className="font-semibold text-slate-200">{m.name || m.username}</p>
                    <p className="text-slate-500">{m.email}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {isSelected && <UserCheck className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </Modal>
  );
};