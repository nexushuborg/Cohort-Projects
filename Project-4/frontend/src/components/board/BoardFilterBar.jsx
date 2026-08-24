import React, { useState } from 'react';
import { Search, Filter, Bookmark, RotateCcw, X } from 'lucide-react';
import { useFilterStore } from '../../stores/useFilterStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useBoardStore } from '../../stores/useBoardStore';

export const BoardFilterBar = ({ searchInputRef }) => {
  const {
    searchQuery,
    assigneeId,
    labelId,
    dueDateRange,
    quickFilter,
    savedViews,
    setSearchQuery,
    setAssigneeId,
    setLabelId,
    setDueDateRange,
    setQuickFilter,
    resetFilters,
    saveCurrentView,
    applySavedView,
  } = useFilterStore();

  const { members } = useWorkspaceStore();
  const { labels } = useBoardStore();

  const [viewName, setViewName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleSaveView = (e) => {
    e.preventDefault();
    if (!viewName.trim()) return;
    saveCurrentView(viewName);
    setViewName('');
    setShowSaveModal(false);
  };

  const hasActiveFilters = searchQuery || assigneeId || labelId || dueDateRange || quickFilter;

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search cards... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="">All Assignees</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.username || m.email}
              </option>
            ))}
          </select>

          <select
            value={labelId}
            onChange={(e) => setLabelId(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="">All Labels</option>
            {labels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={dueDateRange}
            onChange={(e) => setDueDateRange(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="">All Due Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="week">Due This Week</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Saved Views */}
        <div className="flex items-center gap-2">
          {savedViews.length > 0 && (
            <select
              onChange={(e) => e.target.value && applySavedView(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-blue-400 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="">Saved Views ({savedViews.length})</option>
              {savedViews.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-400 hover:bg-blue-950/40 border border-blue-800/60 rounded-lg transition font-medium"
            >
              <Bookmark className="w-3.5 h-3.5" /> Save View
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 text-xs">
        <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
          <Filter className="w-3 h-3" /> Quick Filters:
        </span>
        <button
          onClick={() => setQuickFilter('my_cards')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
            quickFilter === 'my_cards'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          My Cards
        </button>
        <button
          onClick={() => setQuickFilter('overdue')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
            quickFilter === 'overdue'
              ? 'bg-red-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Overdue Cards
        </button>
        <button
          onClick={() => setQuickFilter('due_this_week')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
            quickFilter === 'due_this_week'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Due This Week
        </button>
      </div>

      {showSaveModal && (
        <form onSubmit={handleSaveView} className="flex items-center gap-2 bg-slate-950 p-2 border border-slate-800 rounded-lg">
          <input
            type="text"
            required
            placeholder="View name"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            className="flex-1 px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none"
          />
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Save</button>
          <button type="button" onClick={() => setShowSaveModal(false)} className="p-1 text-slate-400"><X className="w-4 h-4" /></button>
        </form>
      )}
    </div>
  );
};
