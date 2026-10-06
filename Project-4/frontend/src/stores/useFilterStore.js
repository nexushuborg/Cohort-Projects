import { create } from 'zustand';

export const useFilterStore = create((set, get) => ({
  searchQuery: '',
  assigneeId: '',
  labelId: '',
  dueDateRange: '',
  quickFilter: '',
  savedViews: JSON.parse(localStorage.getItem('collabtask_saved_views') || '[]'),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setAssigneeId: (id) => set({ assigneeId: id }),
  setLabelId: (id) => set({ labelId: id }),
  setDueDateRange: (range) => set({ dueDateRange: range }),

  setQuickFilter: (filter) => {
    const state = get();
    if (state.quickFilter === filter) {
      set({ quickFilter: '', assigneeId: '', dueDateRange: '' });
      return;
    }
    if (filter === 'my_cards') {
      const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
      set({ quickFilter: 'my_cards', assigneeId: userId || '' });
    } else if (filter === 'overdue') {
      set({ quickFilter: 'overdue', dueDateRange: 'overdue' });
    } else if (filter === 'due_this_week') {
      set({ quickFilter: 'due_this_week', dueDateRange: 'week' });
    }
  },

  resetFilters: () =>
    set({ searchQuery: '', assigneeId: '', labelId: '', dueDateRange: '', quickFilter: '' }),

  saveCurrentView: (name) => {
    const { searchQuery, assigneeId, labelId, dueDateRange, quickFilter, savedViews } = get();
    const newView = {
      id: Date.now().toString(),
      name,
      filters: { searchQuery, assigneeId, labelId, dueDateRange, quickFilter },
    };
    const updated = [...savedViews, newView];
    localStorage.setItem('tasksync_saved_views', JSON.stringify(updated));
    set({ savedViews: updated });
  },

  applySavedView: (viewId) => {
    const view = get().savedViews.find((v) => v.id === viewId);
    if (view?.filters) set({ ...view.filters });
  },
}));