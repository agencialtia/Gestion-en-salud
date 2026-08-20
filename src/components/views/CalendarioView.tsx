import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  CheckSquare,
  Sparkles,
  Filter,
  Plus
} from 'lucide-react';
import { ProgramBadge } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';
import { formatDate } from '../../utils/dateUtils';

export const CalendarioView: React.FC<{
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: () => void;
}> = ({ onOpenEntity, onOpenQuickCreate }) => {
  const { tasks, meetings, programs } = useApp();

  const [selectedProgram, setSelectedProgram] = useState<ProgramId | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState('2026-08-15');

  // August 2026 calendar days
  const daysInAugust = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-08-${dayNum.toString().padStart(2, '0')}`;
    return dateStr;
  });

  // Filter items
  const filteredTasks = tasks.filter((t) => {
    if (t.archived) return false;
    if (selectedProgram !== 'all' && t.programId !== selectedProgram) return false;
    return true;
  });

  const filteredMeetings = meetings.filter((m) => {
    if (m.archived) return false;
    if (selectedProgram !== 'all' && m.programId !== selectedProgram) return false;
    return true;
  });

  // Selected date items
  const dayMeetings = filteredMeetings.filter((m) => m.dateTime.startsWith(selectedDate));
  const dayTasks = filteredTasks.filter((t) => t.dueDate === selectedDate);

  return (
    <div id="view-calendario" className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Calendario Operativo & Hitos
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Agosto 2026 — Vencimientos, comités técnicos y reuniones de salud Quilicura
          </p>
        </div>

        <button
          onClick={onOpenQuickCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Agendar Evento</span>
        </button>
      </div>

      {/* Program filter (Responsive wrap without horizontal scroll) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Filter className="h-3.5 w-3.5" /> Filtrar:
        </span>
        <button
          onClick={() => setSelectedProgram('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedProgram === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({programs.length})
        </button>
        {programs.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProgram(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedProgram === p.id
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Agosto 2026</h3>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
              Hoy es 15 de Agosto (Simulado)
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 border-b border-slate-100 pb-2">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty days for offset (August 1 2026 starts on Saturday = index 5) */}
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 rounded-xl bg-slate-50/50" />
            ))}

            {daysInAugust.map((dateStr) => {
              const dayNumber = parseInt(dateStr.split('-')[2], 10);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === '2026-08-15';

              const dayMCount = filteredMeetings.filter((m) => m.dateTime.startsWith(dateStr)).length;
              const dayTCount = filteredTasks.filter((t) => t.dueDate === dateStr).length;
              const totalEvents = dayMCount + dayTCount;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-16 p-1.5 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                      : isToday
                      ? 'border-indigo-300 bg-indigo-50/20'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                          : isSelected
                          ? 'text-indigo-900'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNumber}
                    </span>
                    {totalEvents > 0 && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1 rounded">
                        {totalEvents}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {dayMCount > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" title={`${dayMCount} reunión(es)`} />
                    )}
                    {dayTCount > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title={`${dayTCount} tarea(s)`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Agenda del Día
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {formatDate(selectedDate)} {selectedDate === '2026-08-15' && '(Hoy)'}
              </h3>
            </div>

            {/* Meetings of selected day */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-600" />
                Reuniones ({dayMeetings.length})
              </span>
              {dayMeetings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay reuniones para esta fecha.</p>
              ) : (
                dayMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onOpenEntity('meeting', m.id)}
                    className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 cursor-pointer text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950">{m.title}</span>
                      <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded">
                        {m.dateTime.substring(11, 16)} hrs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Lugar: {m.location}</p>
                    <ProgramBadge programId={m.programId} />
                  </div>
                ))
              )}
            </div>

            {/* Tasks due on selected day */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-amber-600" />
                Vencimiento de Tareas ({dayTasks.length})
              </span>
              {dayTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay tareas que venzan esta fecha.</p>
              ) : (
                dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onOpenEntity('task', t.id)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{t.title}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Resp: {t.responsible}</span>
                      <ProgramBadge programId={t.programId} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={onOpenQuickCreate}
            className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            + Crear tarea o reunión en esta fecha
          </button>
        </div>
      </div>
    </div>
  );
};
