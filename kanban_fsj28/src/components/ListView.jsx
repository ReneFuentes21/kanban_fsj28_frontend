import React from 'react';
import BoardActions from './BoardActions';
import Row from './Row';

const ListView = ({ board, onAddTask, onDeleteTask, onEditTask, onSaveTask, onRenameBoard, onDeleteBoard }) => {
    return (
        <div className="space-y-6">
            {/* Cabecera con acciones, igual que en Kanban */}
            <BoardActions
                board={board}
                onRenameBoard={onRenameBoard}
                onAddTask={onAddTask}
                onDeleteBoard={onDeleteBoard}
            />

            {board.columns.map((column) => (
                <Row
                    key={column.id}
                    column={column}
                    onAddTask={() => onAddTask(column.id)}
                    onDeleteTask={onDeleteTask}
                    onEditTask={onEditTask}
                    onSaveTask={onSaveTask}
                />
            ))}

        </div>
    );
};

export default ListView;