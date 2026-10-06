import React, { useState, useRef } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { ColumnView } from './ColumnView';
import { CardItem } from './CardItem';
import { BoardFilterBar } from './BoardFilterBar';
import { CreateCardModal } from '../card/CreateCardModal';
import { CardDetailModal } from '../card/CardDetailModal';
import { BoardMembersModal } from './BoardMembersModal';
import { useBoardStore } from '../../stores/useBoardStore';
import { useFilterStore } from '../../stores/useFilterStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { cardService } from '../../services/cardService';
import { Users } from 'lucide-react';

export const BoardView = () => {
  const { activeBoard, columns, cards, moveCardOptimistic } = useBoardStore();
  const { searchQuery, assigneeId, labelId, dueDateRange } = useFilterStore();

  const [activeCard, setActiveCard] = useState(null);
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [createCardColumnId, setCreateCardColumnId] = useState('col-todo');
  const [showMembersModal, setShowMembersModal] = useState(false);

  const searchInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useKeyboardShortcuts({
    onNewCard: () => { setCreateCardColumnId('col-todo'); setShowCreateCardModal(true); },
    onSearchFocus: () => searchInputRef.current?.focus(),
    onCloseModal: () => { setShowCreateCardModal(false); setSelectedCardForModal(null); setShowMembersModal(false); },
  });

  const filteredCards = cards.filter((card) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!card.title?.toLowerCase().includes(q) && !card.description?.toLowerCase().includes(q)) return false;
    }
    if (assigneeId && !(card.assignees || []).some((a) => String(a.id) === String(assigneeId))) return false;
    if (labelId && !(card.labels || []).some((l) => String(l.id) === String(labelId))) return false;
    return true;
  });

  const handleDragStart = (event) => {
    const card = cards.find((c) => c.id === event.active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const overIsColumn = columns.some((col) => col.id === over.id);
    const targetColumnId = overIsColumn ? over.id : cards.find((c) => c.id === over.id)?.columnId;
    if (!targetColumnId) return;

    moveCardOptimistic(active.id, targetColumnId, 0);

    try {
      await cardService.moveCard({
        cardId: active.id,
        sourceColumnId: activeCard?.columnId,
        targetColumnId,
        newPosition: 0,
      });
    } catch (err) {}
  };

  if (!activeBoard) return <div className="flex-1 flex items-center justify-center p-8 text-slate-500">Select a board.</div>;

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-100">{activeBoard.name}</h2>
        <button onClick={() => setShowMembersModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-lg">
          <Users className="w-4 h-4 text-blue-400" /> Board Members
        </button>
      </div>

      <BoardFilterBar searchInputRef={searchInputRef} />

      <div className="flex-1 p-6 overflow-x-auto bg-slate-950/40">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full items-start">
            {columns.map((col) => (
              <ColumnView
                key={col.id}
                column={col}
                cards={filteredCards.filter((c) => c.columnId === col.id)}
                onCardClick={(card) => setSelectedCardForModal(card)}
                onAddCard={(colId) => { setCreateCardColumnId(colId); setShowCreateCardModal(true); }}
              />
            ))}
          </div>
          <DragOverlay>{activeCard ? <CardItem card={activeCard} onClick={() => {}} /> : null}</DragOverlay>
        </DndContext>
      </div>

      <CreateCardModal isOpen={showCreateCardModal} onClose={() => setShowCreateCardModal(false)} defaultColumnId={createCardColumnId} />
      <CardDetailModal isOpen={!!selectedCardForModal} onClose={() => setSelectedCardForModal(null)} card={selectedCardForModal} />
      <BoardMembersModal isOpen={showMembersModal} onClose={() => setShowMembersModal(false)} />
    </div>
  );
};