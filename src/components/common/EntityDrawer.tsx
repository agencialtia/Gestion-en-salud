import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Task, 
  Purchase, 
  Indicator, 
  Meeting, 
  PendingEmail, 
  Question, 
  KnowledgeItem, 
  HRRecord, 
  EleamCase,
  PriorityLevel,
  TaskStatus,
  PurchaseStatus,
  EmailStatus,
  EmailAction,
  QuestionStatus,
  QuestionCategory
} from '../../types';
import { 
  X, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Building, 
  Tag, 
  Paperclip,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { ProgramBadge, PriorityChip, TaskStatusChip, PurchaseStatusChip } from './UIComponents';

export type DrawerEntityType = 
  | 'task' 
  | 'purchase' 
  | 'indicator' 
  | 'meeting' 
  | 'email' 
  | 'question' 
  | 'knowledge' 
  | 'hr' 
  | 'eleam';

export const EntityDrawer: React.FC<{
  isOpen: boolean;
  entityType: DrawerEntityType | null;
  entityId: string | null;
  onClose: () => void;
  onDeleteRequest: (type: DrawerEntityType, id: string) => void;
}> = ({ isOpen, entityType, entityId, onClose, onDeleteRequest }) => {
  const {
    tasks,
    updateTask,
    completeTask,
    purchases,
    updatePurchase,
    indicators,
    updateIndicator,
    recordMeasurement,
    meetings,
    convertCommitmentToTask,
    emails,
    updateEmail,
    questions,
    updateQuestion,
    knowledge,
    updateKnowledge,
    hrRecords,
    updateHRRecord,
    eleamCases,
    updateEleamCase,
    establishments,
    attachments,
    addAttachment,
    showToast,
  } = useApp();

  // Local editing states
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementPeriod, setMeasurementPeriod] = useState('2026-08');
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  if (!isOpen || !entityType || !entityId) return null;

  // Find item
  const task = entityType === 'task' ? tasks.find((t) => t.id === entityId) : null;
  const purchase = entityType === 'purchase' ? purchases.find((p) => p.id === entityId) : null;
  const indicator = entityType === 'indicator' ? indicators.find((i) => i.id === entityId) : null;
  const meeting = entityType === 'meeting' ? meetings.find((m) => m.id === entityId) : null;
  const email = entityType === 'email' ? emails.find((e) => e.id === entityId) : null;
  const question = entityType === 'question' ? questions.find((q) => q.id === entityId) : null;
  const know = entityType === 'knowledge' ? knowledge.find((k) => k.id === entityId) : null;
  const hr = entityType === 'hr' ? hrRecords.find((h) => h.id === entityId) : null;
  const eleam = entityType === 'eleam' ? eleamCases.find((e) => e.id === entityId) : null;

  const currentProgramId =
    task?.programId ||
    purchase?.programId ||
    indicator?.programId ||
    meeting?.programId ||
    email?.programId ||
    question?.programId ||
    know?.programId ||
    hr?.programId ||
    'praps_cpu';

  const entityAttachments = attachments.filter(
    (a) => a.entityId === entityId
  );

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentName.trim()) return;
    addAttachment({
      name: newAttachmentName.trim(),
      size: Math.floor(Math.random() * 800 + 120) * 1024,
      type: 'application/pdf',
      programId: currentProgramId,
      entityType: entityType === 'hr' || entityType === 'indicator' ? 'general' : (entityType as any),
      entityId,
    });
    setNewAttachmentName('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div
          id="entity-drawer-panel"
          className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ProgramBadge programId={currentProgramId} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Detalle de {entityType.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDeleteRequest(entityType, entityId)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Archivar registro"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
            {/* TASK DETAILS */}
            {task && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
                  {task.description && (
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Estado</span>
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_curso">En Curso</option>
                      <option value="bloqueada">Bloqueada</option>
                      <option value="completada">Completada</option>
                      <option value="vencida">Vencida</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Prioridad</span>
                    <select
                      value={task.priority}
                      onChange={(e) => updateTask(task.id, { priority: e.target.value as PriorityLevel })}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="critica">Crítica</option>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Responsable</span>
                    <input
                      type="text"
                      value={task.responsible}
                      onChange={(e) => updateTask(task.id, { responsible: e.target.value })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Vencimiento</span>
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {task.status !== 'completada' && (
                  <button
                    onClick={() => {
                      completeTask(task.id);
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-98 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Marcar Tarea como Completada</span>
                  </button>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notas y Observaciones de Seguimiento
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe avances o acuerdos..."
                    value={task.notes || ''}
                    onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* PURCHASE DETAILS */}
            {purchase && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {purchase.requestNumber}
                    </span>
                    <PurchaseStatusChip status={purchase.status} />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-2">{purchase.itemOrService}</h2>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {purchase.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Estado del Flujo</span>
                    <select
                      value={purchase.status}
                      onChange={(e) => updatePurchase(purchase.id, { status: e.target.value as PurchaseStatus })}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 w-full"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="solicitado">Solicitado</option>
                      <option value="en_compra">En Compra</option>
                      <option value="recepcionado">Recepcionado</option>
                      <option value="cerrado">Cerrado</option>
                      <option value="problema">Problema / Bloqueada</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Monto Estimado ($)</span>
                    <input
                      type="number"
                      value={purchase.estimatedAmount}
                      onChange={(e) => updatePurchase(purchase.id, { estimatedAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Proveedor</span>
                    <input
                      type="text"
                      value={purchase.supplier || ''}
                      onChange={(e) => updatePurchase(purchase.id, { supplier: e.target.value })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Fecha Requerida</span>
                    <input
                      type="date"
                      value={purchase.requiredDate}
                      onChange={(e) => updatePurchase(purchase.id, { requiredDate: e.target.value })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {purchase.status === 'problema' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      Causa del Problema / Motivo de Bloqueo
                    </span>
                    <textarea
                      rows={2}
                      value={purchase.problemReason || ''}
                      onChange={(e) => updatePurchase(purchase.id, { problemReason: e.target.value })}
                      placeholder="Indique por qué la compra no avanza o qué insumo falta..."
                      className="w-full rounded border border-rose-300 bg-white p-2 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>
            )}

            {/* INDICATOR DETAILS & MEASUREMENTS */}
            {indicator && (
              <div className="space-y-5">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {indicator.code}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-2">{indicator.name}</h2>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {indicator.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Meta Anual</span>
                    <span className="text-xs font-bold text-slate-800">{indicator.annualTarget} {indicator.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Meta Período</span>
                    <span className="text-xs font-bold text-slate-800">{indicator.periodTarget} {indicator.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Resultado</span>
                    <span className="text-xs font-bold text-indigo-600">{indicator.currentResult} {indicator.unit}</span>
                  </div>
                </div>

                {/* Record New Measurement */}
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span>Registrar Nuevo Corte / Medición</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">Resultado Numérico</label>
                      <input
                        type="number"
                        placeholder="ej. 85"
                        value={measurementValue}
                        onChange={(e) => setMeasurementValue(e.target.value)}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">Período (YYYY-MM o Q)</label>
                      <input
                        type="text"
                        value={measurementPeriod}
                        onChange={(e) => setMeasurementPeriod(e.target.value)}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!measurementValue) return;
                      recordMeasurement(indicator.id, parseFloat(measurementValue), measurementPeriod, measurementNotes);
                      setMeasurementValue('');
                    }}
                    className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Guardar Medición
                  </button>
                </div>

                {/* History of measurements */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Historial de Mediciones ({indicator.measurements.length})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {indicator.measurements.map((m) => (
                      <div key={m.id} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-800">{m.period}</span>
                          <span className="text-[11px] text-slate-500 ml-2">({m.date})</span>
                        </div>
                        <div className="font-bold text-slate-900">
                          {m.result} / {m.target} {indicator.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MEETING DETAILS */}
            {meeting && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{meeting.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {meeting.dateTime} • {meeting.location}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block">Objetivo:</span>
                    <p className="text-slate-600">{meeting.objective}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Participantes:</span>
                    <p className="text-slate-600">{meeting.participants.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Acuerdos:</span>
                    <p className="text-slate-600">{meeting.agreements || 'Sin acuerdos registrados.'}</p>
                  </div>
                </div>

                {/* Commitments list with direct "Convert to Task" */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Compromisos Acordados ({meeting.commitments.length})
                  </h4>
                  <div className="space-y-2">
                    {meeting.commitments.map((c) => (
                      <div key={c.id} className="p-3 border border-slate-200 rounded-xl space-y-1.5 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">{c.description}</span>
                          <PriorityChip priority={c.priority} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Resp: {c.responsible} • Plazo: {c.deadline}</span>
                          {c.taskId ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Tarea vinculada
                            </span>
                          ) : (
                            <button
                              onClick={() => convertCommitmentToTask(meeting.id, c.id)}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              + Convertir en tarea
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION DETAILS */}
            {question && (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    Categoría: {question.category}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-2">{question.question}</h2>
                  <p className="text-xs text-slate-600 mt-1">{question.context}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Estado de la Consulta</span>
                    <select
                      value={question.status}
                      onChange={(e) => updateQuestion(question.id, { status: e.target.value as QuestionStatus })}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_consulta">En Consulta</option>
                      <option value="esperando_respuesta">Esperando Respuesta</option>
                      <option value="resuelta">Resuelta</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Próxima Instancia para Resolver</span>
                    <input
                      type="text"
                      value={question.nextInstance || ''}
                      onChange={(e) => updateQuestion(question.id, { nextInstance: e.target.value })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Respuesta Final / Criterio Definido</span>
                    <textarea
                      rows={3}
                      placeholder="Escribe la respuesta o resolución oficial..."
                      value={question.finalAnswer || ''}
                      onChange={(e) => updateQuestion(question.id, { finalAnswer: e.target.value })}
                      className="w-full rounded border border-slate-300 p-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ELEAM DETAILS */}
            {eleam && (
              <div className="space-y-5">
                <div>
                  <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    {eleam.caseCode}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-2">Seguimiento de Postulación ELEAM</h2>
                  <p className="text-xs text-slate-500">Iniciado el {eleam.startDate}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Estado de Tramitación</span>
                    <select
                      value={eleam.status}
                      onChange={(e) => updateEleamCase(eleam.id, { status: e.target.value as any })}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="identificado">Identificado</option>
                      <option value="preparando_antecedentes">Preparando Antecedentes</option>
                      <option value="documentacion_incompleta">Documentación Incompleta</option>
                      <option value="postulado">Postulado a SENAMA</option>
                      <option value="en_evaluacion">En Evaluación Comité</option>
                      <option value="observado">Observado con Requerimientos</option>
                      <option value="aprobado">Aprobado / Cupo Asignado</option>
                      <option value="rechazado">Rechazado</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Próxima Acción Operativa</span>
                    <input
                      type="text"
                      value={eleam.nextAction}
                      onChange={(e) => updateEleamCase(eleam.id, { nextAction: e.target.value })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Fecha Plazo</span>
                    <input
                      type="date"
                      value={eleam.deadline}
                      onChange={(e) => updateEleamCase(eleam.id, { deadline: e.target.value })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ATTACHMENTS MANAGER FOR ANY ENTITY */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                  Archivos y Documentos Adjuntos ({entityAttachments.length})
                </span>
              </div>

              {entityAttachments.length > 0 ? (
                <div className="space-y-1.5">
                  {entityAttachments.map((att) => (
                    <div key={att.id} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between text-xs bg-slate-50">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="font-medium text-slate-800 truncate max-w-[200px]">{att.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No hay documentos adjuntos aún.</p>
              )}

              {/* Add document form */}
              <form onSubmit={handleAddFile} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ej. Orden_Compra_Firmada.pdf o Informe_Social.pdf"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors shrink-0"
                >
                  Adjuntar
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Cambios sincronizados automáticamente
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            >
              Listo / Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
