import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { cardService } from '../../services/cardService';
import { useBoardStore } from '../../stores/useBoardStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

export const CreateCardModal = ({ isOpen, onClose, defaultColumnId = 'col-todo' }) => {
  const { activeBoard, columns, addCard } = useBoardStore();
  const { members } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      columnId: defaultColumnId,
      dueDate: '',
      assigneeIds: [],
    },
  });

  const onSubmit = async (data) => {
    if (!activeBoard) return;
    try {
      const payload = {
        ...data,
        boardId: activeBoard.id,
      };
      const res = await cardService.createCard(payload);
      if (res.data) {
        addCard(res.data);
      } else {
        addCard({
          id: `card-${Date.now()}`,
          title: data.title,
          description: data.description,
          columnId: data.columnId,
          boardId: activeBoard.id,
          dueDate: data.dueDate,
          assignees: members.filter((m) => data.assigneeIds.includes(String(m.id))),
          labels: [],
        });
      }
      reset();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to create card');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Card">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            {...register('title', {
              required: 'Card title is required',
              maxLength: { value: 255, message: 'Title cannot exceed 255 characters' },
            })}
            placeholder="e.g. Implement user authentication"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Column</label>
          <select
            {...register('columnId')}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
          <textarea
            rows={3}
            {...register('description', {
              maxLength: { value: 5000, message: 'Description max 5000 characters' },
            })}
            placeholder="Add detailed instructions..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
          <input
            type="date"
            {...register('dueDate')}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {members.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Assign Members</label>
            <div className="max-h-32 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950 p-2 space-y-1">
              {members.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-slate-900 rounded cursor-pointer text-xs text-slate-300"
                >
                  <input
                    type="checkbox"
                    value={m.id}
                    {...register('assigneeIds')}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                  />
                  <span>{m.name || m.username || m.email}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Card'}
          </button>
        </div>
      </form>
    </Modal>
  );
};