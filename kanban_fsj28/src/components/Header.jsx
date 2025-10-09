import React, { useState } from 'react';
import { BoardIcon, PlusIcon, ListIcon, GridIcon, ChevronDownIcon } from '../constants';

const Header = ({ 
    boards, 
    activeBoardId, 
    onSelectBoard, 
    onNewBoard, 
    viewMode, 
    onViewModeChange 
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const activeBoard = boards.find(b => b.id === activeBoardId);

    return (
        <header className="bg-white shadow-sm p-4 border-b border-gray-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <BoardIcon />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tableros Kanban</h1>
                        <p className="text-sm text-gray-500 hidden md:block dark:text-gray-400">Organiza tus tareas eficientemente</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center justify-between w-full sm:w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-gray-200 dark:border-slate-600 dark:hover:bg-slate-600"
                        >
                            <span>{activeBoard?.name || 'Seleccionar Tablero'}</span>
                            <ChevronDownIcon />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 dark:bg-slate-700 dark:border-slate-600">
                                <ul className="py-1">
                                    {boards.map(board => (
                                        <li key={board.id}>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onSelectBoard(board.id);
                                                    setDropdownOpen(false);
                                                }}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-600"
                                            >
                                                {board.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onNewBoard}
                        className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        <PlusIcon />
                        <span>Nuevo Tablero</span>
                    </button>
                    <div className="flex border border-gray-300 rounded-md overflow-hidden dark:border-slate-600">
                        <button 
                            onClick={() => onViewModeChange('kanban')}
                            className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
                                viewMode === 'kanban' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            <GridIcon />
                            <span>Kanban</span>
                        </button>
                        <button 
                            onClick={() => onViewModeChange('list')}
                            className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
                                viewMode === 'list' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            <ListIcon />
                            <span>Lista</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;