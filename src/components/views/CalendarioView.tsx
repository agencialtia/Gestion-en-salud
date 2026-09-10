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
  Video,
  ExternalLink,
  RefreshCw,
  CalendarCheck2,
  Link as LinkIcon,
  Check,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { ProgramBadge } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';
import { formatDate } from '../../utils/dateUtils';
import { extractVideoMeetingLink, generateGoogleCalendarWebUrl } from '../../utils/googleCalendarSync';
import { ConfirmDialog } from '../common/ConfirmDialog';

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
  const {
    tasks,
    meetings,
    programs,
    currentUser,
    isGoogleCalendarConnected,
    isGoogleCalendarSyncing,
    lastGoogleCalendarSync,
    googleCalendarEmail,
    updateGoogleCalendarAccount,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncGoogleCalendar,
    exportMeetingToGoogleCalendar,
    exportTaskToGoogleCalendar,
    updateMeeting,
    deleteMeeting,
    showToast,
  } = useApp();

  const [todayStr, setTodayStr] = useState<string>(getTodayDateStr());
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | 'all'>('all');
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateStr());

  // Meeting Edit & Delete states
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [inputGCalEmail, setInputGCalEmail] = useState<string>(() => googleCalendarEmail || 'klaus.bauer@quilicurasalud.cl');
  const [editFormData, setEditFormData] = useState<{
    title: string;
    programId: ProgramId;
    date: string;
    time: string;
    location: string;
    meetingLink: string;
    description: string;
    participantsStr: string;
    status: 'programada' | 'en_curso' | 'realizada' | 'cancelada';
  }>({
    title: '',
    programId: 'cuid_paliativos',
    date: '',
    time: '09:00',
    location: '',
    meetingLink: '',
    description: '',
    participantsStr: '',
    status: 'programada',
  });

  const handleStartEdit = (m: Meeting, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dateVal = m.dateTime ? m.dateTime.substring(0, 10) : m.date || selectedDate;
    const timeVal = m.dateTime ? m.dateTime.substring(11, 16) : m.time || '09:00';
    setEditFormData({
      title: m.title || '',
      programId: m.programId || 'cuid_paliativos',
      date: dateVal,
      time: timeVal,
      location: m.location || '',
      meetingLink: m.meetingLink || '',
      description: m.description || m.summary || '',
      participantsStr: (m.participants || []).join(', '),
      status: m.status || 'programada',
    });
    setEditingMeeting(m);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;
    if (!editFormData.title.trim()) {
      showToast('El título de la reunión es obligatorio', 'warning');
      return;
    }

    const dateTimeIso = `${editFormData.date}T${editFormData.time}:00`;
    const participantsList = editFormData.participantsStr
      ? editFormData.participantsStr.split(',').map((p) => p.trim()).filter(Boolean)
      : [];

    const updates: Partial<Meeting> = {
      title: editFormData.title.trim(),
      programId: editFormData.programId,
      dateTime: dateTimeIso,
      date: editFormData.date,
      time: editFormData.time,
      location: editFormData.location.trim(),
      meetingLink: editFormData.meetingLink.trim(),
      description: editFormData.description.trim(),
      summary: editFormData.description.trim(),
      participants: participantsList,
      status: editFormData.status,
    };

    updateMeeting(editingMeeting.id, updates);

    if (isGoogleCalendarConnected || editingMeeting.googleCalendarEventId) {
      await exportMeetingToGoogleCalendar({ ...editingMeeting, ...updates });
    }

    showToast(`Reunión "${editFormData.title}" actualizada exitosamente`, 'success');
    setEditingMeeting(null);
  };

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
            Conexión en vivo con Google Calendar, tareas por vencer, comités técnicos y reuniones de cada programa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickCreate('meeting')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Agendar Evento</span>
          </button>
        </div>
      </div>

      {/* Google Calendar Sync Bar */}
      <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
              <CalendarCheck2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Integración con Google Calendar
                </h2>
                {isGoogleCalendarConnected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sincronización Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    No vinculado
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                {isGoogleCalendarConnected ? (
                  <>
                    <span>
                      Vinculado con <strong className="font-semibold text-slate-700 dark:text-slate-200">{googleCalendarEmail || currentUser.email || 'klaus.bauer@quilicurasalud.cl'}</strong>
                      {lastGoogleCalendarSync ? ` • Última sincronización: ${lastGoogleCalendarSync}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setInputGCalEmail(googleCalendarEmail || currentUser.email || 'klaus.bauer@quilicurasalud.cl');
                        setIsAccountModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors cursor-pointer"
                      title="Cambiar o editar cuenta de Google vinculada"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                      <span>Cambiar cuenta</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span>Sincroniza enlaces de Zoom / Meet, descripciones y fechas en tiempo real en ambas plataformas.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setInputGCalEmail(googleCalendarEmail || currentUser.email || 'klaus.bauer@quilicurasalud.cl');
                        setIsAccountModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold underline hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      Configurar cuenta
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isGoogleCalendarConnected ? (
              <>
                <button
                  type="button"
                  onClick={() => syncGoogleCalendar()}
                  disabled={isGoogleCalendarSyncing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-2xs hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
                  title="Sincronizar eventos bidireccionalmente ahora"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGoogleCalendarSyncing ? 'animate-spin' : ''}`} />
                  <span>{isGoogleCalendarSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
                </button>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  title="Abrir Google Calendar en pestaña nueva"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Abrir Google Calendar</span>
                </a>
                <button
                  type="button"
                  onClick={disconnectGoogleCalendar}
                  className="px-2 py-1.5 text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer transition-colors"
                  title="Desvincular cuenta de Google Calendar"
                >
                  Desvincular
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => connectGoogleCalendar()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Vincular Google Calendar</span>
              </button>
            )}
          </div>
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
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Agenda del Día
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatDate(selectedDate)} {selectedDate === todayStr && '(Hoy)'}
                </h3>
              </div>
              <a
                href={`https://calendar.google.com/calendar/u/0/r/day/${selectedDate.replace(/-/g, '/')}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                title="Abrir este día en Google Calendar"
              >
                <span>Ver en GCal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Meetings of selected day */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Reuniones & Comités ({dayMeetings.length})
              </span>
              {dayMeetings.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                  No hay reuniones programadas para esta fecha.
                </p>
              ) : (
                dayMeetings.map((m) => {
                  const video = extractVideoMeetingLink(m.meetingLink || m.location || m.summary || m.description);
                  const webGCalUrl = generateGoogleCalendarWebUrl({
                    title: m.title || 'Reunión Quilicura',
                    description: m.summary || m.description || '',
                    location: m.location || m.meetingLink || '',
                    startDateTime: m.dateTime || (m.date ? `${m.date}T${m.time || '09:00'}:00` : undefined),
                  });

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs space-y-2 transition-colors relative group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="cursor-pointer flex-1"
                            onClick={() => onOpenEntity('meeting', m.id)}
                          >
                            <span className="font-bold text-indigo-950 dark:text-indigo-100 hover:text-indigo-600 transition-colors block">
                              {m.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                              {m.dateTime ? m.dateTime.substring(11, 16) : m.time || '09:00'} hrs
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleStartEdit(m, e)}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
                              title="Editar reunión"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMeetingToDelete(m);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Eliminar reunión"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Summary / Description */}
                        {(m.summary || m.description) && (
                          <p
                            className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 cursor-pointer"
                            onClick={() => onOpenEntity('meeting', m.id)}
                          >
                            {m.summary || m.description}
                          </p>
                        )}

                        {m.location && !video && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{m.location}</span>
                          </p>
                        )}
                      </div>

                      {/* Video Link Action Button (Zoom / Google Meet) */}
                      {video && (
                        <div className="pt-1">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                              video.platform === 'meet'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : video.platform === 'zoom'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>Unirse a {video.label}</span>
                            <ExternalLink className="h-3 w-3 ml-0.5 opacity-80" />
                          </a>
                        </div>
                      )}

                      {/* Footer info & Google Calendar Sync Action */}
                      <div className="flex items-center justify-between pt-1 border-t border-indigo-100/60 dark:border-indigo-900/40 text-[10px]">
                        <div className="flex items-center gap-2">
                          <ProgramBadge programId={m.programId} />
                          {m.googleCalendarEventId && (
                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">
                              En Google Calendar
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportMeetingToGoogleCalendar(m);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                            title="Sincronizar a Google Calendar"
                          >
                            <span>Sincronizar</span>
                          </button>
                          <span>•</span>
                          <a
                            href={m.googleCalendarHtmlLink || webGCalUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-500 hover:text-indigo-600 flex items-center gap-0.5"
                            title="Abrir en Google Calendar"
                          >
                            <span>Abrir GCal</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
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
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportTaskToGoogleCalendar(t);
                          }}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                          title="Agendar en Google Calendar"
                        >
                          + GCal
                        </button>
                        <ProgramBadge programId={t.programId} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenQuickCreate('meeting')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs mt-2"
          >
            + Agendar Reunión / Evento con Zoom o Google Meet
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Deleting Meeting */}
      <ConfirmDialog
        isOpen={!!meetingToDelete}
        title="¿Eliminar reunión del calendario?"
        message={`¿Estás seguro de que deseas eliminar la reunión "${meetingToDelete?.title}"? Esta acción removerá el evento de la agenda y del calendario.`}
        confirmLabel="Eliminar reunión"
        cancelLabel="Cancelar"
        isDestructive={true}
        requireOkInput={true}
        onConfirm={() => {
          if (meetingToDelete) {
            deleteMeeting(meetingToDelete.id);
            showToast(`Reunión "${meetingToDelete.title}" eliminada`, 'warning');
            setMeetingToDelete(null);
          }
        }}
        onCancel={() => setMeetingToDelete(null)}
      />

      {/* Modal for Editing Meeting directly from Calendar */}
      {editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Editar Reunión / Evento
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Modifica los detalles y sincronización del evento agendado
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMeeting(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título de la Reunión *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="ej. Comité Técnico de Cuidados Paliativos"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Program and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Programa de Salud
                  </label>
                  <select
                    value={editFormData.programId}
                    onChange={(e) => setEditFormData({ ...editFormData, programId: e.target.value as ProgramId })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="programada">Programada</option>
                    <option value="en_curso">En curso</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Location & Video Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lugar Presencial / Sala
                  </label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    placeholder="ej. Sala DISAM / CESFAM"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enlace Meet / Zoom
                  </label>
                  <input
                    type="url"
                    value={editFormData.meetingLink}
                    onChange={(e) => setEditFormData({ ...editFormData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Participantes (separados por coma)
                </label>
                <input
                  type="text"
                  value={editFormData.participantsStr}
                  onChange={(e) => setEditFormData({ ...editFormData, participantsStr: e.target.value })}
                  placeholder="ej. Dr. Klaus Bauer, Dra. Vidal, Enfermera Supervisora"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción / Temario de la Reunión
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Puntos a tratar, objetivos o tabla de la reunión..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingMeeting;
                    setEditingMeeting(null);
                    setMeetingToDelete(toDel);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Eliminar reunión</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMeeting(null)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for Configuring Google Account */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <CalendarCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Vincular Cuenta de Google Calendar
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Define la cuenta con la que se sincronizará el calendario
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputGCalEmail.trim()) {
                  updateGoogleCalendarAccount(inputGCalEmail.trim());
                  connectGoogleCalendar(inputGCalEmail.trim());
                  setIsAccountModalOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo Electrónico de Google / Workspace
                </label>
                <input
                  type="email"
                  required
                  value={inputGCalEmail}
                  onChange={(e) => setInputGCalEmail(e.target.value)}
                  placeholder="ej. klaus.bauer@quilicurasalud.cl"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              {/* Suggestions / Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Cuentas sugeridas de Quilicura Salud:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'klaus.bauer@quilicurasalud.cl',
                    'direccion@quilicurasalud.cl',
                    'salud.quilicura@gmail.com',
                    'contacto@quilicurasalud.cl',
                  ].map((emailSuggestion) => (
                    <button
                      key={emailSuggestion}
                      type="button"
                      onClick={() => setInputGCalEmail(emailSuggestion)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        inputGCalEmail === emailSuggestion
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {emailSuggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                Todas las reuniones, comités y eventos que agendes o modifiques se sincronizarán directamente con la agenda de esta cuenta de Google Calendar.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Guardar y Vincular</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

