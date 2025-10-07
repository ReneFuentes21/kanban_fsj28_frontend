import { Status, Priority } from '../constants';

export const transformApiTaskToUi = (t) => {
  return {
    id: t.id || Date.now(),
    title: t.taskName || t.title || 'Sin título',
    description: t.description || '',
    status: t.card_id || t.status || Status.PENDIENTE,
    priority: t.priority || Priority.MEDIA,
    user: {
      name: t.allocator || t.allocate || t.user?.name || 'Usuario',
      role: t.user?.role || '',
      avatarUrl: t.user?.avatarUrl || 'https://i.pravatar.cc/40'
    },
    creationDate: t.startDate ? new Date(t.startDate) : (t.creationDate ? new Date(t.creationDate) : new Date()),
    deadline: t.endDate ? new Date(t.endDate) : (t.deadline ? new Date(t.deadline) : null),
  };
};

export const createEmptyColumnTemplate = (id, title) => ({
  id,
  title,
  tasks: []
});

export const getCardIdFromColumnName = (columnNameOrId, boardColumns) => {
  if (!boardColumns || !Array.isArray(boardColumns)) {
    console.warn('No hay columnas disponibles, usando valor por defecto');
    return 1;
  }

  // Si columnNameOrId es un número, buscar por ID
  if (typeof columnNameOrId === 'number' || !isNaN(columnNameOrId)) {
    const numericId = parseInt(columnNameOrId);
    const columnById = boardColumns.find(col => col.id === numericId || col.id === columnNameOrId);
    if (columnById) {
      return columnById.id;
    }
  }

  // Si es string, buscar por título
  if (typeof columnNameOrId === 'string') {
    const columnByName = boardColumns.find(col => 
      col.title === columnNameOrId || col.id === columnNameOrId
    );
    if (columnByName) {
      return columnByName.id;
    }
  }

  // Si no se encuentra, usar la primera columna
  console.warn(`❌ Columna "${columnNameOrId}" no encontrada, usando primera columna`);
  return boardColumns[0]?.id || 1;
};