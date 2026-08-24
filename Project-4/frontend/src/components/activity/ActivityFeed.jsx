import React from 'react';
import { Avatar } from '../common/Avatar';
import { Activity, Clock } from 'lucide-react';

export const ActivityFeed = ({ activities = [], isLoading = false }) => {
  if (isLoading) {
    return <div className="py-4 text-center text-xs text-slate-500">Loading activity feed...</div>;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/20 border border-slate-800/60 rounded-xl">
        <Activity className="w-6 h-6 mx-auto text-slate-600 mb-2" />
        No recent activity logged.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((item, idx) => (
        <div key={item.id || idx} className="flex items-start gap-3 text-xs">
          <Avatar
            name={item.user_name || item.user_email || 'User'}
            avatarUrl={item.user_avatar}
            size="sm"
          />
          <div className="flex-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <p className="text-slate-300">
              <span className="font-semibold text-slate-100">
                {item.user_name || item.user_email || 'A member'}
              </span>{' '}
              {item.action || item.description || 'updated this item'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.created_at
                ? new Date(item.created_at).toLocaleString([], {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : 'Just now'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};