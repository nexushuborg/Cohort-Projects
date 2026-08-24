import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-slate-400 hover:text-slate-200 rounded-lg">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-blue-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h4 className="font-semibold text-sm text-slate-200">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-400 flex items-center gap-1 font-medium">
                <CheckCheck className="w-3.5 h-3.5" /> Mark read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-3 text-xs cursor-pointer ${!n.read ? 'bg-blue-950/20' : ''}`}>
                  <p className="font-semibold text-slate-200">{n.title}</p>
                  <p className="text-slate-400 mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};