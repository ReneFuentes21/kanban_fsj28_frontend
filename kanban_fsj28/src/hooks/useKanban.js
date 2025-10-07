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

  // Load boards on mount
  useEffect(() => {
    boardsActions.loadBoards().then(loadedBoards => {
      if (loadedBoards.length > 0) {
        setActiveBoardId(prev => prev || loadedBoards[0].id);
      }
    });
  }, []);

  // Load active board data when it changes
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

  /* Board operations */
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
        
        // ✅ CERRAR EL MODAL DESPUÉS DE CREAR EXITOSAMENTE
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
      // Si hay error pero es porque el tablero ya no existe, actualizar estado igualmente
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
        throw err; // Relanzar otros errores
      }
    }
  }, [boardsActions, activeBoardId, boards]);

  /* Task operations */
  const handleAddTask = useCallback((columnId) => {
    const newTask = {
      id: null,
      title: '',
      description: '',
      status: columnId,
      priority: Priority.MEDIA,
      user: { name: '', role: '', avatarUrl: 'https://i.pravatar.cc/40' },
      creationDate: new Date(),
      deadline: null,
      isNew: true,
    };
    setEditingTask(newTask);
  }, []);

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

    const payload = {
      taskName: savedTask.title || 'Nueva Tarea',
      description: savedTask.description || '',
      startDate: savedTask.creationDate ? new Date(savedTask.creationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: savedTask.deadline ? new Date(savedTask.deadline).toISOString().split('T')[0] : null,
      allocator: savedTask.user?.name || 'Usuario',
      employee: savedTask.user?.name || 'Usuario',
      priority: savedTask.priority || Priority.MEDIA,
      progress: 0,
      card_id: cardId
    };

    try {
      let updatedTask;

      if (!savedTask.id) {
        // Crear nueva tarea
        const created = await tasksActions.createTask(activeBoardId, payload);
        
        updatedTask = {
          id: created.id || Date.now(),
          title: created.taskName || payload.taskName,
          description: created.description || payload.description,
          status: savedTask.status,
          priority: created.priority || payload.priority,
          user: {
            name: created.allocator || payload.allocator,
            role: '',
            avatarUrl: 'https://i.pravatar.cc/40'
          },
          creationDate: new Date(created.startDate || payload.startDate),
          deadline: created.endDate ? new Date(created.endDate) : (payload.endDate ? new Date(payload.endDate) : null),
        };

        // Actualizar estado para nueva tarea
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
        // Actualizar tarea existente
        await tasksActions.updateTask(savedTask.id, payload);
        
        // CORRECCIÓN: Usar el deadline de savedTask en lugar de payload.endDate
        // porque savedTask ya tiene el Date object correcto
        const updatedDeadline = savedTask.deadline instanceof Date ? savedTask.deadline : 
                               (payload.endDate ? new Date(payload.endDate) : null);
        
        // Crear el objeto actualizado para el estado local
        updatedTask = {
          ...savedTask,
          title: payload.taskName,
          description: payload.description,
          priority: payload.priority,
          user: {
            ...savedTask.user,
            name: payload.allocator
          },
          deadline: updatedDeadline, // ← ESTA ES LA CORRECCIÓN CLAVE
        };

        console.log('🔄 Actualizando tarea en estado:', {
          id: updatedTask.id,
          title: updatedTask.title,
          deadline: updatedTask.deadline,
          deadlineType: typeof updatedTask.deadline
        });

        // Actualizar estado local inmediatamente
        if (didColumnChange) {
          // Si cambió de columna, mover la tarea
          setBoards(prev => prev.map(board => {
            if (board.id !== activeBoardId) return board;
            
            // Remover de todas las columnas
            const columnsWithoutTask = board.columns.map(column => ({
              ...column,
              tasks: column.tasks.filter(task => task.id !== savedTask.id)
            }));
            
            // Agregar a la nueva columna
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
          // Si no cambió de columna, actualizar en la misma columna
          setBoards(prev => prev.map(board => {
            if (board.id !== activeBoardId) return board;
            
            return {
              ...board,
              columns: board.columns.map(column => ({
                ...column,
                tasks: column.tasks.map(task => {
                  if (task.id === savedTask.id) {
                    console.log('✅ Tarea actualizada en columna - Deadline:', updatedTask.deadline);
                    return updatedTask;
                  }
                  return task;
                })
              }))
            };
          }));
        }
      }
      
      // ✅ CERRAR EL MODAL DE EDICIÓN DESPUÉS DE GUARDAR EXITOSAMENTE
      setEditingTask(null);
      
      return updatedTask; // Retornar la tarea actualizada
      
    } catch (err) {
      console.error('❌ Error guardando tarea:', err);
      throw err; // Relanzar el error para que el modal lo maneje
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
    // State
    boards,
    activeBoardId,
    editingTask,
    isNewBoardModalOpen,
    renamingBoard,
    loading,
    error,
    
    // Setters
    setActiveBoardId,
    setEditingTask,
    setIsNewBoardModalOpen,
    setRenamingBoard,
    
    // Actions
    handleCreateNewBoard,
    handleRenameBoard,
    handleDeleteBoard,
    handleAddTask,
    handleSaveTask,
    handleDeleteTask,
    clearError
  };
};