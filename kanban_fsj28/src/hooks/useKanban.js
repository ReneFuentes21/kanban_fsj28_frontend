import { useState, useEffect, useCallback } from 'react';
import { useBoards } from './useBoards';
import { useTasks } from './useTasks';
import { createEmptyColumnTemplate, getCardIdFromColumnName } from '../utils/taskTransformers';
import { Priority } from '../constants';
import kanbanService from '../services/kanbanService'; 

export const useKanban = () => {
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [renamingBoard, setRenamingBoard] = useState(null);

  const { boards, setBoards, loading: boardsLoading, error: boardsError, ...boardsActions } = useBoards();
  const { loading: tasksLoading, error: tasksError, ...tasksActions } = useTasks();

  const loading = boardsLoading || tasksLoading;
  const error = boardsError || tasksError;

  useEffect(() => {
    boardsActions.loadBoards().then(loadedBoards => {
      if (loadedBoards.length > 0) {
        setActiveBoardId(prev => prev || loadedBoards[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeBoardId) return;
    
    tasksActions.loadBoardData(activeBoardId).then(({ columns, tasks }) => {
      const columnsWithTasks = columns.map(col => ({
        ...col,
        tasks: tasks.filter(t => t.card_id === col.id || t.status === col.id)
      }));
      
      setBoards(prev => prev.map(b => 
        b.id === activeBoardId ? { ...b, columns: columnsWithTasks } : b
      ));
    });
  }, [activeBoardId]);

  const handleCreateNewBoard = useCallback(async (newBoardName) => {
    try {
      const created = await boardsActions.createBoard(newBoardName);
      
      if (created && created.id) {
        const defaultColumns = [
          { title: 'Pendiente', order: 1 },
          { title: 'En progreso', order: 2 },
          { title: 'En revisión', order: 3 },
          { title: 'Finalizado', order: 4 }
        ];
        
        const createdColumns = [];
        for (const column of defaultColumns) {
          try {
            const createdColumn = await kanbanService.columns.create(created.id, column);
            createdColumns.push(createdColumn);
          } catch (err) {
            console.error('Error creating default column:', err);
            createdColumns.push({ 
              id: `temp-${column.title}-${Date.now()}`,
              title: column.title 
            });
          }
        }
        
        const uiColumns = createdColumns.map(column => 
          createEmptyColumnTemplate(column.id, column.title)
        );
        
        setBoards(prev => [...prev, { 
          id: created.id, 
          name: created.name, 
          columns: uiColumns
        }]);
        
        setActiveBoardId(created.id);
        setIsNewBoardModalOpen(false);
      }
    } catch (err) {
      throw err;
    }
  }, [boardsActions]);

  const handleRenameBoard = useCallback((boardId, newName) => {
    return boardsActions.updateBoard(boardId, { name: newName });
  }, [boardsActions]);

  const handleDeleteBoard = useCallback(async (boardId) => {
    try {
      await boardsActions.deleteBoard(boardId);
      
      setBoards(prev => {
        const remaining = prev.filter(b => b.id !== boardId);
        if (remaining.length > 0) {
          setActiveBoardId(remaining[0].id);
        } else {
          setActiveBoardId(null);
        }
        return remaining;
      });
    } catch (err) {
      if (err.message?.includes('No query results') || err.message?.includes('not found')) {
        console.warn('Board no encontrado, actualizando estado local');
        setBoards(prev => prev.filter(b => b.id !== boardId));
        if (activeBoardId === boardId) {
          setActiveBoardId(prev => {
            const remaining = boards.filter(b => b.id !== boardId);
            return remaining.length > 0 ? remaining[0].id : null;
          });
        }
      } else {
        throw err;
      }
    }
  }, [boardsActions, activeBoardId, boards]);

  const handleAddTask = useCallback((columnId) => {
    const newTask = {
      id: null,
      title: '',
      description: '',
      status: columnId,
      priority: Priority.MEDIA,
      progress: 0,
      user: { name: '', role: '', avatarUrl: 'https://i.pravatar.cc/40' },
      allocator: '',
      creationDate: new Date(),
      deadline: null,
      isNew: true,
    };
    setEditingTask(newTask);
  }, []);

  const handleMoveTask = useCallback(async (taskId, fromColumnId, toColumnId) => {
    if (!activeBoardId) return;

    const originalBoardState = boards.find(b => b.id === activeBoardId);
    const originalTask = originalBoardState?.columns
      .flatMap(col => col.tasks)
      .find(t => t.id === taskId);

    if (!originalTask) {
      console.warn('Tarea no encontrada en estado original');
      return;
    }

    setBoards(prev => prev.map(board => {
      if (board.id !== activeBoardId) return board;

      let movedTask = null;
      const updatedColumns = board.columns.map(column => {
        if (column.id === fromColumnId) {
          const taskIndex = column.tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            movedTask = column.tasks[taskIndex];
            return {
              ...column,
              tasks: column.tasks.filter(t => t.id !== taskId)
            };
          }
        }
        return column;
      });

      if (!movedTask) {
        console.warn('Tarea no encontrada en columna origen');
        return board;
      }

      const taskWithNewStatus = {
        ...movedTask,
        status: toColumnId
      };

      const finalColumns = updatedColumns.map(column => {
        if (column.id === toColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, taskWithNewStatus]
          };
        }
        return column;
      });

      return {
        ...board,
        columns: finalColumns
      };
    }));

    try {
      const activeBoard = boards.find(b => b.id === activeBoardId);
      if (!activeBoard) return;

      const newCardId = getCardIdFromColumnName(toColumnId, activeBoard.columns);
      
      const payload = {
        taskName: originalTask.title || 'Tarea sin título',
        description: originalTask.description || '',
        startDate: originalTask.creationDate ? 
          new Date(originalTask.creationDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        endDate: originalTask.deadline ? 
          new Date(originalTask.deadline).toISOString().split('T')[0] : null,
        allocator: originalTask.allocator || originalTask.user?.name || 'Usuario',
        employee: originalTask.user?.name || 'Usuario',
        priority: originalTask.priority || Priority.MEDIA,
        progress: originalTask.progress || 0,
        card_id: newCardId
      };

      await tasksActions.updateTask(taskId, payload);

    } catch (error) {
      console.error('❌ Error al actualizar tarea en API:', error);
      
      setBoards(prev => prev.map(board => {
        if (board.id !== activeBoardId) return board;
        const columnsWithoutTask = board.columns.map(column => ({
          ...column,
          tasks: column.tasks.filter(t => t.id !== taskId)
        }));
        return {
          ...board,
          columns: columnsWithoutTask.map(column => {
            if (column.id === fromColumnId) {
              return {
                ...column,
                tasks: [...column.tasks, originalTask]
              };
            }
            return column;
          })
        };
      }));
    }
  }, [activeBoardId, boards, tasksActions]);

  const handleSaveTask = useCallback(async (savedTask) => {
    if (!activeBoardId) throw new Error('No board activo seleccionado.');
    
    const activeBoard = boards.find(b => b.id === activeBoardId);
    if (!activeBoard) throw new Error('Board no encontrado');

    let cardId;
    let didColumnChange = false;

    if (!savedTask.id) {
      cardId = getCardIdFromColumnName(savedTask.status, activeBoard.columns);
    } else {
      const currentTask = activeBoard.columns.flatMap(col => col.tasks).find(t => t.id === savedTask.id);
      if (currentTask) {
        const currentColumnId = getCardIdFromColumnName(currentTask.status, activeBoard.columns);
        const newColumnId = getCardIdFromColumnName(savedTask.status, activeBoard.columns);
        didColumnChange = currentColumnId !== newColumnId;
        cardId = didColumnChange ? newColumnId : currentColumnId;
      } else {
        cardId = getCardIdFromColumnName(savedTask.status, activeBoard.columns);
      }
    }

    const formatDateForAPI = (date) => {
      if (!date) return null;
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
          console.warn('Fecha inválida:', date);
          return null;
        }
        return d.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formateando fecha:', error);
        return null;
      }
    };

    const payload = {
      taskName: savedTask.title || 'Nueva Tarea',
      description: savedTask.description || '',
      startDate: formatDateForAPI(savedTask.creationDate) || new Date().toISOString().split('T')[0],
      endDate: formatDateForAPI(savedTask.deadline),
      allocator: savedTask.allocator || savedTask.user?.name || 'Usuario',
      employee: savedTask.user?.name || 'Usuario',
      priority: savedTask.priority || Priority.MEDIA,
      progress: parseInt(savedTask.progress) || 0,
      card_id: cardId
    };

    try {
      let updatedTask;

      if (!savedTask.id) {
        const created = await tasksActions.createTask(activeBoardId, payload);
        updatedTask = {
          id: created.id || Date.now(),
          title: created.taskName || payload.taskName,
          description: created.description || payload.description,
          status: savedTask.status,
          priority: created.priority || payload.priority,
          progress: created.progress || payload.progress,
          user: {
            name: created.employee || payload.employee,
            role: '',
            avatarUrl: 'https://i.pravatar.cc/40'
          },
          allocator: created.allocator || payload.allocator,
          creationDate: new Date(created.startDate || payload.startDate),
          deadline: created.endDate ? new Date(created.endDate) : (payload.endDate ? new Date(payload.endDate) : null),
        };

        setBoards(prev => prev.map(board => {
          if (board.id !== activeBoardId) return board;
          return {
            ...board,
            columns: board.columns.map(column => {
              if (column.id === savedTask.status || column.title === savedTask.status) {
                return {
                  ...column,
                  tasks: [...column.tasks, updatedTask]
                };
              }
              return column;
            })
          };
        }));

      } else {
        await tasksActions.updateTask(savedTask.id, payload);
        const updatedDeadline = savedTask.deadline instanceof Date ? savedTask.deadline : 
                               (savedTask.deadline ? new Date(savedTask.deadline) : null);
        updatedTask = {
          ...savedTask,
          title: payload.taskName,
          description: payload.description,
          priority: payload.priority,
          progress: payload.progress,
          user: {
            ...savedTask.user,
            name: payload.employee || payload.allocator
          },
          allocator: payload.allocator,
          deadline: updatedDeadline,
        };

        if (didColumnChange) {
          setBoards(prev => prev.map(board => {
            if (board.id !== activeBoardId) return board;
            const columnsWithoutTask = board.columns.map(column => ({
              ...column,
              tasks: column.tasks.filter(task => task.id !== savedTask.id)
            }));
            return {
              ...board,
              columns: columnsWithoutTask.map(column => {
                if (column.id === savedTask.status || column.title === savedTask.status) {
                  return {
                    ...column,
                    tasks: [...column.tasks, updatedTask]
                  };
                }
                return column;
              })
            };
          }));
        } else {
          setBoards(prev => prev.map(board => {
            if (board.id !== activeBoardId) return board;
            return {
              ...board,
              columns: board.columns.map(column => ({
                ...column,
                tasks: column.tasks.map(task => {
                  if (task.id === savedTask.id) {
                    return updatedTask;
                  }
                  return task;
                })
              }))
            };
          }));
        }
      }
      
      setEditingTask(null);
      return updatedTask;
    } catch (err) {
      console.error('❌ Error guardando tarea:', err);
      throw err;
    }
  }, [activeBoardId, boards, tasksActions]);

  const handleDeleteTask = useCallback(async (taskToDelete) => {
    if (!taskToDelete?.id) return;
    await tasksActions.deleteTask(taskToDelete.id);
    setBoards(prev => prev.map(b => {
      if (b.id !== activeBoardId) return b;
      return {
        ...b,
        columns: b.columns.map(col => ({ 
          ...col, 
          tasks: col.tasks.filter(t => t.id !== taskToDelete.id) 
        }))
      };
    }));
  }, [activeBoardId, tasksActions]);

  const clearError = useCallback(() => {
    boardsActions.clearError();
    tasksActions.clearError();
  }, [boardsActions, tasksActions]);

  return {
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
    handleMoveTask,
    clearError
  };
};
