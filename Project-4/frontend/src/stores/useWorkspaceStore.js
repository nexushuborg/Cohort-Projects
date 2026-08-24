import { create } from 'zustand';

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  members: [],
  currentRole: 'Member',

  setWorkspaces: (workspaces) => {
    set({ workspaces });
    const currentActive = get().activeWorkspace;
    if (!currentActive && workspaces.length > 0) {
      get().setActiveWorkspace(workspaces[0]);
    }
  },

  setActiveWorkspace: (workspace) => {
    set({
      activeWorkspace: workspace,
      members: workspace?.members || [],
      currentRole: workspace?.userRole || workspace?.role || 'Member',
    });
  },

  setMembers: (members) => set({ members }),

  addWorkspace: (workspace) => {
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
      activeWorkspace: state.activeWorkspace || workspace,
    }));
  },

  updateWorkspaceInStore: (updatedWorkspace) => {
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === updatedWorkspace.id ? { ...w, ...updatedWorkspace } : w
      ),
      activeWorkspace:
        state.activeWorkspace?.id === updatedWorkspace.id
          ? { ...state.activeWorkspace, ...updatedWorkspace }
          : state.activeWorkspace,
    }));
  },

  removeWorkspaceFromStore: (id) => {
    set((state) => {
      const nextWorkspaces = state.workspaces.filter((w) => w.id !== id);
      return {
        workspaces: nextWorkspaces,
        activeWorkspace: state.activeWorkspace?.id === id ? nextWorkspaces[0] || null : state.activeWorkspace,
      };
    });
  },
}));