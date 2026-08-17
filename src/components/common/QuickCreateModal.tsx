import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, PriorityLevel, TaskStatus, EmailAction, QuestionCategory, KnowledgeCategory, HRStatus } from '../../types';
import { 
  X, 
  CheckSquare, 
  Users, 
  ShoppingBag, 
  Mail, 
  HelpCircle, 
  Lightbulb, 
  UserPlus, 
  TrendingUp,
  FolderHeart,
  Calendar,
  Sparkles
} from 'lucide-react';

export const QuickCreateModal: React.FC<{ isOpen: boolean; onClose: () => void; defaultProgramId?: ProgramId | null }> = ({
  isOpen,
  onClose,
  defaultProgramId,
}) => {
  const { 
    programs, 
    establishments, 
    currentUser, 
    addTask, 
    addMeeting, 
    addPurchase, 
    addEmail, 
    addQuestion, 
    addKnowledge, 
    addHRRecord, 
    addIndicator, 
    addEleamCase,
    indicators
  } = useApp();

  const [activeTab, setActiveTab] = useState<'task' | 'meeting' | 'purchase' | 'email' | 'question' | 'knowledge' | 'hr' | 'indicator' | 'eleam'>('task');
  const [selectedProgram, setSelectedProgram] = useState<ProgramId>(defaultProgramId || 'praps_cpu');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskResponsible, setTaskResponsible] = useState(currentUser.name);
  const [taskDueDate, setTaskDueDate] = useState('2026-08-18');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('alta');
  const [taskDesc, setTaskDesc] = useState('');

  // Meeting form state
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDateTime, setMeetDateTime] = useState('2026-08-19T10:00');
  const [meetLocation, setMeetLocation] = useState('Sala DISAM / Zoom');
  const [meetParticipants, setMeetParticipants] = useState('Klaus Bauer, Equipo Referente');
  const [meetObjective, setMeetObjective] = useState('');

  // Purchase form state
  const [purItem, setPurItem] = useState('');
  const [purAmount, setPurAmount] = useState('1500000');
  const [purSupplier, setPurSupplier] = useState('');
  const [purReqDate, setPurReqDate] = useState('2026-08-25');
  const [purResp, setPurResp] = useState(currentUser.name);

  // Email form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailAction, setEmailAction] = useState<EmailAction>('responder');
  const [emailDeadline, setEmailDeadline] = useState('2026-08-17');
  const [emailPriority, setEmailPriority] = useState<PriorityLevel>('alta');

  // Question form state
  const [questionText, setQuestionText] = useState('');
  const [questionContext, setQuestionContext] = useState('');
  const [questionCategory, setQuestionCategory] = useState<QuestionCategory>('tecnica');
  const [questionNextInst, setQuestionNextInst] = useState('');

  // Knowledge form state
  const [knTitle, setKnTitle] = useState('');
  const [knContent, setKnContent] = useState('');
  const [knCategory, setKnCategory] = useState<KnowledgeCategory>('criterio_tecnico');
  const [knTags, setKnTags] = useState('Criterio, Proceso');

  // HR form state
  const [hrName, setHrName] = useState('');
  const [hrProfession, setHrProfession] = useState('Kinesiólogo/a');
  const [hrRole, setHrRole] = useState('Profesional de Atención');
  const [hrEst, setHrEst] = useState(establishments[0]?.id || 'cesfam_manuel_bustos');
  const [hrHours, setHrHours] = useState('44');
  const [hrContract, setHrContract] = useState<'Contrata' | 'Planta' | 'Honorarios' | 'Código del Trabajo'>('Contrata');

  // Indicator form state
  const [indComponente, setIndComponente] = useState('');
  const [indName, setIndName] = useState('');
  const [indCorte, setIndCorte] = useState<'1° corte' | '2° corte' | '3° corte'>('1° corte');
  const [indObjetivo, setIndObjetivo] = useState('');
  const [indNumDesc, setIndNumDesc] = useState('');
  const [indNumPorc, setIndNumPorc] = useState('');
  const [indDenDesc, setIndDenDesc] = useState('');
  const [indDenPorc, setIndDenPorc] = useState('');
  const [indPesoRelativo, setIndPesoRelativo] = useState('');
  const [indMedioNum, setIndMedioNum] = useState('');
  const [indMedioDen, setIndMedioDen] = useState('');
  const [indMetaAnualTexto, setIndMetaAnualTexto] = useState('');
  const [indMetaAnualPorc, setIndMetaAnualPorc] = useState('100');
  const [indCurrent, setIndCurrent] = useState('0');
  const [indFechaCorte, setIndFechaCorte] = useState('2026-08-31');

  // ELEAM form state
  const [eleamCode, setEleamCode] = useState(`ELEAM-QLC-2026-${Math.floor(Math.random() * 90 + 10)}`);
  const [eleamEst, setEleamEst] = useState(establishments[0]?.id || 'cesfam_manuel_bustos');
  const [eleamNextAction, setEleamNextAction] = useState('Revisión de informe social y médico');
  const [eleamDeadline, setEleamDeadline] = useState('2026-08-25');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'task') {
      if (!taskTitle.trim()) return;
      addTask({
        title: taskTitle,
        description: taskDesc,
        programId: selectedProgram,
        responsible: taskResponsible,
        priority: taskPriority,
        dueDate: taskDueDate,
        status: 'pendiente',
        origin: 'Manual',
      });
    } else if (activeTab === 'meeting') {
      if (!meetTitle.trim()) return;
      addMeeting({
        title: meetTitle,
        programId: selectedProgram,
        type: 'reunion',
        dateTime: meetDateTime,
        location: meetLocation,
        participants: meetParticipants.split(',').map(s => s.trim()),
        objective: meetObjective,
        notes: '',
        agreements: '',
        commitments: [],
      });
    } else if (activeTab === 'purchase') {
      if (!purItem.trim()) return;
      const reqNum = `REQ-${selectedProgram.toUpperCase().substring(6, 10)}-${Date.now().toString().slice(-4)}`;
      addPurchase({
        requestNumber: reqNum,
        programId: selectedProgram,
        itemOrService: purItem,
        description: `Adquisición rápida de ${purItem}`,
        estimatedAmount: parseFloat(purAmount) || 0,
        supplier: purSupplier,
        requestDate: '2026-08-15',
        requiredDate: purReqDate,
        responsible: purResp,
        status: 'pendiente',
      });
    } else if (activeTab === 'email') {
      if (!emailSubject.trim()) return;
      addEmail({
        subject: emailSubject,
        recipient: emailRecipient,
        programId: selectedProgram,
        action: emailAction,
        priority: emailPriority,
        deadline: emailDeadline,
        status: 'pendiente',
      });
    } else if (activeTab === 'question') {
      if (!questionText.trim()) return;
      addQuestion({
        question: questionText,
        context: questionContext,
        programId: selectedProgram,
        category: questionCategory,
        responsible: currentUser.name,
        priority: 'alta',
        status: 'pendiente',
        nextInstance: questionNextInst,
      });
    } else if (activeTab === 'knowledge') {
      if (!knTitle.trim()) return;
      addKnowledge({
        title: knTitle,
        content: knContent,
        programId: selectedProgram,
        category: knCategory,
        tags: knTags.split(',').map(s => s.trim()),
        isPinned: false,
        author: currentUser.name,
      });
    } else if (activeTab === 'hr') {
      if (!hrName.trim()) return;
      addHRRecord({
        name: hrName,
        profession: hrProfession,
        role: hrRole,
        programId: selectedProgram,
        establishmentId: hrEst,
        workdayHours: parseInt(hrHours, 10) || 44,
        programHours: parseInt(hrHours, 10) || 44,
        contractType: hrContract,
        startDate: '2026-08-15',
        functions: 'Atención y coordinación del programa de salud en establecimiento asignado.',
        status: 'activo',
      });
    } else if (activeTab === 'indicator') {
      if (!indName.trim()) return;
      const numAnnual = parseFloat(indMetaAnualPorc) || 100;
      const numResult = parseFloat(indCurrent) || 0;
      const programIndicators = indicators.filter((i) => i.programId === selectedProgram);
      const generatedCode = `Indicador ${programIndicators.length + 1}`;

      const cutData = {
        target: numAnnual,
        result: numResult,
        date: indFechaCorte,
        source: indMedioNum || 'Registro Clínico / REM',
        notes: indObjetivo || undefined,
      };

      addIndicator({
        code: generatedCode,
        name: indName,
        programId: selectedProgram,
        description: indObjetivo || indName,
        componente: indComponente.trim() || undefined,
        objetivoEspecifico: indObjetivo.trim() || undefined,
        corteSeleccionado: indCorte,
        numeradorDescripcion: indNumDesc.trim() || undefined,
        numeradorValor: indNumPorc ? parseFloat(indNumPorc) : undefined,
        denominadorDescripcion: indDenDesc.trim() || undefined,
        denominadorValor: indDenPorc ? parseFloat(indDenPorc) : undefined,
        pesoRelativo: indPesoRelativo ? parseFloat(indPesoRelativo) : undefined,
        medioVerificacionNumerador: indMedioNum.trim() || undefined,
        medioVerificacionDenominador: indMedioDen.trim() || undefined,
        metaCumplimientoAnualTexto: indMetaAnualTexto.trim() || undefined,
        metaCumplimientoAnualPorcentaje: numAnnual,
        periodicity: 'Mensual',
        annualTarget: numAnnual,
        periodTarget: numAnnual,
        currentResult: numResult,
        unit: '%',
        direction: 'higher_is_better',
        cutoffDate: indFechaCorte,
        responsible: currentUser.name,
        source: indMedioNum || 'REM / DEIS',
        notes: indMetaAnualTexto || undefined,
        corte1: indCorte === '1° corte' ? cutData : undefined,
        corte2: indCorte === '2° corte' ? cutData : undefined,
        corte3: indCorte === '3° corte' ? cutData : undefined,
      });
    } else if (activeTab === 'eleam') {
      addEleamCase({
        caseCode: eleamCode,
        establishmentId: eleamEst,
        startDate: '2026-08-15',
        status: 'preparando_antecedentes',
        requiredDocumentation: ['Informe Social', 'Informe Médico', 'RSH'],
        pendingDocumentation: ['Informe Social', 'Informe Médico'],
        responsible: currentUser.name,
        nextAction: eleamNextAction,
        deadline: eleamDeadline,
      });
    }

    onClose();
  };

  const tabs = [
    { id: 'task', label: 'Tarea', icon: CheckSquare },
    { id: 'meeting', label: 'Reunión', icon: Users },
    { id: 'purchase', label: 'Compra', icon: ShoppingBag },
    { id: 'email', label: 'Correo', icon: Mail },
    { id: 'question', label: 'Pregunta', icon: HelpCircle },
    { id: 'knowledge', label: 'Tip/Nota', icon: Lightbulb },
    { id: 'hr', label: 'RRHH', icon: UserPlus },
    { id: 'indicator', label: 'Meta', icon: TrendingUp },
    { id: 'eleam', label: 'ELEAM', icon: FolderHeart },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="quick-create-modal"
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shrink-0">
              +
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {activeTab === 'indicator' ? 'Crear Nuevo Indicador' : 'Crear Nuevo Registro'}
              </h2>
              {activeTab !== 'indicator' && (
                <p className="text-[11px] sm:text-xs text-slate-500 hidden xs:block">Captura rápida en 1 clic — Centro Operativo Quilicura</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector (Responsive wrap without horizontal scroll) */}
        <div className="flex flex-wrap items-center border-b border-slate-200 bg-slate-50/80 px-3 sm:px-4 py-2 gap-1.5 shrink-0 max-h-24 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-create-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Program Pre-selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Programa de Salud *
            </label>
            <select
              id="select-create-program"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value as ProgramId)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* TASK FORM */}
          {activeTab === 'task' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título de la Tarea *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Enviar antecedentes financieros corregidos al SSMN"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={taskResponsible}
                    onChange={(e) => setTaskResponsible(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Vencimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="critica">Crítica (Urgente)</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción / Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </>
          )}

          {/* MEETING FORM */}
          {activeTab === 'meeting' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título de la Reunión / Capacitación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Comité Técnico Comunal de Cuidados Paliativos"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={meetDateTime}
                    onChange={(e) => setMeetDateTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lugar / Enlace
                  </label>
                  <input
                    type="text"
                    value={meetLocation}
                    onChange={(e) => setMeetLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Participantes (separados por coma)
                </label>
                <input
                  type="text"
                  value={meetParticipants}
                  onChange={(e) => setMeetParticipants(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Objetivo Principal
                </label>
                <textarea
                  rows={2}
                  placeholder="Objetivos y puntos clave a tratar..."
                  value={meetObjective}
                  onChange={(e) => setMeetObjective(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </>
          )}

          {/* PURCHASE FORM */}
          {activeTab === 'purchase' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Producto o Servicio Solicitado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Insumos de Curación Avanzada y Apósito Hidrocoloide"
                  value={purItem}
                  onChange={(e) => setPurItem(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monto Estimado ($ CLP)
                  </label>
                  <input
                    type="number"
                    value={purAmount}
                    onChange={(e) => setPurAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proveedor Sugerido
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Droguería Central"
                    value={purSupplier}
                    onChange={(e) => setPurSupplier(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Requerida
                  </label>
                  <input
                    type="date"
                    value={purReqDate}
                    onChange={(e) => setPurReqDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          {/* EMAIL FORM */}
          {activeTab === 'email' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asunto del Correo / Requerimiento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Consulta de brecha mamográfica Quilicura"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destinatario
                  </label>
                  <input
                    type="text"
                    placeholder="referente@ssmn.cl"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Acción
                  </label>
                  <select
                    value={emailAction}
                    onChange={(e) => setEmailAction(e.target.value as EmailAction)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="enviar">Enviar</option>
                    <option value="responder">Responder</option>
                    <option value="revisar">Revisar</option>
                    <option value="seguimiento">Seguimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plazo Límite
                  </label>
                  <input
                    type="date"
                    value={emailDeadline}
                    onChange={(e) => setEmailDeadline(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          {/* QUESTION FORM */}
          {activeTab === 'question' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pregunta o Duda a Resolver *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. ¿Podemos reasignar fondos no ejecutados a compra de horas médicas?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={questionCategory}
                    onChange={(e) => setQuestionCategory(e.target.value as QuestionCategory)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="tecnica">Técnica</option>
                    <option value="administrativa">Administrativa</option>
                    <option value="financiera">Financiera</option>
                    <option value="servicio_salud">Servicio de Salud (SSMN)</option>
                    <option value="gestion_interna">Gestión Interna</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Próxima Instancia para Resolver
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Mesa Técnica SSMN 21/08"
                    value={questionNextInst}
                    onChange={(e) => setQuestionNextInst(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          {/* KNOWLEDGE TIP FORM */}
          {activeTab === 'knowledge' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Tip / Criterio Operativo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Flujograma para prescripción de opioides en CPU"
                  value={knTitle}
                  onChange={(e) => setKnTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={knCategory}
                    onChange={(e) => setKnCategory(e.target.value as KnowledgeCategory)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="recordatorio">Recordatorio</option>
                    <option value="criterio_tecnico">Criterio Técnico</option>
                    <option value="error_evitar">Error a Evitar</option>
                    <option value="requisito">Requisito</option>
                    <option value="fecha_importante">Fecha Importante</option>
                    <option value="recomendacion">Recomendación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Etiquetas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={knTags}
                    onChange={(e) => setKnTags(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contenido / Instrucción
                </label>
                <textarea
                  rows={3}
                  placeholder="Pasos, recomendaciones, criterios a considerar..."
                  value={knContent}
                  onChange={(e) => setKnContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </>
          )}

          {/* HR RECORD FORM */}
          {activeTab === 'hr' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Profesional *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Dra. Claudia Navarrete"
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profesión
                  </label>
                  <input
                    type="text"
                    value={hrProfession}
                    onChange={(e) => setHrProfession(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Establecimiento
                  </label>
                  <select
                    value={hrEst}
                    onChange={(e) => setHrEst(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  >
                    {establishments.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Horas Asignadas
                  </label>
                  <input
                    type="number"
                    value={hrHours}
                    onChange={(e) => setHrHours(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo Contrato
                  </label>
                  <select
                    value={hrContract}
                    onChange={(e) => setHrContract(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="Contrata">Contrata</option>
                    <option value="Planta">Planta</option>
                    <option value="Honorarios">Honorarios</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* INDICATOR FORM */}
          {activeTab === 'indicator' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Componente
                </label>
                <input
                  type="text"
                  placeholder="ej. Componente 1: Atención y Cobertura Integral"
                  value={indComponente}
                  onChange={(e) => setIndComponente(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Indicador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Cobertura de atenciones de rehabilitación integral"
                    value={indName}
                    onChange={(e) => setIndName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corte
                  </label>
                  <select
                    value={indCorte}
                    onChange={(e) => setIndCorte(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="1° corte">1° corte</option>
                    <option value="2° corte">2° corte</option>
                    <option value="3° corte">3° corte</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Objetivo Específico
                </label>
                <textarea
                  rows={2}
                  placeholder="Describa el objetivo sanitario u operativo del indicador..."
                  value={indObjetivo}
                  onChange={(e) => setIndObjetivo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numerador (Descripción)
                  </label>
                  <input
                    type="text"
                    placeholder="ej. N° de atenciones efectivas realizadas"
                    value={indNumDesc}
                    onChange={(e) => setIndNumDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numerador (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={indNumPorc}
                      onChange={(e) => setIndNumPorc(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Denominador (Descripción)
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Total de pacientes programados en red"
                    value={indDenDesc}
                    onChange={(e) => setIndDenDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Denominador (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="100"
                      value={indDenPorc}
                      onChange={(e) => setIndDenPorc(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peso Relativo en %
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    step="any"
                    placeholder="ej. 25"
                    value={indPesoRelativo}
                    onChange={(e) => setIndPesoRelativo(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medio de Verificación del Numerador
                  </label>
                  <input
                    type="text"
                    placeholder="ej. REM P01 Sala RBC"
                    value={indMedioNum}
                    onChange={(e) => setIndMedioNum(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medio de Verificación del Denominador
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Planilla Interna DISAM"
                    value={indMedioDen}
                    onChange={(e) => setIndMedioDen(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meta Cumplimiento del Indicador Anual (Descripción)
                </label>
                <input
                  type="text"
                  placeholder="ej. Alcanzar el 85% de cobertura anual acumulada"
                  value={indMetaAnualTexto}
                  onChange={(e) => setIndMetaAnualTexto(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meta Cumplimiento Anual en % *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="90"
                      value={indMetaAnualPorc}
                      onChange={(e) => setIndMetaAnualPorc(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resultado Actual en % *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="78.5"
                      value={indCurrent}
                      onChange={(e) => setIndCurrent(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Corte a Seleccionar *
                  </label>
                  <input
                    type="date"
                    required
                    value={indFechaCorte}
                    onChange={(e) => setIndFechaCorte(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* ELEAM FORM */}
          {activeTab === 'eleam' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Interno del Caso (Sin datos sensibles) *
                  </label>
                  <input
                    type="text"
                    required
                    value={eleamCode}
                    onChange={(e) => setEleamCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Establecimiento CESFAM
                  </label>
                  <select
                    value={eleamEst}
                    onChange={(e) => setEleamEst(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  >
                    {establishments.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Próxima Acción
                  </label>
                  <input
                    type="text"
                    value={eleamNextAction}
                    onChange={(e) => setEleamNextAction(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Plazo
                  </label>
                  <input
                    type="date"
                    value={eleamDeadline}
                    onChange={(e) => setEleamDeadline(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Actions - Mobile First */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[40px] text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-confirm-quick-create"
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all min-h-[40px] text-center"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
