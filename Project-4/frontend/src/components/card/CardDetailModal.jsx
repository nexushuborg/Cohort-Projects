import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { ActivityFeed } from '../activity/ActivityFeed';
import { cardService } from '../../services/cardService';
import { activityService } from '../../services/activityService';
import { useBoardStore } from '../../stores/useBoardStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Calendar, Tag, Users, Trash2, Clock, CheckSquare, Plus } from 'lucide-react';

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export const CardDetailModal = ({ isOpen, onClose, card }) => {
  const { updateCardInStore, deleteCardFromStore, labels: boardLabels } = useBoardStore();
  const { activeWorkspace, members } = useWorkspaceStore();

  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [dueDate, setDueDate] = useState(card?.dueDate || card?.due_date || '');
  const [activities, setActivities] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);
  const [showLabelForm, setShowLabelForm] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setDueDate(card.dueDate || card.due_date || '');
      fetchCardActivity(card.id);
    }
  }, [card]);

  const fetchCardActivity = async (cardId) => {
    try {
      setLoadingActivity(true);
      const res = await activityService.getCardActivity(cardId);
      if (res.data) setActivities(res.data);
    } catch {
      setActivities([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  if (!card) return null;

  const cardAssignees = card.assignees || [];
  const cardLabels = card.labels || [];

  const handleTitleBlur = async () => {
    if (title !== card.title && title.trim()) {
      await cardService.updateCard(card.id, { title }).catch(() => {});
      updateCardInStore({ ...card, title });
    }
  };

  const handleDescriptionBlur = async () => {
    if (description !== card.description) {
      await cardService.updateCard(card.id, { description }).catch(() => {});
      updateCardInStore({ ...card, description });
    }
  };

  const handleDeleteCard = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    await cardService.deleteCard(card.id).catch(() => {});
    deleteCardFromStore(card.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Details" maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full text-xl font-bold bg-transparent border-b border-transparent focus:border-blue-500 px-2 py-1 text-slate-100 focus:outline-none"
          />
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-400" /> Description
            </h4>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a detailed description..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <ActivityFeed activities={activities} isLoading={loadingActivity} />
        </div>

        <div className="space-y-6 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-6">
          <button
            onClick={handleDeleteCard}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded-lg border border-red-900/40"
          >
            <Trash2 className="w-4 h-4" /> Delete Card
          </button>
        </div>
      </div>
    </Modal>
  );
};