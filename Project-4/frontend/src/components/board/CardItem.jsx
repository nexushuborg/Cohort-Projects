import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar } from '../common/Avatar';
import { GripVertical } from 'lucide-react';

export const CardItem = ({ card, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`group relative bg-slate-900 border rounded-xl p-3.5 transition cursor-pointer ${
        isDragging ? 'opacity-40 border-blue-500 ring-2 ring-blue-500/50' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div {...attributes} {...listeners} className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-500 cursor-grab">
        <GripVertical className="w-4 h-4" />
      </div>

      <h4 className="text-sm font-semibold text-slate-100 mb-1">{card.title}</h4>
      {card.description && <p className="text-xs text-slate-400 line-clamp-2">{card.description}</p>}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
        <div className="flex -space-x-1">
          {(card.assignees || []).map((u) => (
            <Avatar key={u.id} name={u.name || u.username} avatarUrl={u.avatar_url} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
};