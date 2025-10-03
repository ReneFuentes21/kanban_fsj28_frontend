import React from 'react';
import Column from './Column';
// import { Status } from '../constants';
import BoardActions from './BoardActions';
//import { PencilIcon, PlusIcon, TrashIcon } from '../constants';

const Board = ({ board, onAddTask, onDeleteTask, onEditTask, onSaveTask, onRenameBoard, onDeleteBoard }) => {
    return (
        <div className="space-y-6">
            <BoardActions
                board={board}
                onRenameBoard={onRenameBoard}
                onAddTask={onAddTask}
                onDeleteBoard={onDeleteBoard}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {board.columns.map((column) => (
                    <Column
                        key={column.id}
                        column={column}
                        onAddTask={() => onAddTask(column.id)}
                        onDeleteTask={onDeleteTask}
                        onEditTask={onEditTask}
                        onSaveTask={onSaveTask}
                    />
                ))}
            </div>
        </div>
    );
};

export default Board;