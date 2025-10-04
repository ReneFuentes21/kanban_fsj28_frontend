import React, { useEffect, useMemo, useState } from 'react';
import Column from './Column';
// import { Status } from '../constants';
import BoardActions from './BoardActions';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';

//import { PencilIcon, PlusIcon, TrashIcon } from '../constants';


const Board = ({ board, onAddTask, onDeleteTask, onEditTask, onSaveTask, onRenameBoard, onDeleteBoard}) => {
    const [columns, setColumns] = useState(board.columns);
    const[activeColumn, setActiveColumn]=useState(null);
    const[activeTask, setActiveTask]=useState(null);

    useEffect(() => {
        setColumns(board.columns);
    }, [board.columns]);

    const columnIds = useMemo(() => columns.map(col => col.id), [columns]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, 
            },
        })
    );

    const onDragStart = (event) => {
        
        setActiveTask(null);
        if (event.active.data.current?.type==="Column"){
            setActiveColumn(event.active.data.current.column);
            setActiveTask(null);
           return;
        }
        if (event.active.data.current?.type==="Task"){
            setActiveTask(event.active.data.current.task);
            setActiveColumn(null);
            return;
        }
    };
    const onDragEnd = (event) => {
        setActiveColumn(null);
        setActiveTask(null);
        const {active, over}=event;
        if (!over)return;
        const activeId= active.id;
        const overId=over.id;

        if(activeId===overId)return;

        const isActiveColumn = active.data.current?.type === "Column";
        if (isActiveColumn) {
            setColumns((columns) => {
                const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
                const overColumnIndex = columns.findIndex((col) => col.id === overId);
                return arrayMove(columns, activeColumnIndex, overColumnIndex);
            });
        }
    };

    const  onDragover=(event)=>{
        const {active, over}=event;
        if (!over)return;
        const activeId= active.id;
        const overId=over.id;

        if(activeId===overId)return;

        const isActiveTask = active.data.current?.type==="Task";
        const isOverTask = over.data.current?.type==="Task";

        if(!isActiveTask)return;

        if (isActiveTask && isOverTask) {
            setColumns((columns) => {
                const activeColumnIndex = columns.findIndex((col) =>
                    col.tasks.find((t) => t.id === activeId)
                );
                const overColumnIndex = columns.findIndex((col) =>
                    col.tasks.find((t) => t.id === overId)
                );

                if (activeColumnIndex === -1 || overColumnIndex === -1) return columns;

                const activeColumn = columns[activeColumnIndex];
                const overColumn = columns[overColumnIndex];

                const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
                const overTaskIndex = overColumn.tasks.findIndex((t) => t.id === overId);

                if (activeColumnIndex === overColumnIndex) {
                    const newTasks = arrayMove(activeColumn.tasks, activeTaskIndex, overTaskIndex);
                    const newColumns = [...columns];
                    newColumns[activeColumnIndex] = {
                        ...activeColumn,
                        tasks: newTasks,
                    };
                    return newColumns;
                } else {
                    const newActiveColumnTasks = activeColumn.tasks.filter((t) => t.id !== activeId);
                    const taskToMove = { ...activeColumn.tasks[activeTaskIndex], status: overColumn.id };
                    const newOverColumnTasks = [...overColumn.tasks];
                    newOverColumnTasks.splice(overTaskIndex, 0, taskToMove);

                    const newColumns = [...columns];
                    newColumns[activeColumnIndex] = {
                        ...activeColumn,
                        tasks: newActiveColumnTasks,
                    };
                    newColumns[overColumnIndex] = {
                        ...overColumn,
                        tasks: newOverColumnTasks,
                    };
                    return newColumns;
                }
            });
        }

        const isOverColumn = over.data.current?.type === "Column";
        if (isActiveTask && isOverColumn) {
            setColumns((columns) => {
                const activeColumnIndex = columns.findIndex((col) =>
                    col.tasks.find((t) => t.id === activeId)
                );
                const overColumnIndex = columns.findIndex((col) => col.id === overId);

                if (activeColumnIndex === -1 || overColumnIndex === -1) return columns;

                const activeColumn = columns[activeColumnIndex];
                const overColumn = columns[overColumnIndex];

                const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
                const taskToMove = { ...activeColumn.tasks[activeTaskIndex], status: overColumn.id };

                if (activeColumnIndex === overColumnIndex) return columns;

                const newActiveColumnTasks = activeColumn.tasks.filter((t) => t.id !== activeId);
                const newOverColumnTasks = [...overColumn.tasks, taskToMove];

                const newColumns = [...columns];
                newColumns[activeColumnIndex] = {
                    ...activeColumn,
                    tasks: newActiveColumnTasks,
                };
                newColumns[overColumnIndex] = {
                    ...overColumn,
                    tasks: newOverColumnTasks,
                };
                return newColumns;
            });
        }
    };



    return (
        <div className="space-y-6">
            <BoardActions
                board={board}
                onRenameBoard={onRenameBoard}
                onAddTask={onAddTask}
                onDeleteBoard={onDeleteBoard}
            />


            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragover}>
                <SortableContext items={columnIds}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((column) => (
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
            </SortableContext>
            {createPortal(
            <DragOverlay>
            {activeColumn && (<Column 
                        column={activeColumn} 
                        onAddTask={() => {}}
                        onDeleteTask={() => {}}
                        onEditTask={() => {}}
                        onSaveTask={() => {}}/>)}
            {activeTask   && <TaskCard 
                        task={activeTask} 
                        onAddTask={() => {}}
                        onDeleteTask={() => {}}
                        onEditTask={() => {}}
                        onSaveTask={() => {}}/>}
            </DragOverlay>,
            document.body
            )}
            </DndContext>

        </div>
    );
    
};


export default Board;