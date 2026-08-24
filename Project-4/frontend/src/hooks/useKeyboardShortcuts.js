import { useEffect } from 'react';

export const useKeyboardShortcuts = ({ onNewCard, onSearchFocus, onCloseModal }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Escape key closes open modal / dropdown
      if (e.key === 'Escape') {
        if (onCloseModal) {
          onCloseModal();
        }
        return;
      }

      // If user is currently typing in an input, don't trigger N or / shortcuts
      if (isInputActive) return;

      // 'N' triggers new card modal
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (onNewCard) {
          onNewCard();
        }
      }

      // '/' triggers search input focus
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (onSearchFocus) {
          onSearchFocus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewCard, onSearchFocus, onCloseModal]);
};