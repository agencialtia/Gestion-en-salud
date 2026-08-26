import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Meeting, 
  MeetingType, 
  MeetingStatus, 
  MeetingCommitment, 
  CommitmentStatus,
  ProgramId, 
  isCommitmentOverdue,
  getMeetingTypeLabel,
  getMeetingStatusLabel,
} from '../../types';
import { 
  MeetingTypeBadge, 
  MeetingStatusBadge, 
  MeetingStatusChip,
  CommitmentStatusChip, 
  OverdueBadge, 
  PriorityChip, 
  TaskUrgencyChip, 
  ProgramBadge, 
  ProgressBar 
} from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';
import { formatDate } from '../../utils/dateUtils';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  CheckSquare, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  Building2, 
  ArrowRight,
  ListOrdered,
  ListFilter,
  Check,
  CalendarCheck,
  FileSignature,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ReunionesGlobalesViewProps {
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: () => void;
}

export const ReunionesGlobalesView: React.FC<ReunionesGlobalesViewProps> = ({
  onOpenEntity,
  onOpenQuickCreate,
}) => {
  const { 
    meetings, 
    programs, 
    tasks, 
    toggleMeetingCommitmentStatus,
    convertCommitmentToTask,
    quickUpdateTaskStatus,
    updateMeeting,
    deleteMeeting,
    deleteMeetingCommitment,
    showToast,
    setSelectedProgramId,
    setActiveView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'instancias' | 'compromisos'>('instancias');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  // Deletion confirmation states with OK requirement
  const [meetingToDelete, setMeetingToDelete] = useState<{ id: string; title: string } | null>(null);
  const [commitmentToDelete, setCommitmentToDelete] = useState<{ meetingId: string; commitmentId: string; description: string } | null>(null);

  // Active unarchived meetings
  const activeMeetings = useMemo(() => {
    return meetings.filter((m) => !m.archived);
  }, [meetings]);

  // Extract all commitments across all meetings
  const allCommitments = useMemo(() => {
    const list: { commitment: MeetingCommitment; meeting: Meeting }[] = [];
    activeMeetings.forEach((m) => {
      (m.commitments || []).forEach((c) => {
        list.push({ commitment: c, meeting: m });
      });
    });
    return list;
  }, [activeMeetings]);

  // KPIs Calculations
  const stats = useMemo(() => {
    const totalMeetings = activeMeetings.length;
    const programadasCount = activeMeetings.filter((m) => m.status === 'programada').length;
    const finalizadasCount = activeMeetings.filter((m) => m.status === 'finalizada' || !m.status).length;
    
    let totalAgreements = 0;
    activeMeetings.forEach((m) => {
      if (Array.isArray(m.agreements)) {
        totalAgreements += m.agreements.length;
      } else if (m.agreements && typeof m.agreements === 'string') {
        totalAgreements += 1;
      }
    });

    const totalComs = allCommitments.length;
    const cumplidosCount = allCommitments.filter(
      (item) => item.commitment.status === 'cumplido' || item.commitment.status === 'completado'
    ).length;
    const enCursoCount = allCommitments.filter((item) => item.commitment.status === 'en_curso').length;
    const pendientesCount = allCommitments.filter((item) => item.commitment.status === 'pendiente').length;
    
    const overdueCount = allCommitments.filter((item) => isCommitmentOverdue(item.commitment)).length;
    const complianceRate = totalComs > 0 ? (cumplidosCount / totalComs) * 100 : 100;

    return {
      totalMeetings,
      programadasCount,
      finalizadasCount,
      totalAgreements,
      totalComs,
      cumplidosCount,
      enCursoCount,
      pendientesCount,
      overdueCount,
      complianceRate,
    };
  }, [activeMeetings, allCommitments]);

  // Filtered Meetings
  const filteredMeetings = useMemo(() => {
    return activeMeetings.filter((m) => {
      if (selectedProgram !== 'all' && m.programId !== selectedProgram) return false;
      if (selectedType !== 'all' && m.type !== selectedType) return false;
      if (selectedStatus !== 'all') {
        const mStatus = m.status || 'finalizada';
        if (mStatus !== selectedStatus) return false;
      }

      if (onlyOverdue) {
        const hasOverdue = (m.commitments || []).some((c) => isCommitmentOverdue(c));
        if (!hasOverdue) return false;
      }

      if (onlyUrgent) {
        const hasUrgent = (m.commitments || []).some((c) => c.isUrgent || c.priority === 'critica');
        if (!hasUrgent) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = m.title.toLowerCase().includes(query);
        const inObj = (m.objective || '').toLowerCase().includes(query);
        const inLoc = (m.location || '').toLowerCase().includes(query);
        const inNotes = (m.notes || '').toLowerCase().includes(query);
        const inParticipants = (m.participants || []).some((p) => {
          const name = typeof p === 'string' ? p : p.name;
          return name.toLowerCase().includes(query);
        });
        const inCommitments = (m.commitments || []).some(
          (c) => c.description.toLowerCase().includes(query) || c.responsible.toLowerCase().includes(query)
        );
        const inAgreements = Array.isArray(m.agreements)
          ? m.agreements.some((a) => a.description.toLowerCase().includes(query))
          : (m.agreements || '').toLowerCase().includes(query);

        if (!inTitle && !inObj && !inLoc && !inNotes && !inParticipants && !inCommitments && !inAgreements) {
          return false;
        }
      }

      return true;
    });
  }, [activeMeetings, selectedProgram, selectedType, selectedStatus, onlyOverdue, onlyUrgent, searchQuery]);

  // Filtered Commitments
  const filteredCommitments = useMemo(() => {
    return allCommitments.filter(({ commitment, meeting }) => {
      if (selectedProgram !== 'all' && meeting.programId !== selectedProgram) return false;
      if (selectedType !== 'all' && meeting.type !== selectedType) return false;
      if (selectedStatus !== 'all') {
        const normalized = commitment.status === 'completado' ? 'cumplido' : commitment.status;
        if (normalized !== selectedStatus) return false;
      }

      if (onlyOverdue && !isCommitmentOverdue(commitment)) return false;
      if (onlyUrgent && !(commitment.isUrgent || commitment.priority === 'critica')) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inDesc = commitment.description.toLowerCase().includes(query);
        const inResp = commitment.responsible.toLowerCase().includes(query);
        const inMeet = meeting.title.toLowerCase().includes(query);
        if (!inDesc && !inResp && !inMeet) return false;
      }

      return true;
    });
  }, [allCommitments, selectedProgram, selectedType, selectedStatus, onlyOverdue, onlyUrgent, searchQuery]);

  return (
    <div id="reuniones-globales-view" className="space-y-6 animate-fadeIn pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Reuniones, Comités y Compromisos
              </h1>
              <p className="text-xs text-slate-500">
                Cadena rectora: <span className="font-semibold text-indigo-700">Instancia → Acuerdo → Compromiso → Tarea</span> con sincronización en tiempo real.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedProgramId(null);
              setActiveView('dashboard');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Volver al Dashboard"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Volver</span>
          </button>
          <button
            id="btn-nueva-reunion"
            onClick={onOpenQuickCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {/* Total Instancias */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Instancias</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.totalMeetings}</span>
            <span className="text-2xs text-slate-500">
              ({stats.programadasCount} agendadas)
            </span>
          </div>
          <div className="text-2xs text-slate-400 mt-1">Comités, Reuniones y Cap.</div>
        </div>

        {/* Acuerdos Tomados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Acuerdos Formales</span>
            <FileSignature className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.totalAgreements}</span>
            <span className="text-2xs text-purple-600 font-medium">registrados</span>
          </div>
          <div className="text-2xs text-slate-400 mt-1">Definiciones de red</div>
        </div>

        {/* Compromisos Activos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Compromisos</span>
            <CheckSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.totalComs}</span>
            <span className="text-2xs text-blue-600 font-semibold">
              ({stats.pendientesCount + stats.enCursoCount} activos)
            </span>
          </div>
          <div className="text-2xs text-slate-400 mt-1">En curso o por hacer</div>
        </div>

        {/* Compromisos Vencidos */}
        <div className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
          stats.overdueCount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Vencidos (Calculados)</span>
            <AlertCircle className={`w-4 h-4 ${stats.overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${stats.overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {stats.overdueCount}
            </span>
            {stats.overdueCount > 0 && (
              <span className="text-2xs px-1.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">
                Atención
              </span>
            )}
          </div>
          <div className="text-2xs text-slate-500 mt-1">Plazo expirado sin cumplir</div>
        </div>

        {/* Tasa de Cumplimiento */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Cumplimiento</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900">{stats.complianceRate.toFixed(0)}%</span>
              <span className="text-2xs text-slate-500">{stats.cumplidosCount} de {stats.totalComs}</span>
            </div>
            <ProgressBar value={stats.complianceRate} size="sm" colorScheme="auto" />
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Main View Mode Tabs */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            <button
              id="tab-instancias"
              onClick={() => setActiveTab('instancias')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'instancias'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Instancias y Minutas ({filteredMeetings.length})</span>
            </button>
            <button
              id="tab-compromisos"
              onClick={() => setActiveTab('compromisos')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'compromisos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Matriz de Compromisos ({filteredCommitments.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="reuniones-search-input"
              type="text"
              placeholder="Buscar por título, acuerdo, responsable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Program filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Programa:</span>
            <select
              id="filter-reuniones-program"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Todos los Programas</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Tipo:</span>
            <select
              id="filter-reuniones-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Todos los Tipos</option>
              <option value="reunion">Reunión</option>
              <option value="comite">Comité Técnico</option>
              <option value="capacitacion">Capacitación</option>
              <option value="consultoria">Consultoría / Asesoría</option>
              <option value="coordinacion">Coordinación Intersectorial</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Estado:</span>
            <select
              id="filter-reuniones-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Todos los Estados</option>
              {activeTab === 'instancias' ? (
                <>
                  <option value="programada">Programada</option>
                  <option value="en_curso">En curso</option>
                  <option value="finalizada">Finalizada</option>
                  <option value="cancelada">Cancelada</option>
                </>
              ) : (
                <>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_curso">En curso</option>
                  <option value="cumplido">Cumplido</option>
                  <option value="cancelado">Cancelado</option>
                </>
              )}
            </select>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              id="filter-toggle-overdue"
              onClick={() => setOnlyOverdue(!onlyOverdue)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                onlyOverdue
                  ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Solo Vencidos</span>
            </button>

            <button
              id="filter-toggle-urgent"
              onClick={() => setOnlyUrgent(!onlyUrgent)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                onlyUrgent
                  ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Solo Urgentes</span>
            </button>

            {(selectedProgram !== 'all' || selectedType !== 'all' || selectedStatus !== 'all' || onlyOverdue || onlyUrgent || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedProgram('all');
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setOnlyOverdue(false);
                  setOnlyUrgent(false);
                  setSearchQuery('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab 1: Instancias List */}
      {activeTab === 'instancias' && (
        <div className="space-y-4">
          {filteredMeetings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No se encontraron instancias</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No hay reuniones o comités que coincidan con los criterios seleccionados. Prueba modificando los filtros o registra una nueva instancia.
              </p>
              <button
                onClick={onOpenQuickCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nueva Reunión</span>
              </button>
            </div>
          ) : (
            filteredMeetings.map((meeting) => {
              const agreementsList = Array.isArray(meeting.agreements)
                ? meeting.agreements
                : meeting.agreements
                ? [{ id: 'agr_single', meetingId: meeting.id, description: meeting.agreements }]
                : [];
              const commitmentsList = meeting.commitments || [];
              const overdueInMeeting = commitmentsList.filter((c) => isCommitmentOverdue(c)).length;
              const completedInMeeting = commitmentsList.filter(
                (c) => c.status === 'cumplido' || c.status === 'completado'
              ).length;
              const isClosed = meeting.status === 'finalizada' || meeting.status === 'completado' || meeting.status === 'cerrado';

              return (
                <div
                  key={meeting.id}
                  id={`meeting-card-${meeting.id}`}
                  onClick={() => onOpenEntity('meeting', meeting.id)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <MeetingStatusChip
                          status={meeting.status}
                          onChange={(newStatus) => updateMeeting(meeting.id, { status: newStatus })}
                        />
                        <ProgramBadge programId={meeting.programId as ProgramId} />
                        {overdueInMeeting > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertCircle className="w-3 h-3" />
                            {overdueInMeeting} compromiso{overdueInMeeting > 1 ? 's' : ''} vencido{overdueInMeeting > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {meeting.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(meeting.dateTime)}
                        </span>
                        {meeting.location && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {meeting.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {(meeting.participants || []).length} participante{(meeting.participants || []).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMeetingToDelete({ id: meeting.id, title: meeting.title });
                        }}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-2xs"
                        title="Eliminar instancia"
                        aria-label="Eliminar reunión"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Ver detalle <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Objective & Notes Snippet */}
                  {meeting.objective && (
                    <div className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-800">Objetivo: </span>
                      {meeting.objective}
                    </div>
                  )}

                  {/* Acuerdos and Compromisos Grid Preview (Solo cuando la reunión está cerrada) */}
                  {isClosed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                      {/* Acuerdos tomados */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <FileSignature className="w-3.5 h-3.5 text-purple-600" />
                          <span>Acuerdos Tomados ({agreementsList.length})</span>
                        </div>
                        {agreementsList.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Sin acuerdos formales registrados.</p>
                        ) : (
                          <ul className="space-y-1">
                            {agreementsList.slice(0, 2).map((agr, idx) => (
                              <li key={agr.id || idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                <span className="line-clamp-2">{agr.description}</span>
                              </li>
                            ))}
                            {agreementsList.length > 2 && (
                              <p className="text-2xs font-semibold text-purple-700 pl-3">
                                + {agreementsList.length - 2} acuerdo{agreementsList.length - 2 > 1 ? 's' : ''} más
                              </p>
                            )}
                          </ul>
                        )}
                      </div>

                      {/* Compromisos */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span>Compromisos Asignados ({commitmentsList.length})</span>
                          </div>
                          {commitmentsList.length > 0 && (
                            <span className="text-2xs text-slate-500 font-medium">
                              {completedInMeeting}/{commitmentsList.length} cumplidos
                            </span>
                          )}
                        </div>

                        {commitmentsList.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Sin compromisos asignados.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {commitmentsList.slice(0, 2).map((com) => {
                              const isOverdue = isCommitmentOverdue(com);
                              return (
                                <div
                                  key={com.id}
                                  className="flex items-center justify-between gap-2 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <button
                                      onClick={() => toggleMeetingCommitmentStatus(meeting.id, com.id)}
                                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                        com.status === 'cumplido' || com.status === 'completado'
                                          ? 'bg-emerald-600 border-emerald-600 text-white'
                                          : 'bg-white border-slate-300 hover:border-indigo-500'
                                      }`}
                                      title="Marcar como cumplido / pendiente"
                                    >
                                      {(com.status === 'cumplido' || com.status === 'completado') && <Check className="w-3 h-3 stroke-[3]" />}
                                    </button>
                                    <span className={`truncate font-medium ${
                                      com.status === 'cumplido' || com.status === 'completado'
                                        ? 'line-through text-slate-400'
                                        : 'text-slate-800'
                                    }`}>
                                      {com.description}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isOverdue && <OverdueBadge />}
                                    <span className="text-2xs text-slate-500 font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                      {com.responsible.split(' ')[0]} • {com.deadline.substring(5)}
                                    </span>
                                    {com.taskId ? (
                                      <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Tarea sincronizada">
                                        ✓ Tarea
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => convertCommitmentToTask(meeting.id, com.id)}
                                        className="text-2xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline px-1 py-0.5"
                                        title="Convertir a tarea operativa"
                                      >
                                        + Tarea
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {commitmentsList.length > 2 && (
                              <p className="text-2xs font-semibold text-blue-700 pl-1">
                                + {commitmentsList.length - 2} compromiso{commitmentsList.length - 2 > 1 ? 's' : ''} más
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Consolidated Commitments Matrix */}
      {activeTab === 'compromisos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Matriz Transversal de Compromisos
              </h3>
              <p className="text-xs text-slate-500">
                Supervisión directa y sincronización en tiempo real con las tareas de la aplicación.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {filteredCommitments.length} compromiso{filteredCommitments.length !== 1 ? 's' : ''} listado{filteredCommitments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredCommitments.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No hay compromisos con los filtros aplicados</h4>
              <p className="text-xs text-slate-500">Ajusta los filtros para visualizar los compromisos derivados de reuniones y comités.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCommitments.map(({ commitment, meeting }) => {
                const isOverdue = isCommitmentOverdue(commitment);
                const hasTask = Boolean(commitment.taskId);
                const linkedTask = hasTask ? tasks.find((t) => t.id === commitment.taskId) : null;

                return (
                  <div
                    key={commitment.id}
                    id={`commitment-row-${commitment.id}`}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                  >
                    {/* Left: Checkbox + Description + Meta */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        id={`btn-check-com-${commitment.id}`}
                        onClick={() => toggleMeetingCommitmentStatus(meeting.id, commitment.id)}
                        className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center border transition-all ${
                          commitment.status === 'cumplido' || commitment.status === 'completado'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                            : 'bg-white border-slate-300 hover:border-indigo-500'
                        }`}
                        title="Marcar cumplido / pendiente"
                      >
                        {(commitment.status === 'cumplido' || commitment.status === 'completado') && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PriorityChip priority={commitment.priority} />
                          {commitment.isUrgent && (
                            <span className="px-1.5 py-0.5 text-2xs font-bold bg-rose-100 text-rose-800 rounded border border-rose-200">
                              URGENTE
                            </span>
                          )}
                          {isOverdue && <OverdueBadge />}
                          <ProgramBadge programId={meeting.programId as ProgramId} />
                          <span
                            onClick={() => onOpenEntity('meeting', meeting.id)}
                            className="text-2xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            Sesión: {meeting.title}
                          </span>
                        </div>

                        <p className={`text-sm font-semibold ${
                          commitment.status === 'cumplido' || commitment.status === 'completado'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}>
                          {commitment.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>
                            Responsable: <strong className="text-slate-700">{commitment.responsible}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Plazo: <strong className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>{commitment.deadline}</strong>
                          </span>
                          {commitment.completedAt && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-medium">
                                Cumplido el: {commitment.completedAt.substring(0, 10)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status selector & Task synchronization */}
                    <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                      {/* Commitment Status Chip */}
                      <CommitmentStatusChip
                        status={commitment.status}
                        onChange={(newSt) => toggleMeetingCommitmentStatus(meeting.id, commitment.id, newSt)}
                      />

                      {/* Linked Task Action */}
                      {hasTask ? (
                        <button
                          onClick={() => onOpenEntity('task', commitment.taskId!)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-300 transition-all"
                          title="Ver tarea sincronizada en tiempo real"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tarea Sincronizada</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                        </button>
                      ) : (
                        <button
                          id={`btn-convert-task-${commitment.id}`}
                          onClick={() => convertCommitmentToTask(meeting.id, commitment.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-all active:scale-95"
                          title="Transformar este compromiso en una Tarea oficial"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Crear Tarea</span>
                        </button>
                      )}
                      {/* Delete Commitment Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setCommitmentToDelete({
                            meetingId: meeting.id,
                            commitmentId: commitment.id,
                            description: commitment.description,
                          })
                        }
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                        title="Eliminar compromiso"
                        aria-label="Eliminar compromiso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirm Dialog for deleting a Commitment with OK verification */}
      <ConfirmDialog
        isOpen={!!commitmentToDelete}
        title="¿Confirmas que deseas eliminar este compromiso?"
        message={`Esta acción eliminará el compromiso "${commitmentToDelete?.description || ''}" de la reunión.`}
        confirmLabel="Eliminar Compromiso"
        cancelLabel="Cancelar"
        isDestructive={true}
        requireOkInput={true}
        onConfirm={() => {
          if (commitmentToDelete) {
            deleteMeetingCommitment(commitmentToDelete.meetingId, commitmentToDelete.commitmentId);
            setCommitmentToDelete(null);
          }
        }}
        onCancel={() => setCommitmentToDelete(null)}
      />

      {/* Confirm Dialog for deleting a Meeting with OK verification */}
      <ConfirmDialog
        isOpen={!!meetingToDelete}
        title="¿Confirmas que deseas eliminar esta reunión/comité?"
        message={`Esta acción eliminará la sesión "${meetingToDelete?.title || ''}", junto con todos sus acuerdos y compromisos asociados.`}
        confirmLabel="Eliminar Reunión"
        cancelLabel="Cancelar"
        isDestructive={true}
        requireOkInput={true}
        onConfirm={() => {
          if (meetingToDelete) {
            deleteMeeting(meetingToDelete.id);
            setMeetingToDelete(null);
          }
        }}
        onCancel={() => setMeetingToDelete(null)}
      />
    </div>
  );
};
