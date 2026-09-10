import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Question,
  QuestionStatus,
  QuestionCategory,
  PriorityLevel,
  ProgramId,
  QuestionFollowUpType,
  getQuestionStatusLabel,
  getQuestionCategoryLabel,
  isQuestionOverdue,
  isQuestionDueToday,
} from '../../types';
import {
  QuestionCategoryBadge,
  QuestionStatusChip,
  QuestionOverdueBadge,
  ProgramBadge,
  PriorityChip,
  TaskUrgencyChip,
} from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';
import { formatDate } from '../../utils/dateUtils';
import {
  HelpCircle,
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  FileText,
  Trash2,
  Sparkles,
  Paperclip,
  CheckSquare,
  CalendarCheck,
  Send,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ListFilter,
  Table as TableIcon,
  ShieldCheck,
  XCircle,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PreguntasViewProps {
  programId?: ProgramId; // If provided, limits to this program (for ProgramDetailView tab)
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: (tab?: 'question') => void;
  onDeleteRequest?: (type: DrawerEntityType, id: string) => void;
}

export const PreguntasView: React.FC<PreguntasViewProps> = ({
  programId,
  onOpenEntity,
  onOpenQuickCreate,
  onDeleteRequest,
}) => {
  const {
    questions,
    programs,
    tasks,
    meetings,
    currentUser,
    updateQuestion,
    deleteQuestion,
    addQuestionFollowUp,
    deleteQuestionFollowUp,
    convertQuestionToTask,
    resolveQuestion,
    closeQuestionWithoutAnswer,
    toggleQuestionForNextMeeting,
    saveQuestionAsKnowledge,
    showToast,
  } = useApp();

  const todayStr = '2026-08-15';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'pendientes' | 'en_consulta' | 'esperando_respuesta' | 'resueltas'>('todas');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>(programId || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [onlyForMeeting, setOnlyForMeeting] = useState(false);
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [viewLayout, setViewLayout] = useState<'cards' | 'table'>('cards');

  // Expanded follow-up logs
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  // Quick Follow-up Modal / Popover State
  const [followUpTargetQ, setFollowUpTargetQ] = useState<Question | null>(null);
  const [followUpNote, setFollowUpNote] = useState('');
  const [followUpType, setFollowUpType] = useState<QuestionFollowUpType>('reiteracion');

  // Quick Resolve Modal State
  const [resolveTargetQ, setResolveTargetQ] = useState<Question | null>(null);
  const [finalAnswerText, setFinalAnswerText] = useState('');
  const [sourceOfResponseText, setSourceOfResponseText] = useState('Servicio de Salud Metropolitano Norte (SSMN)');

  // Quick Close without answer Modal State
  const [closeTargetQ, setCloseTargetQ] = useState<Question | null>(null);
  const [closeReasonText, setCloseReasonText] = useState('');

  // Delete Safety Confirm State
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // Active Questions List
  const activeQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (q.archived) return false;
      if (programId && q.programId !== programId) return false;
      return true;
    });
  }, [questions, programId]);

  // Operational KPIs for the segmented tabs: Pendientes, En consulta, Esperando respuesta, Resueltas
  const stats = useMemo(() => {
    const total = activeQuestions.length;
    const pendientes = activeQuestions.filter((q) => q.status === 'abierta' || q.status === 'pendiente').length;
    const enConsulta = activeQuestions.filter((q) => q.status === 'en_consulta').length;
    const esperandoRespuesta = activeQuestions.filter((q) => q.status === 'esperando_respuesta').length;
    const resueltas = activeQuestions.filter((q) => q.status === 'resuelta' || q.status === 'cerrada_sin_respuesta').length;

    return {
      total,
      pendientes,
      enConsulta,
      esperandoRespuesta,
      resueltas,
    };
  }, [activeQuestions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return activeQuestions.filter((q) => {
      // Program filter (if not locked by prop)
      if (!programId && programFilter !== 'all' && q.programId !== programFilter) return false;

      // Status filter matching the segmented tabs
      if (statusFilter === 'pendientes' && q.status !== 'abierta' && q.status !== 'pendiente') return false;
      if (statusFilter === 'en_consulta' && q.status !== 'en_consulta') return false;
      if (statusFilter === 'esperando_respuesta' && q.status !== 'esperando_respuesta') return false;
      if (statusFilter === 'resueltas' && q.status !== 'resuelta' && q.status !== 'cerrada_sin_respuesta') return false;

      // Category filter
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && q.priority !== priorityFilter) return false;

      // Urgent filter
      if (onlyUrgent && !q.isUrgent && q.priority !== 'critica') return false;

      // Next meeting filter
      if (onlyForMeeting && !q.forNextMeeting) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuestion = q.question.toLowerCase().includes(query);
        const matchesContext = q.context.toLowerCase().includes(query);
        const matchesResp = (q.responsible || '').toLowerCase().includes(query);
        const matchesNextInst = (q.nextInstance || '').toLowerCase().includes(query);
        const matchesAnswer = (q.finalAnswer || '').toLowerCase().includes(query);
        const matchesSource = (q.sourceOfResponse || '').toLowerCase().includes(query);
        if (!matchesQuestion && !matchesContext && !matchesResp && !matchesNextInst && !matchesAnswer && !matchesSource) {
          return false;
        }
      }

      return true;
    });
  }, [activeQuestions, programId, programFilter, statusFilter, categoryFilter, priorityFilter, onlyUrgent, onlyForMeeting, searchQuery]);

  const toggleLogExpand = (qId: string) => {
    setExpandedLogs((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleOpenFollowUpModal = (q: Question) => {
    setFollowUpTargetQ(q);
    setFollowUpNote('');
    setFollowUpType('consulta_enviada');
  };

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpTargetQ || !followUpNote.trim()) return;

    addQuestionFollowUp(followUpTargetQ.id, {
      type: followUpType,
      note: followUpNote.trim(),
    });

    setFollowUpTargetQ(null);
    setFollowUpNote('');
  };

  const handleOpenResolveModal = (q: Question) => {
    setResolveTargetQ(q);
    setFinalAnswerText(q.finalAnswer || '');
    setSourceOfResponseText(q.sourceOfResponse || 'Servicio de Salud Metropolitano Norte (SSMN)');
  };

  const handleSaveResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTargetQ || !finalAnswerText.trim()) return;

    resolveQuestion(resolveTargetQ.id, finalAnswerText.trim(), sourceOfResponseText.trim());
    setResolveTargetQ(null);
    setFinalAnswerText('');
  };

  const handleOpenCloseModal = (q: Question) => {
    setCloseTargetQ(q);
    setCloseReasonText('');
  };

  const handleSaveClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closeTargetQ) return;

    closeQuestionWithoutAnswer(closeTargetQ.id, closeReasonText.trim());
    setCloseTargetQ(null);
    setCloseReasonText('');
  };

  const handleDeleteWithCheck = (q: Question) => {
    if (onDeleteRequest) {
      onDeleteRequest('question', q.id);
    } else {
      setQuestionToDelete(q);
    }
  };

  const handleConfirmDelete = () => {
    if (questionToDelete) {
      deleteQuestion(questionToDelete.id);
      setQuestionToDelete(null);
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* 1. TOP BAR WITH 6 SEGMENTED TABS & SEARCH / ACTION (EXACT DESIGN AS IMAGE 2) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-fit flex-wrap">
          {/* Todos */}
          <button
            type="button"
            onClick={() => setStatusFilter('todas')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'todas'
                ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {stats.total}
            </span>
          </button>

          {/* Pendientes */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'pendientes' ? 'todas' : 'pendientes')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'pendientes'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Pendientes</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {stats.pendientes}
            </span>
          </button>

          {/* En consulta */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'en_consulta' ? 'todas' : 'en_consulta')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'en_consulta'
                ? 'bg-white text-blue-900 shadow-xs border border-blue-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Send className="h-3.5 w-3.5 text-blue-600" />
            <span>En consulta</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {stats.enConsulta}
            </span>
          </button>

          {/* Esperando respuesta */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'esperando_respuesta' ? 'todas' : 'esperando_respuesta')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'esperando_respuesta'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-300 ring-1 ring-amber-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Esperando respuesta</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {stats.esperandoRespuesta}
            </span>
          </button>

          {/* Resueltas */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'resueltas' ? 'todas' : 'resueltas')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'resueltas'
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-300 ring-1 ring-emerald-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Resueltas</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {stats.resueltas}
            </span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {!programId && (
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Todos los programas</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar duda o responsable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 sm:w-60 pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenQuickCreate('question')}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* Results Count & Empty States */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200 space-y-3">
          <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No se encontraron consultas con los filtros seleccionados</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Prueba ajustando los filtros de búsqueda o registra una nueva duda o consulta para seguimiento proactivo.
          </p>
          <button
            onClick={() => onOpenQuickCreate('question')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Registrar Nueva Consulta
          </button>
        </div>
      ) : viewLayout === 'cards' ? (
        /* Full-width Compact List Cards */
        <div className="space-y-2.5 w-full">
          {filteredQuestions.map((q) => {
            const isOverdue = isQuestionOverdue(q, todayStr);
            const isToday = isQuestionDueToday(q, todayStr);
            const isResolved = q.status === 'resuelta';
            const isClosedNoAns = q.status === 'cerrada_sin_respuesta';
            const linkedTask = q.taskId ? tasks.find((t) => t.id === q.taskId) : undefined;
            const isLogsOpen = Boolean(expandedLogs[q.id]);
            const recentFollowUps = q.followUps || [];

            return (
              <div
                key={q.id}
                className={`w-full rounded-2xl border bg-white p-3.5 sm:p-4 transition-all shadow-xs ${
                  isOverdue
                    ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/10'
                    : isToday
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : isResolved
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top Bar: Program, Category & Urgency (Left) + Status & Actions (Right) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {!programId && <ProgramBadge programId={q.programId} size="sm" />}
                      <QuestionCategoryBadge category={q.category} />
                      <TaskUrgencyChip
                        isUrgent={Boolean(q.isUrgent)}
                        onChange={(isUrgent) => updateQuestion(q.id, { isUrgent })}
                      />
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                      <QuestionStatusChip
                        status={q.status}
                        onChange={(newStatus) => updateQuestion(q.id, { status: newStatus })}
                      />
                      {/* Overdue / Due Today Badge + Edit / Delete / Resolve buttons directly under Esperando respuesta */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <QuestionOverdueBadge followUpDate={q.followUpDate} status={q.status} currentDate={todayStr} />
                        <div className="flex items-center gap-1">
                          {!isResolved && (
                            <button
                              type="button"
                              onClick={() => handleOpenResolveModal(q)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                              title="Registrar respuesta oficial y resolver"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Resolver</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenEntity('question', q.id)}
                            className="p-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-2xs cursor-pointer"
                            title="Ver detalle completo / Editar"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWithCheck(q)}
                            className="p-1 rounded-lg border border-rose-200 bg-rose-50/60 text-rose-600 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-2xs cursor-pointer"
                            title="Eliminar consulta"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <h3
                      className="text-sm font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors cursor-pointer"
                      onClick={() => onOpenEntity('question', q.id)}
                    >
                      {q.question}
                    </h3>
                  </div>

                  {/* Operational Attributes: Dirigida a & Instancia */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Dirigida a:</span>
                      <span className="font-medium text-slate-800">{q.responsible || 'Sin asignar'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Instancia:</span>
                      <span className="font-medium text-indigo-700 truncate max-w-sm" title={q.nextInstance}>
                        {q.nextInstance || 'Por definir'}
                      </span>
                    </div>
                  </div>

                  {/* Final Answer Banner if Resolved */}
                  {isResolved && q.finalAnswer && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-800">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Respuesta / Orientación Oficial:
                        </span>
                        {q.resolvedDate && (
                          <span className="text-[10px] text-emerald-700 font-normal">
                            {formatDate(q.resolvedDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-950 leading-relaxed font-medium">
                        "{q.finalAnswer}"
                      </p>
                      {q.sourceOfResponse && (
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Fuente: {q.sourceOfResponse}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Closed Without Answer Banner */}
                  {isClosedNoAns && (
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-0.5">
                      <div className="flex items-center gap-1 font-bold text-rose-800 text-[11px]">
                        <XCircle className="h-3.5 w-3.5 text-rose-600" />
                        Cerrada sin respuesta formal
                      </div>
                      {q.closedReason && (
                        <p className="text-[11px] text-rose-800 italic">
                          Motivo: {q.closedReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Recent Follow-Up / Bitácora Preview (Collapsible) */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <button
                        onClick={() => toggleLogExpand(q.id)}
                        className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Bitácora de Seguimiento ({recentFollowUps.length})</span>
                        {isLogsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      <button
                        onClick={() => handleOpenFollowUpModal(q)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Registrar Hito
                      </button>
                    </div>

                    {/* Collapsible log view or preview */}
                    {isLogsOpen ? (
                      <div className="space-y-1.5 mt-1.5 max-h-44 overflow-y-auto pr-1">
                        {recentFollowUps.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic py-0.5">Sin hitos registrados aún.</p>
                        ) : (
                          recentFollowUps.map((log) => (
                            <div
                              key={log.id}
                              className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-0.5"
                            >
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span className="font-bold text-slate-700">{log.createdBy}</span>
                                <span>{formatDate(log.createdAt)}</span>
                              </div>
                              <p className="text-slate-700 text-[11px] leading-relaxed">{log.note}</p>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      recentFollowUps.length > 0 && (
                        <div className="p-1.5 rounded-lg bg-slate-50 text-[11px] text-slate-600 flex items-start justify-between gap-2">
                          <p className="truncate">
                            <span className="font-semibold text-slate-800">{recentFollowUps[0].createdBy}: </span>
                            {recentFollowUps[0].note}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatDate(recentFollowUps[0].createdAt)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Operational Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Consulta / Contexto</th>
                  {!programId && <th className="px-4 py-3">Programa</th>}
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Dirigida a</th>
                  <th className="px-4 py-3">Plazo Seguimiento</th>
                  <th className="px-4 py-3">Próxima Instancia</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.map((q) => {
                  const isOverdue = isQuestionOverdue(q, todayStr);
                  const isResolved = q.status === 'resuelta';
                  return (
                    <tr
                      key={q.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOverdue ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 max-w-sm">
                        <div
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-1"
                          onClick={() => onOpenEntity('question', q.id)}
                        >
                          {q.question}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{q.context}</p>
                        {isResolved && q.finalAnswer && (
                          <p className="text-[11px] font-semibold text-emerald-700 line-clamp-1 mt-0.5">
                            ✓ {q.finalAnswer}
                          </p>
                        )}
                      </td>

                      {!programId && (
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <ProgramBadge programId={q.programId} size="sm" />
                        </td>
                      )}

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <QuestionCategoryBadge category={q.category} />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <QuestionStatusChip
                          status={q.status}
                          onChange={(newStatus) => updateQuestion(q.id, { status: newStatus })}
                        />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-800">
                        {q.responsible || '—'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <QuestionOverdueBadge followUpDate={q.followUpDate} status={q.status} currentDate={todayStr} />
                      </td>

                      <td className="px-4 py-3.5 text-[11px] text-slate-600 max-w-xs truncate font-medium">
                        {q.nextInstance || 'Por definir'}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => handleOpenFollowUpModal(q)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all"
                          title="Registrar hito de seguimiento"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenEntity('question', q.id)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all"
                          title="Ver detalle"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteWithCheck(q)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                          title="Archivar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Registrar Hito de Seguimiento */}
      {followUpTargetQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Registrar Hito de Seguimiento</h3>
              </div>
              <button
                onClick={() => setFollowUpTargetQ(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="p-5 space-y-4">
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                <span className="font-bold text-indigo-900">Consulta:</span>
                <p className="text-slate-800 font-medium mt-0.5">{followUpTargetQ.question}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Hito / Gestión</label>
                <select
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value as QuestionFollowUpType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="reiteracion">⏰ Reiteración</option>
                  <option value="respuesta_parcial">💬 Respuesta preliminar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detalle del Hito / Observación <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej: Se remitió correo a Referente Financiero SSMN solicitando confirmación de redistribución de fondos..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFollowUpTargetQ(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Guardar Hito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Respuesta Oficial & Resolver */}
      {resolveTargetQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-emerald-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-950">Resolver y Registrar Orientación Oficial</h3>
              </div>
              <button
                onClick={() => setResolveTargetQ(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResolve} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700">Consulta:</span>
                <p className="text-slate-900 font-semibold mt-0.5">{resolveTargetQ.question}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Respuesta Oficial / Criterio Aplicable <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalla la respuesta oficial, acuerdo o criterio emitido por la autoridad o contraparte..."
                  value={finalAnswerText}
                  onChange={(e) => setFinalAnswerText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fuente / Emisor de la Respuesta</label>
                <input
                  type="text"
                  placeholder="Ej: SSMN Referente Financiero, Asesoría Jurídica DISAM, SENAMA, etc."
                  value={sourceOfResponseText}
                  onChange={(e) => setSourceOfResponseText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveTargetQ(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Marcar como Resuelta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safety Confirm Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(questionToDelete)}
        title="¿Confirmas que deseas archivar esta consulta?"
        message={
          questionToDelete?.taskId
            ? `Esta consulta tiene una tarea vinculada ("${questionToDelete.taskId}"). Al archivarla se mantendrá la tarea pero la consulta dejará de contar en la bandeja activa.`
            : 'La consulta se marcará como archivada y dejará de generar alertas de seguimiento.'
        }
        confirmLabel="Archivar Consulta"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setQuestionToDelete(null)}
      />
    </div>
  );
};
