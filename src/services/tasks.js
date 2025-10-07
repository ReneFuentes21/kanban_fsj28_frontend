import { Status, Priority } from '../constants';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 2);

const pastDate = new Date();
pastDate.setDate(pastDate.getDate() - 5);


export const initialBoards = [
    {
        id: 'board-1',
        name: 'Proyecto Alpha',
        columns: [
            {
                id: Status.PENDIENTE, title: 'Pendiente', tasks: [
                    { id: 'TSK-001', title: 'Diseñar la landing page', description: 'Crear el wireframe y el diseño visual para la nueva landing.', status: Status.PENDIENTE, priority: Priority.ALTA, user: { name: 'Ana Pérez', role: 'Diseño UI/UX', avatarUrl: 'https://i.pravatar.cc/40?u=1' }, creationDate: new Date('2024-07-15T10:00:00Z'), deadline: new Date('2024-08-01T23:59:59Z') },
                    { id: 'TSK-002', title: 'Configurar el entorno de desarrollo', description: 'Instalar dependencias y configurar el servidor local.', status: Status.PENDIENTE, priority: Priority.MEDIA, user: { name: 'Carlos Ruiz', role: 'Frontend Dev', avatarUrl: 'https://i.pravatar.cc/40?u=2' }, creationDate: new Date('2024-07-16T11:00:00Z'), deadline: futureDate },
                ]
            },
            {
                id: Status.EN_PROGRESO, title: 'En progreso', tasks: [
                    { id: 'TSK-003', title: 'Desarrollar componente de Header', description: 'Codificar el header responsivo con React y Tailwind.', status: Status.EN_PROGRESO, priority: Priority.ALTA, user: { name: 'Carlos Ruiz', role: 'Frontend Dev', avatarUrl: 'https://i.pravatar.cc/40?u=2' }, creationDate: new Date('2024-07-18T09:00:00Z'), deadline: new Date('2024-07-30T23:59:59Z') },
                ]
            },
            {
                id: Status.EN_REVISION, title: 'En revisión', tasks: [
                    { id: 'TSK-004', title: 'Revisar la API de autenticación', description: 'Validar los endpoints de login y registro.', status: Status.EN_REVISION, priority: Priority.URGENTE, user: { name: 'Luisa Gomez', role: 'Backend Dev', avatarUrl: 'https://i.pravatar.cc/40?u=3' }, creationDate: new Date('2024-07-20T14:00:00Z'), deadline: pastDate },
                ]
            },
            { id: Status.FINALIZADO, title: 'Finalizado', tasks: [] },
        ],
    },
    {
        id: 'board-2',
        name: 'Campaña Marketing Q3',
        columns: [
            { id: Status.PENDIENTE, title: 'Pendiente', tasks: [] },
            { id: Status.EN_PROGRESO, title: 'En progreso', tasks: [] },
            { id: Status.EN_REVISION, title: 'En revisión', tasks: [] },
            { id: Status.FINALIZADO, title: 'Finalizado', tasks: [] },
        ]
    }
];