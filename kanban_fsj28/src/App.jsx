import React, { useState, useCallback } from 'react';
import { initialBoards } from './services/tasks';
import { Status, Priority } from './constants';
import Header from './components/Header';
import Board from './components/Board';
import ListView from './components/ListView';
import EditTaskModal from './components/EditTaskModal';
import NewBoardModal from './components/NewBoardModal';
import RenameBoardModal from './components/RenameBoardModal';


const App = () => {
  const [boards, setBoards] = useState(initialBoards);
  const [activeBoardId, setActiveBoardId] = useState(initialBoards[0].id);
  const [editingTask, setEditingTask] = useState(null);
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [renamingBoard, setRenamingBoard] = useState(null);
  const [viewMode, setViewMode] = useState("kanban");

  const activeBoard = boards.find(board => board.id === activeBoardId);

  const handleSaveTask = useCallback((savedTask) => {
    setBoards(prevBoards => {
      return prevBoards.map(board => {
        if (board.id !== activeBoardId) {
          return board;
        }

        const columnsWithTaskRemoved = board.columns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.id !== savedTask.id),
        }));

        const newColumns = columnsWithTaskRemoved.map(column => {
          if (column.id === savedTask.status) {
            return {
              ...column,
              tasks: [...column.tasks, savedTask],
            };
          }
          return column;
        });

        return { ...board, columns: newColumns };
      });
    });
    
    setEditingTask(null);
  }, [activeBoardId]);


  const handleDeleteTask = useCallback((taskToDelete) => {
    if (!taskToDelete) return;

    if (window.confirm(`¿Estás seguro de que quieres eliminar la tarea "${taskToDelete.title || 'Sin Título'}"?`)) {
        setBoards(prevBoards => prevBoards.map(board => {
            if (board.id !== activeBoardId) {
                return board;
            }
            const updatedColumns = board.columns.map(column => ({
                ...column,
                tasks: column.tasks.filter(task => task.id !== taskToDelete.id),
            }));
            return { ...board, columns: updatedColumns };
        }));
    }
  }, [activeBoardId]);


  const handleAddTask = useCallback((columnId) => {
    const newTaskId = `TSK-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newTask = {
        id: newTaskId,
        title: '',
        description: '',
        status: columnId,
        priority: Priority.MEDIA,
        user: { name: '', role: '', avatarUrl: 'https://i.pravatar.cc/40' },
        creationDate: new Date(),
        deadline: null,
    };
    setEditingTask(newTask);
  }, []);

  const handleCreateNewBoard = () => {
    setIsNewBoardModalOpen(true);
  }

  const handleConfirmNewBoard = (newBoardName) => {
    const newBoardId = `board-${Date.now()}`;
    const newBoard = {
        id: newBoardId,
        name: newBoardName,
        columns: [
            { id: Status.PENDIENTE, title: 'Pendiente', tasks: []},
            { id: Status.EN_PROGRESO, title: 'En progreso', tasks: []},
            { id: Status.EN_REVISION, title: 'En revisión', tasks: []},
            { id: Status.FINALIZADO, title: 'Finalizado', tasks: []},
        ]
    };
    setBoards([...boards, newBoard]);
    setActiveBoardId(newBoardId);
    setIsNewBoardModalOpen(false);
  }

  const handleRenameBoard = () => {
    if (activeBoard) {
        setRenamingBoard(activeBoard);
    }
  };

  const handleConfirmRenameBoard = (boardId, newName) => {
    setBoards(prevBoards => 
        prevBoards.map(board => 
            board.id === boardId ? { ...board, name: newName } : board
        )
    );
    setRenamingBoard(null);
  };

  const handleDeleteBoard = () => {
    if (boards.length <= 1) {
        alert("No puedes eliminar el último tablero.");
        return;
    }
    if (window.confirm(`¿Estás seguro de que quieres eliminar el tablero "${activeBoard?.name}"?`)) {
        const newBoards = boards.filter(b => b.id !== activeBoardId);
        setBoards(newBoards);
        setActiveBoardId(newBoards[0].id);
    }
  }

  if (!activeBoard) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200">Cargando Tableros...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800 dark:bg-slate-900 dark:text-gray-200">
      <Header 
        boards={boards} 
        activeBoardId={activeBoardId} 
        onSelectBoard={setActiveBoardId}
        onNewBoard={handleCreateNewBoard}
        onToggleView={() => setViewMode(viewMode === "kanban" ? "list" : "kanban")}
        viewMode={viewMode}
      />
      <main className="p-4 sm:p-6 lg:p-8">
  {viewMode === "kanban" ? (
    <Board
      board={activeBoard}
      onAddTask={handleAddTask}
      onDeleteTask={handleDeleteTask}
      onEditTask={setEditingTask}
      onSaveTask={handleSaveTask}
      onRenameBoard={handleRenameBoard}
      onDeleteBoard={handleDeleteBoard}
    />
  ) : (
    //AGREGADO
    <ListView 
      board={activeBoard} 
      onAddTask={handleAddTask}
      onDeleteTask={handleDeleteTask}
      onEditTask={setEditingTask}
      onSaveTask={handleSaveTask}
      onRenameBoard={handleRenameBoard}
      onDeleteBoard={handleDeleteBoard}
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
          onCreate={handleConfirmNewBoard}
        />
      )}
      {renamingBoard && (
        <RenameBoardModal 
          board={renamingBoard}
          onClose={() => setRenamingBoard(null)}
          onSave={handleConfirmRenameBoard}
        />
      )}
    </div>
  );
};

export default App;
