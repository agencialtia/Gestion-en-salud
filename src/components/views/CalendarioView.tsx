import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, Task, Meeting } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  CheckSquare,
  Sparkles,
  Filter,
  Plus,
  AlertCircle,
  MapPin,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { ProgramBadge } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';
import { formatDate } from '../../utils/dateUtils';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getTodayDateStr = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const CalendarioView: React.FC<{
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: (tab?: string) => void;
}> = ({ onOpenEntity, onOpenQuickCreate }) => {
  const { tasks, meetings, programs } = useApp();

  const [todayStr, setTodayStr] = useState<string>(getTodayDateStr());
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | 'all'>('all');
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateStr());

  // Real-time automatic date update (e.g., when the date changes at midnight)
  useEffect(() => {
    const updateToday = () => {
      const freshToday = getTodayDateStr();
      if (freshToday !== todayStr) {
        setTodayStr(freshToday);
      }
    };

    updateToday();
    const interval = setInterval(updateToday, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [todayStr]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    const freshToday = getTodayDateStr();
    setTodayStr(freshToday);
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(freshToday);
  };

  // Helper date extractors
  const getTaskDateStr = (t: Task): string | null => {
    const d = t.dueDate || t.endDate || (t as any).deadline;
    if (!d) return null;
    return d.substring(0, 10);
  };

  const getMeetingDateStr = (m: Meeting): string | null => {
    const d = m.dateTime || (m as any).date;
    if (!d) return null;
    return d.substring(0, 10);
  };

  // Filter items by selected program
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.archived) return false;
      if (selectedProgram !== 'all' && t.programId !== selectedProgram) return false;
      return true;
    });
  }, [tasks, selectedProgram]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      if (m.archived) return false;
      if (selectedProgram !== 'all' && m.programId !== selectedProgram) return false;
      return true;
    });
  }, [meetings, selectedProgram]);

  // Calendar math
  const daysInCurrentMonth = useMemo(() => {
    const date = new Date(currentYear, currentMonth + 1, 0);
    const numDays = date.getDate();
    return Array.from({ length: numDays }, (_, i) => {
      const dayNum = i + 1;
      const monthStr = (currentMonth + 1).toString().padStart(2, '0');
      const dayStr = dayNum.toString().padStart(2, '0');
      return `${currentYear}-${monthStr}-${dayStr}`;
    });
  }, [currentYear, currentMonth]);

  // Day offset: Monday = 0, Sunday = 6
  const startDayOffset = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // JS Sunday is 0 -> convert so Monday is 0, Sunday is 6
    return firstDay === 0 ? 6 : firstDay - 1;
  }, [currentYear, currentMonth]);

  // Selected date items
  const dayMeetings = useMemo(() => {
    return filteredMeetings.filter((m) => getMeetingDateStr(m) === selectedDate);
  }, [filteredMeetings, selectedDate]);

  const dayTasks = useMemo(() => {
    return filteredTasks.filter((t) => getTaskDateStr(t) === selectedDate);
  }, [filteredTasks, selectedDate]);

  return (
    <div id="view-calendario" className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Calendario Operativo & Hitos
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Conexión en vivo con tareas por vencer, comités técnicos y reuniones de cada programa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickCreate('meeting')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Agendar Evento</span>
          </button>
        </div>
      </div>

      {/* Program filter (Responsive wrap) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Filter className="h-3.5 w-3.5" /> Filtrar:
        </span>
        <button
          onClick={() => setSelectedProgram('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedProgram === 'all'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Todos ({programs.length})
        </button>
        {programs.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProgram(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedProgram === p.id
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
            <span>{p.shortName}</span>
          </button>
        ))}
      </div>

      {/* Calendar Grid & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
          {/* Month Navigator Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 min-w-36">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoToToday}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span>Hoy ({formatDate(todayStr)})</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty days for weekday offset */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-18 rounded-xl bg-slate-50/50 dark:bg-slate-800/30" />
            ))}

            {daysInCurrentMonth.map((dateStr) => {
              const dayNumber = parseInt(dateStr.split('-')[2], 10);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;

              const dayMs = filteredMeetings.filter((m) => getMeetingDateStr(m) === dateStr);
              const dayTs = filteredTasks.filter((t) => getTaskDateStr(t) === dateStr);
              const totalEvents = dayMs.length + dayTs.length;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-18 p-2 rounded-2xl text-left flex flex-col justify-between cursor-pointer transition-colors ${
                    isToday
                      ? 'bg-indigo-600 text-white border border-indigo-600 shadow-none'
                      : isSelected
                      ? 'border-2 border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40'
                      : 'border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-black ${
                          isToday
                            ? 'text-white'
                            : isSelected
                            ? 'text-indigo-900 dark:text-indigo-200'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dayNumber}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-white/20 text-white rounded-md tracking-wider">
                          HOY
                        </span>
                      )}
                    </div>
                    {totalEvents > 0 && (
                      <span
                        className={`text-[10px] font-black h-5 min-w-5 px-1.5 flex items-center justify-center rounded-lg ${
                          isToday
                            ? 'bg-white text-indigo-700'
                            : 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/80'
                        }`}
                      >
                        {totalEvents}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-1.5 flex-wrap items-center mt-1">
                    {dayMs.map((m) => (
                      <span
                        key={m.id}
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                          isToday ? 'bg-white' : 'bg-indigo-500'
                        }`}
                        title={`Reunión: ${m.title}`}
                      />
                    ))}
                    {dayTs.map((t) => (
                      <span
                        key={t.id}
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                          isToday
                            ? t.priority === 'critica' || t.isUrgent
                              ? 'bg-rose-400'
                              : t.status === 'completada'
                              ? 'bg-emerald-400'
                              : 'bg-amber-400'
                            : t.priority === 'critica' || t.isUrgent
                            ? 'bg-rose-500'
                            : t.status === 'completada'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        title={`Tarea: ${t.title}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Agenda del Día
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {formatDate(selectedDate)} {selectedDate === todayStr && '(Hoy)'}
              </h3>
            </div>

            {/* Meetings of selected day */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Reuniones ({dayMeetings.length})
              </span>
              {dayMeetings.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No hay reuniones programadas para esta fecha.</p>
              ) : (
                dayMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onOpenEntity('meeting', m.id)}
                    className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer text-xs space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-indigo-950 dark:text-indigo-200 line-clamp-1">{m.title}</span>
                      <span className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded shrink-0">
                        {m.dateTime ? m.dateTime.substring(11, 16) : '09:00'} hrs
                      </span>
                    </div>
                    {m.location && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{m.location}</span>
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <ProgramBadge programId={m.programId} />
                      <span className="text-[10px] font-medium text-slate-400">
                        {m.participants?.length || 0} participantes
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tasks due on selected day */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Vencimiento de Tareas ({dayTasks.length})
              </span>
              {dayTasks.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No hay tareas que venzan en esta fecha.</p>
              ) : (
                dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onOpenEntity('task', t.id)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer text-xs space-y-1.5 transition-colors bg-white dark:bg-slate-800/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</span>
                      {t.priority === 'critica' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 shrink-0">
                          Crítica
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>Resp: {t.responsible || t.assignedTo || 'Referente'}</span>
                      <ProgramBadge programId={t.programId} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenQuickCreate('task')}
            className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            + Crear tarea o reunión en esta fecha
          </button>
        </div>
      </div>
    </div>
  );
};
