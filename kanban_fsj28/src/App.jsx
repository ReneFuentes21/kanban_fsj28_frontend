import React, { useState } from 'react';
import { useKanban } from './hooks/useKanban';
import Header from './components/Header';
import Board from './components/Board';
import ListView from './components/ListView';
import EditTaskModal from './components/EditTaskModal';
import NewBoardModal from './components/NewBoardModal';
import RenameBoardModal from './components/RenameBoardModal';

const App = () => {
  const [viewMode, setViewMode] = useState('kanban');
  
  const {
    boards,
    activeBoardId,
    editingTask,
    isNewBoardModalOpen,
    renamingBoard,
    loading,
    error,
    setActiveBoardId,
    setEditingTask,
    setIsNewBoardModalOpen,
    setRenamingBoard,
    handleCreateNewBoard,
    handleRenameBoard,
    handleDeleteBoard,
    handleAddTask,
    handleSaveTask,
    handleDeleteTask,
    handleMoveTask
  } = useKanban();

  const activeBoard = boards.find(b => b.id === activeBoardId) || null;

  if (error) {
    console.error('Error en App:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={setActiveBoardId}
        onNewBoard={() => setIsNewBoardModalOpen(true)}
        onRenameBoard={() => {
          const activeBoard = boards.find(b => b.id === activeBoardId);
          if (activeBoard) setRenamingBoard(activeBoard);
        }}
        onDeleteBoard={handleDeleteBoard}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <main className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        ) : !activeBoard ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">No hay tableros disponibles.</p>
            <button
              onClick={() => setIsNewBoardModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Crear primer tablero
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <ListView
            board={activeBoard}
            onEditTask={setEditingTask}
            onDeleteTask={handleDeleteTask}
            onSaveTask={handleSaveTask}
          />
        ) : (
          <Board
            board={activeBoard}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={setEditingTask}
            onSaveTask={handleSaveTask}
            onRenameBoard={() => {
              const activeBoard = boards.find(b => b.id === activeBoardId);
              if (activeBoard) setRenamingBoard(activeBoard);
            }}
            onDeleteBoard={handleDeleteBoard}
            onMoveTask={handleMoveTask}
          />
        )}
      </main>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveTask}
        />
      )}

      {isNewBoardModalOpen && (
        <NewBoardModal
          onClose={() => setIsNewBoardModalOpen(false)}
          onCreate={handleCreateNewBoard}
        />
      )}

      {renamingBoard && (
        <RenameBoardModal
          board={renamingBoard}
          onClose={() => setRenamingBoard(null)}
          onSave={handleRenameBoard}
        />
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-md shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => {}}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;