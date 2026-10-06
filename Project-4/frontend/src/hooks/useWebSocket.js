import { useEffect, useRef } from 'react';
import { useBoardStore } from '../stores/useBoardStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useAuthStore } from '../stores/useAuthStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5001';

export const useWebSocket = (boardId) => {
  const wsRef = useRef(null);
  const token = useAuthStore((s) => s.token);
  const { addCard, updateCardInStore, moveCardOptimistic } = useBoardStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(`${WS_URL}?token=${token}${boardId ? `&boardId=${boardId}` : ''}`);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        if (type === 'CARD_MOVED') moveCardOptimistic(data.cardId, data.targetColumnId, data.newPosition);
        if (type === 'CARD_CREATED') addCard(data);
        if (type === 'CARD_UPDATED') updateCardInStore(data);
        if (type === 'NOTIFICATION_RECEIVED') {
          addNotification({
            id: data.id || Date.now().toString(),
            title: data.title || 'Notification',
            message: data.message || '',
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      } catch (err) {}
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [token, boardId]);

  return wsRef.current;
};