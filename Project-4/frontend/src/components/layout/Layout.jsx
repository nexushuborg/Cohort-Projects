import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBoardStore } from '../../stores/useBoardStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { workspaceService } from '../../services/workspaceService';
import { boardService } from '../../services/boardService';
import { cardService } from '../../services/cardService';

export const Layout = () => {
  const { activeWorkspace, setWorkspaces } = useWorkspaceStore();
  const { activeBoard, setBoards, setCards, setLabels } = useBoardStore();

  useWebSocket(activeBoard?.id);

  useEffect(() => {
    workspaceService.getWorkspaces().then((res) => res.data && setWorkspaces(res.data)).catch(() => {});
  }, [setWorkspaces]);

  useEffect(() => {
    if (!activeWorkspace) return;
    boardService.getBoards(activeWorkspace.id).then((res) => res.data && setBoards(res.data)).catch(() => {});
    cardService.getWorkspaceLabels(activeWorkspace.id).then((res) => res.data && setLabels(res.data)).catch(() => {});
  }, [activeWorkspace, setBoards, setLabels]);

  useEffect(() => {
    if (!activeBoard) return;
    cardService.getCards(activeBoard.id).then((res) => res.data && setCards(res.data)).catch(() => {});
  }, [activeBoard, setCards]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col bg-slate-900/30 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};