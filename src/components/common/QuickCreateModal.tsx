import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ProgramId, 
  PriorityLevel, 
  TaskStatus, 
  EmailAction, 
  QuestionCategory, 
  KnowledgeCategory, 
  HRStatus, 
  PurchaseStatus, 
  getPurchaseDateFieldLabel,
  PurchaseMacroState,
  PurchaseReceptionStatus,
  PurchaseInvoiceStatus,
} from '../../types';
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
  Sparkles,
  ExternalLink,
  Paperclip,
  FileText,
  Trash2,
  ShieldAlert,
  Truck,
  PackageCheck,
  Receipt,
  Clock,
  CheckCircle2,
} from 'lucide-react';

// Helper to ensure any web link is valid and clickable
const normalizeUrl = (url?: string): string => {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export type QuickCreateTab = 'task' | 'meeting' | 'purchase' | 'email' | 'question' | 'knowledge' | 'hr' | 'indicator' | 'eleam';

export const QuickCreateModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  defaultProgramId?: ProgramId | null;
  initialTab?: QuickCreateTab;
}> = ({
  isOpen,
  onClose,
  defaultProgramId,
  initialTab = 'task',
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
    addAttachment,
    indicators
  } = useApp();

  const [activeTab, setActiveTab] = useState<QuickCreateTab>(initialTab);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId>(defaultProgramId || 'praps_cpu');

  React.useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (defaultProgramId) {
        setSelectedProgram(defaultProgramId);
      }
    }
  }, [isOpen, initialTab, defaultProgramId]);

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
  const [purMacroState, setPurMacroState] = useState<PurchaseMacroState>('por_hacer');
  const [purReceptionStatus, setPurReceptionStatus] = useState<PurchaseReceptionStatus>('pendiente');
  const [purReceptionDate, setPurReceptionDate] = useState('');
  const [purReceptionResponsible, setPurReceptionResponsible] = useState(currentUser.name);
  const [purReceptionActDoc, setPurReceptionActDoc] = useState('');
  const [purReceptionNotes, setPurReceptionNotes] = useState('');
  
  const [purInvoiceStatus, setPurInvoiceStatus] = useState<PurchaseInvoiceStatus>('sin_factura');
  const [purInvoiceNumber, setPurInvoiceNumber] = useState('');
  const [purInvoiceDate, setPurInvoiceDate] = useState('');
  const [purInvoiceAmount, setPurInvoiceAmount] = useState('');
  const [purInvoicePaymentDate, setPurInvoicePaymentDate] = useState('');
  const [purInvoiceNotes, setPurInvoiceNotes] = useState('');

  const [purCategory, setPurCategory] = useState(''); // Categoría de productos/servicios (ej. Insumos de rehabilitación)
  const [purItem, setPurItem] = useState('');
  const [purStatus, setPurStatus] = useState<PurchaseStatus>('solicitado');
  const [purProblemReason, setPurProblemReason] = useState('');
  const [purSupplier, setPurSupplier] = useState(''); // Proveedor elegido
  const [purModalidad, setPurModalidad] = useState('Convenio Marco');
  const [purUnits, setPurUnits] = useState('1');
  const [purUnitPriceWithoutTax, setPurUnitPriceWithoutTax] = useState('');
  const [purUnitPriceWithTax, setPurUnitPriceWithTax] = useState('');
  const [purTotalPriceWithTax, setPurTotalPriceWithTax] = useState('');
  const [purCeroPapelExp, setPurCeroPapelExp] = useState('');
  const [purCeroPapelEstado, setPurCeroPapelEstado] = useState('');
  const [purRefLink, setPurRefLink] = useState('');
  const [purOCNumber, setPurOCNumber] = useState('');
  const [purOCSentDate, setPurOCSentDate] = useState('');
  const [purOCAcceptedDate, setPurOCAcceptedDate] = useState('');
  const [purReqDate, setPurReqDate] = useState('2026-08-25');
  const [purResp, setPurResp] = useState(currentUser.name);
  const [purAttachments, setPurAttachments] = useState<{ id: string; name: string; size: number; type: string }[]>([]);
  const [purNewAttachmentName, setPurNewAttachmentName] = useState('');

  const handleAddPurAttachment = () => {
    if (!purNewAttachmentName.trim()) return;
    const newAtt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: purNewAttachmentName.trim(),
      size: Math.floor(Math.random() * 600 + 120) * 1024,
      type: 'application/pdf',
    };
    setPurAttachments(prev => [...prev, newAtt]);
    setPurNewAttachmentName('');
  };

  // Helper calculation for prices
  const handleWithoutTaxChange = (val: string) => {
    setPurUnitPriceWithoutTax(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const withTax = Math.round(num * 1.19);
      setPurUnitPriceWithTax(withTax.toString());
      const u = parseFloat(purUnits) || 1;
      setPurTotalPriceWithTax((withTax * u).toString());
    }
  };

  const handleWithTaxChange = (val: string) => {
    setPurUnitPriceWithTax(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const withoutTax = Math.round(num / 1.19);
      setPurUnitPriceWithoutTax(withoutTax.toString());
      const u = parseFloat(purUnits) || 1;
      setPurTotalPriceWithTax((num * u).toString());
    }
  };

  const handleUnitsChange = (val: string) => {
    setPurUnits(val);
    const u = parseFloat(val) || 0;
    const withTax = parseFloat(purUnitPriceWithTax) || 0;
    if (withTax > 0) {
      setPurTotalPriceWithTax((withTax * u).toString());
    }
  };

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
  const [hrEst, setHrEst] = useState(establishments[0]?.id || 'comunal');
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
  const [eleamEst, setEleamEst] = useState(establishments[0]?.id || 'comunal');
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
      const totalAmt = parseFloat(purTotalPriceWithTax) || ((parseFloat(purUnits) || 1) * (parseFloat(purUnitPriceWithTax) || 0)) || 0;
      const createdPur = addPurchase({
        requestNumber: reqNum,
        category: purCategory.trim() || 'Insumos de rehabilitación',
        programId: selectedProgram,
        itemOrService: purItem,
        description: `Adquisición de ${purItem}`,
        estimatedAmount: totalAmt,
        supplier: purSupplier,
        modalidadCompra: purModalidad,
        units: parseFloat(purUnits) || 1,
        unitPriceWithoutTax: parseFloat(purUnitPriceWithoutTax) || undefined,
        unitPriceWithTax: parseFloat(purUnitPriceWithTax) || undefined,
        totalPriceWithTax: totalAmt,
        ceroPapelExpediente: purCeroPapelExp,
        ceroPapelEstado: purCeroPapelEstado,
        referenceLink: purRefLink.trim() ? normalizeUrl(purRefLink) : undefined,
        purchaseOrderNumber: purOCNumber,
        orderSentDate: purOCSentDate,
        orderAcceptedDate: purOCAcceptedDate,
        requestDate: '2026-08-15',
        requiredDate: purReqDate,
        responsible: purResp,
        status: purStatus,
        problemReason: purStatus === 'problema' ? purProblemReason : undefined,
        macroState: purMacroState,
        receptionStatus: purReceptionStatus,
        receptionDate: purReceptionDate || undefined,
        receptionResponsible: purReceptionResponsible || undefined,
        receptionActDoc: purReceptionActDoc || undefined,
        receptionNotes: purReceptionNotes || undefined,
        invoiceStatus: purInvoiceStatus,
        invoiceNumber: purInvoiceNumber || undefined,
        invoiceDate: purInvoiceDate || undefined,
        invoiceAmount: purInvoiceAmount ? parseFloat(purInvoiceAmount) : undefined,
        invoicePaymentDate: purInvoicePaymentDate || undefined,
        invoiceNotes: purInvoiceNotes || undefined,
      });

      // Save attachments to global store if any
      if (purAttachments.length > 0 && createdPur) {
        purAttachments.forEach((att) => {
          addAttachment({
            name: att.name,
            size: att.size,
            type: att.type,
            programId: selectedProgram,
            entityType: 'purchase',
            entityId: createdPur.id,
          });
        });
      }
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

  const getModalTitle = () => {
    switch (activeTab) {
      case 'purchase':
        return 'Crear Solicitud de Compra';
      case 'task':
        return 'Crear Nueva Tarea';
      case 'meeting':
        return 'Agendar Nueva Reunión';
      case 'email':
        return 'Registrar Nuevo Correo / Oficio';
      case 'question':
        return 'Registrar Nueva Pregunta / Duda';
      case 'knowledge':
        return 'Registrar Tip / Conocimiento';
      case 'hr':
        return 'Registrar Personal';
      case 'indicator':
        return 'Crear Nuevo Indicador';
      case 'eleam':
        return 'Registrar Caso ELEAM';
      default:
        return 'Crear Nuevo Registro';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="quick-create-modal"
        className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl rounded-xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shrink-0">
              +
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {getModalTitle()}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden xs:block">Captura rápida en 1 clic — Centro Operativo Quilicura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-3.5 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
            <div className="space-y-4">
              {/* 1. SELECCIÓN DE MACROESTADO */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Macroestado de la Compra (Etapa General)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPurMacroState('por_hacer');
                      setPurStatus('solicitado');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      purMacroState === 'por_hacer'
                        ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-amber-600" />
                        Por hacer
                      </span>
                      {purMacroState === 'por_hacer' && (
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Planificada, presupuestada o solicitada sin inicio administrativo.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPurMacroState('en_ejecucion');
                      if (purStatus === 'solicitado') setPurStatus('en_compra');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      purMacroState === 'en_ejecucion'
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/30 text-blue-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-blue-600" />
                        En ejecución
                      </span>
                      {purMacroState === 'en_ejecucion' && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      OC emitida, despacho, recepción o facturación en curso.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPurMacroState('realizado');
                      setPurStatus('cerrado');
                      setPurReceptionStatus('conforme');
                      if (purInvoiceStatus === 'sin_factura') setPurInvoiceStatus('pagada');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      purMacroState === 'realizado'
                        ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/30 text-emerald-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Realizado
                      </span>
                      {purMacroState === 'realizado' && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Recepción conforme + proceso administrativo y pago cerrados.
                    </p>
                  </button>
                </div>
              </div>

              {/* 2. MICROESTADOS: RECEPCIÓN CONFORME & FACTURACIÓN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2.A RECEPCIÓN */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <PackageCheck className="h-4 w-4 text-emerald-600" />
                      Control de Recepción Conforme
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                      Estado de Recepción Física *
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { value: 'pendiente', label: 'Pendiente', color: 'slate' },
                        { value: 'conforme', label: 'Recepción Conforme', color: 'emerald' },
                        { value: 'con_observaciones', label: 'Con Obs.', color: 'amber' },
                        { value: 'rechazada', label: 'Rechazada', color: 'rose' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const newRec = opt.value as PurchaseReceptionStatus;
                            setPurReceptionStatus(newRec);
                            if (newRec === 'conforme' && !purReceptionDate) {
                              setPurReceptionDate('2026-08-15');
                            }
                            if (newRec === 'conforme' && purInvoiceStatus === 'pagada') {
                              setPurMacroState('realizado');
                              setPurStatus('cerrado');
                            } else if (newRec !== 'pendiente' && purMacroState === 'por_hacer') {
                              setPurMacroState('en_ejecucion');
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                            purReceptionStatus === opt.value
                              ? opt.color === 'emerald'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : opt.color === 'rose'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : opt.color === 'amber'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Fecha de Recepción
                      </label>
                      <input
                        type="date"
                        value={purReceptionDate}
                        onChange={(e) => setPurReceptionDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        N° Acta / Guía Despacho
                      </label>
                      <input
                        type="text"
                        placeholder="ej. ACTA-RC-2026-45"
                        value={purReceptionActDoc}
                        onChange={(e) => setPurReceptionActDoc(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Responsable que Recepcionó
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Klgo. Felipe Santander / Bodega Central"
                      value={purReceptionResponsible}
                      onChange={(e) => setPurReceptionResponsible(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Observaciones de Recepción
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Detalles de inspección física, lote, estado de embalaje..."
                      value={purReceptionNotes}
                      onChange={(e) => setPurReceptionNotes(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* 2.B FACTURACIÓN */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Receipt className="h-4 w-4 text-sky-600" />
                      Control de Facturación y Pago
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                      Estado de Facturación *
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { value: 'sin_factura', label: 'Sin Factura', color: 'slate' },
                        { value: 'recibida', label: 'Factura Recibida', color: 'sky' },
                        { value: 'en_revision', label: 'En Revisión', color: 'amber' },
                        { value: 'pagada', label: 'Pagada', color: 'emerald' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const newInv = opt.value as PurchaseInvoiceStatus;
                            setPurInvoiceStatus(newInv);
                            if ((newInv === 'recibida' || newInv === 'en_revision') && !purInvoiceDate) {
                              setPurInvoiceDate('2026-08-15');
                            }
                            if (newInv === 'pagada' && !purInvoicePaymentDate) {
                              setPurInvoicePaymentDate('2026-08-15');
                            }
                            if (newInv === 'pagada' && purReceptionStatus === 'conforme') {
                              setPurMacroState('realizado');
                              setPurStatus('cerrado');
                            } else if (newInv !== 'sin_factura' && purMacroState === 'por_hacer') {
                              setPurMacroState('en_ejecucion');
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                            purInvoiceStatus === opt.value
                              ? opt.color === 'emerald'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : opt.color === 'sky'
                                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                : opt.color === 'amber'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        N° Folio Factura (SII)
                      </label>
                      <input
                        type="text"
                        placeholder="ej. FAC-104928"
                        value={purInvoiceNumber}
                        onChange={(e) => setPurInvoiceNumber(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Fecha de Factura
                      </label>
                      <input
                        type="date"
                        value={purInvoiceDate}
                        onChange={(e) => setPurInvoiceDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Monto Facturado ($ CLP)
                      </label>
                      <input
                        type="number"
                        placeholder="ej. 3790000"
                        value={purInvoiceAmount}
                        onChange={(e) => setPurInvoiceAmount(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Fecha de Pago
                      </label>
                      <input
                        type="date"
                        value={purInvoicePaymentDate}
                        onChange={(e) => setPurInvoicePaymentDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Notas de Facturación / N° Transferencia
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Comprobante de egreso, visto bueno de finanzas o motivo de retención..."
                      value={purInvoiceNotes}
                      onChange={(e) => setPurInvoiceNotes(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 3. DATOS GENERALES & ECONÓMICOS */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  3. Datos de la Compra, Proveedor & Modalidad
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría de productos/servicios
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Insumos de rehabilitación, Fármacos, Equipamiento menor..."
                    value={purCategory}
                    onChange={(e) => setPurCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>

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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Proveedor Elegido
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Droguería Central S.A."
                      value={purSupplier}
                      onChange={(e) => setPurSupplier(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Modalidad de Compra
                    </label>
                    <select
                      value={purModalidad}
                      onChange={(e) => setPurModalidad(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Convenio Marco">Convenio Marco</option>
                      <option value="Compra Ágil">Compra Ágil</option>
                      <option value="Licitación Pública">Licitación Pública (LP / LE / LQ)</option>
                      <option value="Licitación Privada">Licitación Privada</option>
                      <option value="Trato Directo">Trato Directo</option>
                      <option value="Fondo Fijo">Fondo Fijo</option>
                      <option value="Gran Compra">Gran Compra</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                {/* Valores y Precios con cálculo automático */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Unidades *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={purUnits}
                      onChange={(e) => handleUnitsChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Precio unitario sin IVA
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={purUnitPriceWithoutTax}
                      onChange={(e) => handleWithoutTaxChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Precio unitario con IVA
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={purUnitPriceWithTax}
                      onChange={(e) => handleWithTaxChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                      Precio total con IVA
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={purTotalPriceWithTax}
                      onChange={(e) => setPurTotalPriceWithTax(e.target.value)}
                      className="w-full rounded-lg border border-indigo-300 bg-indigo-50/60 px-2.5 py-1.5 text-xs text-indigo-950 font-mono font-bold"
                      placeholder="$ 0"
                    />
                  </div>
                </div>

                {/* Orden de Compra y Fechas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Orden de Compra
                    </label>
                    <input
                      type="text"
                      placeholder="ej. 2356-45-CM26"
                      value={purOCNumber}
                      onChange={(e) => setPurOCNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha Envío Orden de Compra
                    </label>
                    <input
                      type="date"
                      value={purOCSentDate}
                      onChange={(e) => setPurOCSentDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{getPurchaseDateFieldLabel(purModalidad)}</span>
                    <span className="text-[11px] font-normal text-indigo-600 font-sans">
                      ({purModalidad})
                    </span>
                  </label>
                  <input
                    type="date"
                    value={purReqDate}
                    onChange={(e) => {
                      setPurReqDate(e.target.value);
                      if (purModalidad.toLowerCase().includes('ágil') || purModalidad.toLowerCase().includes('agil')) {
                        setPurOCAcceptedDate(e.target.value);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {purModalidad === 'Compra Ágil' && 'Fecha en que el proveedor acepta la Orden de Compra en Mercado Público.'}
                    {purModalidad === 'Convenio Marco' && 'Fecha en que el decreto de adjudicación queda totalmente tramitado y firmado.'}
                    {purModalidad.toLowerCase().includes('licitación') && 'Fecha de cierre y firma del contrato administrativo.'}
                    {!['Compra Ágil', 'Convenio Marco'].includes(purModalidad) && !purModalidad.toLowerCase().includes('licitación') && 'Fecha clave de formalización o aceptación del proceso de compra.'}
                  </p>
                </div>

                {/* Cero Papel & Enlace */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expediente Cero Papel
                    </label>
                    <input
                      type="text"
                      placeholder="ej. EXP-2026-004512"
                      value={purCeroPapelExp}
                      onChange={(e) => setPurCeroPapelExp(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estado en Cero Papel
                    </label>
                    <input
                      type="text"
                      placeholder="ej. En Firma, Derivado a Adquisiciones, En Trámite..."
                      value={purCeroPapelEstado}
                      onChange={(e) => setPurCeroPapelEstado(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>

                {/* Link de referencia */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Link de Referencia
                    </label>
                    {purRefLink.trim().length > 0 && (
                      <a
                        href={normalizeUrl(purRefLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        <ExternalLink className="h-3 w-3" /> Probar enlace
                      </a>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="ej. www.mercadopublico.cl, google.cl, ficha técnica, o cualquier web"
                      value={purRefLink}
                      onChange={(e) => setPurRefLink(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 pr-9 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                    {purRefLink.trim().length > 0 && (
                      <a
                        href={normalizeUrl(purRefLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir página web"
                        className="absolute right-2 p-1 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Motivo de Traba / Bloqueo */}
                <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1.5">
                  <label className="text-xs font-bold text-rose-800 flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    Causa del Problema / Motivo de Traba o Bloqueo (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={purProblemReason}
                    onChange={(e) => {
                      setPurProblemReason(e.target.value);
                      if (e.target.value.trim()) {
                        setPurStatus('problema');
                      }
                    }}
                    placeholder="Si la compra presenta demora o inconvenientes con el proveedor, descríbalo aquí..."
                    className="w-full rounded-lg border border-rose-300 bg-white p-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Archivos y Documentos Adjuntos */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                    ARCHIVOS Y DOCUMENTOS ADJUNTOS ({purAttachments.length})
                  </span>
                </div>

                {purAttachments.length > 0 ? (
                  <div className="space-y-1.5">
                    {purAttachments.map((att) => (
                      <div key={att.id} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between text-xs bg-slate-50">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate max-w-[220px]">{att.name}</span>
                          <span className="text-[10px] text-slate-400">({(att.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPurAttachments(prev => prev.filter(a => a.id !== att.id))}
                          className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                          title="Quitar archivo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No hay documentos adjuntos aún.</p>
                )}

                {/* Add document input + button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ej. Orden_Compra_Firmada.pdf o Informe_Social.pdf"
                    value={purNewAttachmentName}
                    onChange={(e) => setPurNewAttachmentName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPurAttachment();
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddPurAttachment}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
                  >
                    Adjuntar
                  </button>
                </div>
              </div>
            </div>
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
