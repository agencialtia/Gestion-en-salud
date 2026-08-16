import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId } from '../../types';
import {
  Search,
  X,
  CheckSquare,
  TrendingUp,
  ShoppingBag,
  Users,
  Mail,
  HelpCircle,
  Lightbulb,
  UserCheck,
  FolderHeart,
  ArrowRight
} from 'lucide-react';
import { ProgramBadge } from './UIComponents';

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    tasks,
    indicators,
    purchases,
    meetings,
    emails,
    questions,
    knowledge,
    hrRecords,
    eleamCases,
    setActiveView,
    setSelectedProgramId,
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Search aggregations across all modules
  const filteredTasks = normalizedQuery
    ? tasks.filter(
        (t) =>
          !t.archived &&
          (t.title.toLowerCase().includes(normalizedQuery) ||
            t.responsible.toLowerCase().includes(normalizedQuery) ||
            (t.description && t.description.toLowerCase().includes(normalizedQuery)))
      )
    : [];

  const filteredIndicators = normalizedQuery
    ? indicators.filter(
        (i) =>
          !i.archived &&
          (i.code.toLowerCase().includes(normalizedQuery) ||
            i.name.toLowerCase().includes(normalizedQuery) ||
            i.responsible.toLowerCase().includes(normalizedQuery))
      )
    : [];

  const filteredPurchases = normalizedQuery
    ? purchases.filter(
        (p) =>
          !p.archived &&
          (p.requestNumber.toLowerCase().includes(normalizedQuery) ||
            p.itemOrService.toLowerCase().includes(normalizedQuery) ||
            (p.supplier && p.supplier.toLowerCase().includes(normalizedQuery)))
      )
    : [];

  const filteredMeetings = normalizedQuery
    ? meetings.filter(
        (m) =>
          !m.archived &&
          (m.title.toLowerCase().includes(normalizedQuery) ||
            m.objective.toLowerCase().includes(normalizedQuery))
      )
    : [];

  const filteredQuestions = normalizedQuery
    ? questions.filter(
        (q) =>
          !q.archived &&
          (q.question.toLowerCase().includes(normalizedQuery) ||
            q.context.toLowerCase().includes(normalizedQuery))
      )
    : [];

  const filteredKnowledge = normalizedQuery
    ? knowledge.filter(
        (k) =>
          !k.archived &&
          (k.title.toLowerCase().includes(normalizedQuery) ||
            k.content.toLowerCase().includes(normalizedQuery) ||
            k.tags.some((t) => t.toLowerCase().includes(normalizedQuery)))
      )
    : [];

  const filteredHR = normalizedQuery
    ? hrRecords.filter(
        (h) =>
          !h.archived &&
          (h.name.toLowerCase().includes(normalizedQuery) ||
            h.profession.toLowerCase().includes(normalizedQuery) ||
            h.role.toLowerCase().includes(normalizedQuery))
      )
    : [];

  const filteredEleam = normalizedQuery
    ? eleamCases.filter(
        (e) =>
          !e.archived &&
          (e.caseCode.toLowerCase().includes(normalizedQuery) ||
            e.nextAction.toLowerCase().includes(normalizedQuery))
      )
    : [];

  const totalResults =
    filteredTasks.length +
    filteredIndicators.length +
    filteredPurchases.length +
    filteredMeetings.length +
    filteredQuestions.length +
    filteredKnowledge.length +
    filteredHR.length +
    filteredEleam.length;

  const navigateToProgram = (programId: ProgramId) => {
    setSelectedProgramId(programId);
    setActiveView('program_detail');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-16 sm:pt-24 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="global-search-dialog"
        className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5 bg-slate-50">
          <Search className="h-5 w-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar en tareas, compras, indicadores, reuniones, ELEAM, personal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded p-1 text-slate-400 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-mono text-slate-500 hover:bg-slate-100"
          >
            ESC
          </button>
        </div>

        {/* Search Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!normalizedQuery ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Búsqueda Unificada de Quilicura Salud</p>
              <p className="mt-1 text-slate-400">
                Escribe términos como <span className="font-mono text-indigo-600">"mamografías"</span>,{' '}
                <span className="font-mono text-indigo-600">"apósito"</span>,{' '}
                <span className="font-mono text-indigo-600">"ELEAM"</span>,{' '}
                <span className="font-mono text-indigo-600">"opioides"</span> o nombres de referentes.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">No se encontraron resultados</p>
              <p className="mt-1 text-slate-400">Prueba con otra palabra clave o código.</p>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              {/* Tasks results */}
              {filteredTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Tareas ({filteredTasks.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => navigateToProgram(t.programId)}
                        className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                              {t.title}
                            </span>
                            <ProgramBadge programId={t.programId} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Resp: {t.responsible} • Vence: {t.dueDate} • Estado: {t.status}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Indicators results */}
              {filteredIndicators.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Indicadores / Metas ({filteredIndicators.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredIndicators.map((ind) => (
                      <div
                        key={ind.id}
                        onClick={() => navigateToProgram(ind.programId)}
                        className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-700">
                              {ind.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">
                              {ind.name}
                            </span>
                            <ProgramBadge programId={ind.programId} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Resultado: {ind.currentResult} / Meta: {ind.periodTarget} {ind.unit} •
                            Resp: {ind.responsible}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchases results */}
              {filteredPurchases.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
                    <span>Compras ({filteredPurchases.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredPurchases.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigateToProgram(p.programId)}
                        className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-amber-200 hover:bg-amber-50/40 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-700">
                              {p.requestNumber}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">
                              {p.itemOrService}
                            </span>
                            <ProgramBadge programId={p.programId} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            ${p.estimatedAmount.toLocaleString('es-CL')} • Proveedor: {p.supplier || 'Sin asignar'} • Estado: {p.status}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions results */}
              {filteredQuestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <HelpCircle className="h-3.5 w-3.5 text-purple-600" />
                    <span>Preguntas a Resolver ({filteredQuestions.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredQuestions.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => navigateToProgram(q.programId)}
                        className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {q.question}
                            </span>
                            <ProgramBadge programId={q.programId} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Categoría: {q.category} • Próxima instancia: {q.nextInstance || 'Por definir'}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-purple-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Knowledge results */}
              {filteredKnowledge.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    <span>Tips y Criterios Operativos ({filteredKnowledge.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredKnowledge.map((k) => (
                      <div
                        key={k.id}
                        onClick={() => navigateToProgram(k.programId)}
                        className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-amber-200 hover:bg-amber-50/40 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {k.title}
                            </span>
                            <ProgramBadge programId={k.programId} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {k.content}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HR results */}
              {filteredHR.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>Personal y Dotación ({filteredHR.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredHR.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => navigateToProgram(h.programId)}
                        className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {h.name}
                            </span>
                            <span className="text-[11px] text-slate-500">({h.profession})</span>
                            <ProgramBadge programId={h.programId} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Cargo: {h.role} • Horas: {h.programHours}h • Estado: {h.status}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ELEAM results */}
              {filteredEleam.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <FolderHeart className="h-3.5 w-3.5 text-rose-600" />
                    <span>Casos ELEAM ({filteredEleam.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredEleam.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => navigateToProgram('prog_personas_mayores')}
                        className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-rose-200 hover:bg-rose-50/40 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-rose-700">
                              {e.caseCode}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">
                              Estado: {e.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Próxima acción: {e.nextAction} • Plazo: {e.deadline}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-rose-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-2.5 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>{totalResults} resultado(s) encontrado(s)</span>
          <span>Presiona Enter para seleccionar o Esc para salir</span>
        </div>
      </div>
    </div>
  );
};
