import React from 'react';

export const Status = {
    PENDIENTE: 'Pendiente',
    EN_PROGRESO: 'En progreso',
    EN_REVISION: 'En revisión',
    FINALIZADO: 'Finalizado',
};

export const Priority = {
    BAJA: 'Baja',
    MEDIA: 'Media',
    ALTA: 'Alta',
    URGENTE: 'Urgente',
};

export const STATUS_COLORS = {
    [Status.PENDIENTE]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    [Status.EN_PROGRESO]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    [Status.EN_REVISION]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    [Status.FINALIZADO]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
};

export const STATUS_BG_COLORS = {
    [Status.PENDIENTE]: 'bg-gray-100 dark:bg-slate-800',
    [Status.EN_PROGRESO]: 'bg-gray-100 dark:bg-slate-800',
    [Status.EN_REVISION]: 'bg-gray-100 dark:bg-slate-800',
    [Status.FINALIZADO]: 'bg-gray-100 dark:bg-slate-800',
};

export const STATUS_BORDER_COLORS = {
    [Status.PENDIENTE]: 'border-gray-200 dark:border-slate-700',
    [Status.EN_PROGRESO]: 'border-gray-200 dark:border-slate-700',
    [Status.EN_REVISION]: 'border-gray-200 dark:border-slate-700',
    [Status.FINALIZADO]: 'border-gray-200 dark:border-slate-700',
};


export const PRIORITY_COLORS = {
    [Priority.BAJA]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    [Priority.MEDIA]: 'bg-blue-200 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
    [Priority.ALTA]: 'bg-orange-200 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
    [Priority.URGENTE]: 'bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200',
};

export const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
    </svg>
);

export const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ pointerEvents: 'none' }} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

export const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ pointerEvents: 'none' }} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);

export const BoardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h6v6H4V4zm8 0h6v10h-6V4zm-8 8h6v8H4v-8zm8 4h6v4h-6v-4z" />
    </svg>
);

export const EmptyStateIcon = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
    </svg>
);

export const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);