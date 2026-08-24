import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { workspaceService } from '../../services/workspaceService';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

export const CreateWorkspaceModal = ({ isOpen, onClose }) => {
  const { addWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      icon: '🚀',
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await workspaceService.createWorkspace(data);
      if (res.data) {
        addWorkspace(res.data);
        setActiveWorkspace(res.data);
        reset();
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Failed to create workspace');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Workspace">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Workspace Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            {...register('name', {
              required: 'Workspace name is required',
              minLength: { value: 3, message: 'Name must be at least 3 characters' },
              maxLength: { value: 100, message: 'Name cannot exceed 100 characters' },
            })}
            placeholder="e.g. Acme Engineering"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Icon (Emoji)</label>
          <input
            type="text"
            {...register('icon', {
              maxLength: { value: 10, message: 'Icon max 10 characters' },
            })}
            placeholder="🚀"
            className="w-24 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-center text-lg focus:outline-none focus:border-blue-500"
          />
          {errors.icon && <p className="text-red-400 text-xs mt-1">{errors.icon.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
          <textarea
            rows={3}
            {...register('description', {
              maxLength: { value: 500, message: 'Description cannot exceed 500 characters' },
            })}
            placeholder="What is this workspace about?"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

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
            {isSubmitting ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </form>
    </Modal>
  );
};