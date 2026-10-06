import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CardItem } from './CardItem';
import { Plus } from 'lucide-react';

export const ColumnView = ({ column, cards = [], onCardClick, onAddCard }) => {
  const cardIds = cards.map((c) => c.id);

  return (
    <div className="flex flex-col w-80 shrink-0 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 h-full overflow-hidden shadow-lg">
      <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{column.title}</h3>
          <span className="px-2 py-0.5 text-[11px] text-slate-400 bg-slate-800 rounded-full">{cards.length}</span>
        </div>
        <button onClick={() => onAddCard(column.id)} className="p-1 text-slate-400 hover:text-slate-200">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};