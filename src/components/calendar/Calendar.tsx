import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Database } from '../../types/database.types';

type WorkSession = Database['public']['Tables']['work_sessions']['Row'];

interface CalendarProps {
    sessions: WorkSession[];
    onDayClick: (date: Date, daySessions: WorkSession[]) => void;
}

export const Calendar = ({ sessions, onDayClick }: CalendarProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and total days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Get days from previous month to fill the grid
    const previousMonth = new Date(year, month, 0);
    const daysInPreviousMonth = previousMonth.getDate();

    // Calculate total cells needed
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Group sessions by date
    const sessionsByDate = sessions.reduce((acc, session) => {
        const date = new Date(session.start_time).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {} as Record<string, WorkSession[]>);

    const getSessionsForDay = (day: number, isCurrentMonth: boolean): WorkSession[] => {
        if (!isCurrentMonth) return [];
        const date = new Date(year, month, day).toDateString();
        return sessionsByDate[date] || [];
    };

    const getIndicatorColor = (count: number): string => {
        if (count === 0) return '';
        if (count === 1) return 'bg-green-500';
        if (count <= 3) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const isToday = (day: number, isCurrentMonth: boolean): boolean => {
        if (!isCurrentMonth) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    const renderCalendarCells = () => {
        const cells = [];

        for (let i = 0; i < totalCells; i++) {
            let day: number;
            let isCurrentMonth: boolean;
            let cellMonth: number;
            let cellYear: number;

            if (i < startingDayOfWeek) {
                // Previous month
                day = daysInPreviousMonth - startingDayOfWeek + i + 1;
                isCurrentMonth = false;
                cellMonth = month === 0 ? 11 : month - 1;
                cellYear = month === 0 ? year - 1 : year;
            } else if (i >= startingDayOfWeek + daysInMonth) {
                // Next month
                day = i - startingDayOfWeek - daysInMonth + 1;
                isCurrentMonth = false;
                cellMonth = month === 11 ? 0 : month + 1;
                cellYear = month === 11 ? year + 1 : year;
            } else {
                // Current month
                day = i - startingDayOfWeek + 1;
                isCurrentMonth = true;
                cellMonth = month;
                cellYear = year;
            }

            const daySessions = getSessionsForDay(day, isCurrentMonth);
            const indicatorColor = getIndicatorColor(daySessions.length);
            const today = isToday(day, isCurrentMonth);
            const cellDate = new Date(cellYear, cellMonth, day);

            cells.push(
                <button
                    key={i}
                    onClick={() => onDayClick(cellDate, daySessions)}
                    className={`
                        aspect-square p-2 rounded-lg transition-all relative
                        ${isCurrentMonth ? 'text-white hover:bg-white/10' : 'text-gray-600'}
                        ${today ? 'ring-2 ring-primary-lime' : ''}
                        ${daySessions.length > 0 ? 'cursor-pointer' : 'cursor-default'}
                    `}
                >
                    <div className="text-sm font-medium">{day}</div>
                    {indicatorColor && (
                        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${indicatorColor}`} />
                    )}
                </button>
            );
        }

        return cells;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                    {monthNames[month]} {year}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
                {/* Day names */}
                <div className="grid grid-cols-7 gap-2">
                    {dayNames.map(name => (
                        <div key={name} className="text-center text-sm font-medium text-gray-400 py-2">
                            {name}
                        </div>
                    ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7 gap-2">
                    {renderCalendarCells()}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>1 sesión</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>2-3 sesiones</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>4+ sesiones</span>
                </div>
            </div>
        </div>
    );
};
