import { create } from 'zustand';

export const useBoardStore = create((set) => ({
  boards: [],
  activeBoard: null,
  columns: [
    { id: 'col-todo', title: 'To Do', order: 0 },
    { id: 'col-in_progress', title: 'In Progress', order: 1 },
    { id: 'col-done', title: 'Done', order: 2 },
  ],
  cards: [],
  labels: [],

  setBoards: (boards) => set({ boards }),
  setActiveBoard: (board) => set({ activeBoard: board }),
  setCards: (cards) => set({ cards }),
  setLabels: (labels) => set({ labels }),

  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
  updateCardInStore: (updatedCard) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === updatedCard.id ? { ...c, ...updatedCard } : c)),
    })),
  deleteCardFromStore: (cardId) =>
    set((state) => ({ cards: state.cards.filter((c) => c.id !== cardId) })),

  moveCardOptimistic: (cardId, targetColumnId, newPosition) => {
    set((state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return state;
      const otherCards = state.cards.filter((c) => c.id !== cardId);
      return {
        cards: [...otherCards, { ...card, columnId: targetColumnId, position: newPosition }],
      };
    });
  },
}));