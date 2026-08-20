import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Task, 
  Purchase, 
  Indicator, 
  Meeting, 
  MeetingType,
  MeetingStatus,
  CommitmentStatus,
  MeetingAgreement,
  MeetingCommitment,
  MeetingParticipant,
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
  CommunicationType,
  CommunicationStatus,
  CommunicationFollowUpType,
  normalizeCommunicationStatus,
  isEmailOverdue,
  getEmailDueInfo,
  QuestionStatus,
  QuestionCategory,
  getPurchaseDateFieldLabel,
  PurchaseMacroState,
  PurchaseReceptionStatus,
  PurchaseInvoiceStatus,
  getPurchaseEffectiveMacroState,
  getPurchaseAlerts,
  isTaskOverdue,
  isTaskExpiringSoon,
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
  FileText,
  Check,
  Percent,
  Layers,
  Target,
  Maximize2,
  Receipt,
  Truck,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  PackageCheck,
  Info,
  Flame,
  Copy,
  RotateCcw,
  CheckSquare,
  Square,
  History,
  Plus,
  ListChecks,
  FileSignature,
  Users,
  MapPin,
  Building2,
  Mail,
  Send,
  Inbox,
  MessageSquare,
  PhoneCall,
} from 'lucide-react';
import { 
  ProgramBadge, 
  PriorityChip, 
  TaskStatusChip, 
  PurchaseStatusChip, 
  ProgressBar, 
  TrafficLightBadge,
  PurchaseMacroBadge,
  PurchaseReceptionBadge,
  PurchaseInvoiceBadge,
  MeetingTypeBadge,
  MeetingStatusBadge,
  MeetingStatusChip,
  CommitmentStatusChip,
  CommunicationTypeBadge,
  CommunicationStatusChip,
  CommunicationOperationalCategory,
  CommunicationDeadlineNotice,
  CommunicationDueBadge,
  TaskUrgencyChip,
} from './UIComponents';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { ConfirmDialog } from './ConfirmDialog';

const normalizeUrl = (url?: string): string => {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

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
    taskCategories,
    programs,
    currentUser,
    updateTask,
    quickUpdateTaskStatus,
    completeTask,
    reopenTask,
    duplicateTask,
    toggleTaskUrgent,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    purchases,
    updatePurchase,
    indicators,
    updateIndicator,
    recordMeasurement,
    meetings,
    updateMeeting,
    convertCommitmentToTask,
    emails,
    updateEmail,
    addEmailFollowUp,
    deleteEmailFollowUp,
    addEmailAttachment,
    deleteEmailAttachment,
    convertEmailToTask,
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
    deleteAttachment,
    showToast,
  } = useApp();

  // Local editing states
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementPeriod, setMeasurementPeriod] = useState('2026-08');
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistResp, setNewChecklistResp] = useState('');
  const [newEmailFuType, setNewEmailFuType] = useState<CommunicationFollowUpType>('contacto');
  const [newEmailFuNote, setNewEmailFuNote] = useState('');

  // Indicator Full Edit States
  const [indCode, setIndCode] = useState('');
  const [indComponente, setIndComponente] = useState('');
  const [indName, setIndName] = useState('');
  const [indObjetivo, setIndObjetivo] = useState('');
  const [indCorte, setIndCorte] = useState<'1° corte' | '2° corte' | '3° corte'>('1° corte');
  const [indNumDesc, setIndNumDesc] = useState('');
  const [indNumPorc, setIndNumPorc] = useState('');
  const [indDenDesc, setIndDenDesc] = useState('');
  const [indDenPorc, setIndDenPorc] = useState('');
  const [indPesoRelativo, setIndPesoRelativo] = useState('');
  const [indMedioNum, setIndMedioNum] = useState('');
  const [indMedioDen, setIndMedioDen] = useState('');
  const [indMetaAnualTexto, setIndMetaAnualTexto] = useState('');
  const [indMetaAnualPorc, setIndMetaAnualPorc] = useState('');
  const [indCurrent, setIndCurrent] = useState('');
  const [indFechaCorte, setIndFechaCorte] = useState('2026-08-15');
  const [indSavedSuccess, setIndSavedSuccess] = useState(false);

  // Meeting Interactive Edit States
  const [newAgrText, setNewAgrText] = useState('');
  const [newAgrType, setNewAgrType] = useState<'acuerdo' | 'definicion' | 'resolucion'>('acuerdo');
  const [newComDesc, setNewComDesc] = useState('');
  const [newComResp, setNewComResp] = useState('');
  const [newComDeadline, setNewComDeadline] = useState('2026-08-25');
  const [newComPriority, setNewComPriority] = useState<PriorityLevel>('alta');
  const [newPartName, setNewPartName] = useState('');
  const [newPartRole, setNewPartRole] = useState('');

  // Internal deletion confirmation modal state with OK requirement
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Local edit drafts for each entity type (only saves when clicking Guardar)
  const [draftPurchase, setDraftPurchase] = useState<Purchase | null>(null);
  const [draftTask, setDraftTask] = useState<Task | null>(null);
  const [draftMeeting, setDraftMeeting] = useState<Meeting | null>(null);
  const [draftEmail, setDraftEmail] = useState<PendingEmail | null>(null);
  const [draftQuestion, setDraftQuestion] = useState<Question | null>(null);
  const [draftKnowledge, setDraftKnowledge] = useState<KnowledgeItem | null>(null);
  const [draftHR, setDraftHR] = useState<HRRecord | null>(null);
  const [draftEleam, setDraftEleam] = useState<EleamCase | null>(null);

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

  // Initialize or real-time sync draft values when drawer is open
  useEffect(() => {
    if (isOpen) {
      if (entityType === 'purchase') {
        const found = purchases.find((p) => p.id === entityId);
        setDraftPurchase((prev) => (!prev || prev.id !== entityId ? (found ? { ...found } : null) : (found ? { ...prev, ...found } : prev)));
      } else if (entityType === 'task') {
        const found = tasks.find((t) => t.id === entityId);
        setDraftTask((prev) => (!prev || prev.id !== entityId ? (found ? { ...found } : null) : (found ? { ...prev, status: found.status, isUrgent: found.isUrgent, priority: found.priority, dueDate: found.dueDate, responsible: found.responsible, completedAt: found.completedAt } : prev)));
      } else if (entityType === 'meeting') {
        const found = meetings.find((m) => m.id === entityId);
        setDraftMeeting((prev) => (!prev || prev.id !== entityId ? (found ? JSON.parse(JSON.stringify(found)) : null) : (found ? { ...prev, ...found } : prev)));
        setNewAgrText('');
        setNewAgrType('acuerdo');
        setNewComDesc('');
        setNewComResp(currentUser?.name || 'Klaus Bauer');
        setNewComDeadline('2026-08-25');
        setNewComPriority('alta');
        setNewPartName('');
        setNewPartRole('');
      } else if (entityType === 'email') {
        const found = emails.find((e) => e.id === entityId);
        setDraftEmail((prev) => (!prev || prev.id !== entityId ? (found ? { ...found } : null) : (found ? { ...prev, ...found } : prev)));
      } else if (entityType === 'question') {
        const found = questions.find((q) => q.id === entityId);
        setDraftQuestion((prev) => (!prev || prev.id !== entityId ? (found ? { ...found } : null) : (found ? { ...prev, ...found } : prev)));
      } else if (entityType === 'knowledge') {
        const found = knowledge.find((k) => k.id === entityId);
        setDraftKnowledge((prev) => (!prev || prev.id !== entityId ? (found ? { ...found } : null) : (found ? { ...prev, ...found } : prev)));
      } else if (entityType === 'hr') {
        const found = hrRecords.find((h) => h.id === entityId);
        setDraftHR((prev) => (!prev || prev.id !== entityId ? (found ? { ...found } : null) : (found ? { ...prev, ...found } : prev)));
      } else if (entityType === 'eleam') {
        const found = eleamCases.find((e) => e.id === entityId);
        setDraftEleam((prev) => (!prev || prev.id !== entityId ? (found ? { ...found } : null) : (found ? { ...prev, ...found } : prev)));
      }
    } else {
      setDraftPurchase(null);
      setDraftTask(null);
      setDraftMeeting(null);
      setDraftEmail(null);
      setDraftQuestion(null);
      setDraftKnowledge(null);
      setDraftHR(null);
      setDraftEleam(null);
    }
  }, [isOpen, entityType, entityId, tasks, purchases, meetings, emails, questions, knowledge, hrRecords, eleamCases]);

  const updateDraftPurchase = (updates: Partial<Purchase>) => {
    setDraftPurchase((prev) => (prev ? { ...prev, ...updates } : null));
  };
  const updateDraftTask = (updates: Partial<Task>) => {
    setDraftTask((prev) => (prev ? { ...prev, ...updates } : null));
  };
  const updateDraftMeeting = (updates: Partial<Meeting>) => {
    setDraftMeeting((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleAddMeetingAgreement = () => {
    if (!newAgrText.trim() || !draftMeeting) return;
    const currentAgreements: MeetingAgreement[] = Array.isArray(draftMeeting.agreements)
      ? [...draftMeeting.agreements]
      : typeof draftMeeting.agreements === 'string' && draftMeeting.agreements
      ? [{ id: `agr_orig_${Date.now()}`, meetingId: draftMeeting.id, description: draftMeeting.agreements, decisionType: 'acuerdo' }]
      : [];

    const newAgr: MeetingAgreement = {
      id: `agr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      meetingId: draftMeeting.id,
      description: newAgrText.trim(),
      decisionType: newAgrType,
      orderIndex: currentAgreements.length + 1,
      createdAt: new Date().toISOString(),
    };

    setDraftMeeting({
      ...draftMeeting,
      agreements: [...currentAgreements, newAgr],
    });
    setNewAgrText('');
  };

  const handleRemoveMeetingAgreement = (agrId: string | number) => {
    if (!draftMeeting) return;
    const currentAgreements = Array.isArray(draftMeeting.agreements) ? draftMeeting.agreements : [];
    setDraftMeeting({
      ...draftMeeting,
      agreements: currentAgreements.filter((a, idx) => (a.id ? a.id !== agrId : idx !== agrId)),
    });
  };

  const handleAddMeetingCommitment = () => {
    if (!newComDesc.trim() || !draftMeeting) return;
    const currentCommitments = Array.isArray(draftMeeting.commitments) ? [...draftMeeting.commitments] : [];
    const newCom: MeetingCommitment = {
      id: `com_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      meetingId: draftMeeting.id,
      description: newComDesc.trim(),
      responsible: newComResp.trim() || currentUser.name,
      deadline: newComDeadline || '2026-08-25',
      priority: newComPriority || 'alta',
      isUrgent: newComPriority === 'critica',
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDraftMeeting({
      ...draftMeeting,
      commitments: [...currentCommitments, newCom],
    });
    setNewComDesc('');
  };

  const handleToggleMeetingCommitmentDone = (comId: string) => {
    if (!draftMeeting) return;
    const currentCommitments = Array.isArray(draftMeeting.commitments) ? draftMeeting.commitments : [];
    setDraftMeeting({
      ...draftMeeting,
      commitments: currentCommitments.map((c) => {
        if (c.id !== comId) return c;
        const isDone = c.status === 'cumplido' || c.status === 'completado';
        const nextStatus: CommitmentStatus = isDone ? 'pendiente' : 'cumplido';
        return {
          ...c,
          status: nextStatus,
          completedAt: nextStatus === 'cumplido' ? new Date().toISOString() : undefined,
          completedBy: nextStatus === 'cumplido' ? currentUser.name : undefined,
        };
      }),
    });
  };

  const handleChangeMeetingCommitmentStatus = (comId: string, status: CommitmentStatus) => {
    if (!draftMeeting) return;
    const currentCommitments = Array.isArray(draftMeeting.commitments) ? draftMeeting.commitments : [];
    const isDone = status === 'cumplido' || status === 'completado';
    setDraftMeeting({
      ...draftMeeting,
      commitments: currentCommitments.map((c) => {
        if (c.id !== comId) return c;
        return {
          ...c,
          status,
          completedAt: isDone ? (c.completedAt || new Date().toISOString()) : undefined,
          completedBy: isDone ? (c.completedBy || currentUser.name) : undefined,
        };
      }),
    });
  };

  const handleRemoveMeetingCommitment = (comId: string) => {
    if (!draftMeeting) return;
    const currentCommitments = Array.isArray(draftMeeting.commitments) ? draftMeeting.commitments : [];
    setDraftMeeting({
      ...draftMeeting,
      commitments: currentCommitments.filter((c) => c.id !== comId),
    });
  };

  const handleAddMeetingParticipant = () => {
    if (!newPartName.trim() || !draftMeeting) return;
    const currentParts = Array.isArray(draftMeeting.participants) ? [...draftMeeting.participants] : [];
    const newPart: MeetingParticipant = {
      id: `part_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: newPartName.trim(),
      role: newPartRole.trim() || undefined,
      attended: true,
    };
    setDraftMeeting({
      ...draftMeeting,
      participants: [...currentParts, newPart],
    });
    setNewPartName('');
    setNewPartRole('');
  };

  const handleRemoveMeetingParticipant = (index: number) => {
    if (!draftMeeting) return;
    const currentParts = Array.isArray(draftMeeting.participants) ? [...draftMeeting.participants] : [];
    setDraftMeeting({
      ...draftMeeting,
      participants: currentParts.filter((_, idx) => idx !== index),
    });
  };

  const updateDraftEmail = (updates: Partial<PendingEmail>) => {
    setDraftEmail((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleAddEmailFollowUp = () => {
    if (!newEmailFuNote.trim() || !draftEmail) return;
    const newFu = {
      id: `fu_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      communicationId: draftEmail.id,
      type: newEmailFuType,
      note: newEmailFuNote.trim(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    setDraftEmail({
      ...draftEmail,
      followUps: [newFu, ...(draftEmail.followUps || [])],
    });
    setNewEmailFuNote('');
  };

  const handleRemoveEmailFollowUp = (fuId: string) => {
    if (!draftEmail) return;
    setDraftEmail({
      ...draftEmail,
      followUps: (draftEmail.followUps || []).filter((f) => f.id !== fuId),
    });
  };

  const handleRemoveEmailAttachment = (attId: string) => {
    if (!draftEmail) return;
    setDraftEmail({
      ...draftEmail,
      attachments: (draftEmail.attachments || []).filter((a) => a.id !== attId),
    });
  };

  const updateDraftQuestion = (updates: Partial<Question>) => {
    setDraftQuestion((prev) => (prev ? { ...prev, ...updates } : null));
  };
  const updateDraftKnowledge = (updates: Partial<KnowledgeItem>) => {
    setDraftKnowledge((prev) => (prev ? { ...prev, ...updates } : null));
  };
  const updateDraftHR = (updates: Partial<HRRecord>) => {
    setDraftHR((prev) => (prev ? { ...prev, ...updates } : null));
  };
  const updateDraftEleam = (updates: Partial<EleamCase>) => {
    setDraftEleam((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleSaveAll = () => {
    if (entityType === 'purchase' && draftPurchase) {
      updatePurchase(draftPurchase.id, draftPurchase);
    } else if (entityType === 'task' && draftTask) {
      updateTask(draftTask.id, draftTask);
    } else if (entityType === 'meeting' && draftMeeting) {
      updateMeeting(draftMeeting.id, draftMeeting);
    } else if (entityType === 'email' && draftEmail) {
      updateEmail(draftEmail.id, draftEmail);
    } else if (entityType === 'question' && draftQuestion) {
      updateQuestion(draftQuestion.id, draftQuestion);
    } else if (entityType === 'knowledge' && draftKnowledge) {
      updateKnowledge(draftKnowledge.id, draftKnowledge);
    } else if (entityType === 'hr' && draftHR) {
      updateHRRecord(draftHR.id, draftHR);
    } else if (entityType === 'eleam' && draftEleam) {
      updateEleamCase(draftEleam.id, draftEleam);
    }
    onClose();
  };

  // Initialize indicator edit values when opening an indicator
  useEffect(() => {
    if (indicator) {
      setIndCode(indicator.code || 'Indicador 1');
      setIndComponente(indicator.componente || '');
      setIndName(indicator.name || '');
      setIndObjetivo(indicator.objetivoEspecifico || indicator.description || '');
      setIndCorte((indicator.corteSeleccionado as any) || '1° corte');
      setIndNumDesc(indicator.numeradorDescripcion || '');
      setIndNumPorc(indicator.numeradorValor !== undefined ? String(indicator.numeradorValor) : '');
      setIndDenDesc(indicator.denominadorDescripcion || '');
      setIndDenPorc(indicator.denominadorValor !== undefined ? String(indicator.denominadorValor) : '');
      setIndPesoRelativo(indicator.pesoRelativo !== undefined ? String(indicator.pesoRelativo) : '');
      setIndMedioNum(indicator.medioVerificacionNumerador || '');
      setIndMedioDen(indicator.medioVerificacionDenominador || '');
      setIndMetaAnualTexto(indicator.metaCumplimientoAnualTexto || '');
      setIndMetaAnualPorc(
        indicator.metaCumplimientoAnualPorcentaje !== undefined
          ? String(indicator.metaCumplimientoAnualPorcentaje)
          : String(indicator.annualTarget || 100)
      );
      setIndCurrent(String(indicator.currentResult ?? 0));
      setIndFechaCorte(indicator.cutoffDate || '2026-08-15');
      setIndSavedSuccess(false);
    }
  }, [indicator?.id]);

  if (!isOpen || !entityType || !entityId) return null;

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

    if (entityType === 'email' && draftEmail) {
      const newAtt = {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        communicationId: draftEmail.id,
        name: newAttachmentName.trim(),
        size: `${Math.floor(Math.random() * 800 + 120)} KB`,
        type: 'application/pdf',
        url: '#',
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser.name,
      };
      setDraftEmail({
        ...draftEmail,
        attachments: [newAtt, ...(draftEmail.attachments || [])],
      });
      setNewAttachmentName('');
      return;
    }

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

  const handleSaveIndicator = () => {
    if (!indicator) return;
    const numAnnual = parseFloat(indMetaAnualPorc) || indicator.annualTarget;
    const numCurrent = parseFloat(indCurrent) || indicator.currentResult;

    const cutData = {
      target: numAnnual,
      result: numCurrent,
      date: indFechaCorte,
      source: indMedioNum || indicator.source,
      notes: indObjetivo || undefined,
    };

    updateIndicator(indicator.id, {
      code: indCode.trim() || indicator.code,
      name: indName.trim() || indicator.name,
      description: indObjetivo.trim() || indicator.description,
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
      annualTarget: numAnnual,
      periodTarget: numAnnual,
      currentResult: numCurrent,
      cutoffDate: indFechaCorte,
      source: indMedioNum || indicator.source,
      corte1: indCorte === '1° corte' ? cutData : indicator.corte1,
      corte2: indCorte === '2° corte' ? cutData : indicator.corte2,
      corte3: indCorte === '3° corte' ? cutData : indicator.corte3,
    });

    setIndSavedSuccess(true);
    showToast('Indicador guardado exitosamente', 'success');
    setTimeout(() => setIndSavedSuccess(false), 3000);
  };

  // ==========================================
  // FULL SCREEN VIEW FOR INDICATORS
  // ==========================================
  if (entityType === 'indicator' && indicator) {
    const complianceRate = indicator.annualTarget > 0 
      ? Math.round((indicator.currentResult / indicator.annualTarget) * 100) 
      : 0;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-sm p-0 sm:p-3 md:p-6 flex items-center justify-center animate-in fade-in duration-150">
        <div
          id="indicator-fullscreen-modal"
          className="w-full h-full sm:h-[96vh] max-w-7xl bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 flex flex-col overflow-hidden"
        >
          {/* Top Header - Mobile First */}
          <div className="p-3 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="shrink-0 flex items-center gap-1.5">
                <ProgramBadge programId={currentProgramId} />
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg shrink-0">
                  {indicator.code}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 truncate">
                  {indicator.name}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
                  {indicator.componente || 'Ficha Técnica de Indicador y Cumplimiento Ministerial'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <button
                type="button"
                onClick={handleSaveIndicator}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all min-h-[40px]"
              >
                {indSavedSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>¡Guardado!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onDeleteRequest('indicator', indicator.id)}
                className="rounded-xl border border-rose-200 bg-rose-50/50 p-2 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Eliminar indicador"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Cerrar ventana"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body Content - Responsive Grid (Mobile 1 Col, Desktop 12 Cols) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              
              {/* Left Column: Full Technical Form (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Target className="h-4 w-4 text-indigo-600" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ficha Técnica y Parámetros del Indicador
                    </h2>
                  </div>

                  {/* Componente */}
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

                  {/* Identificador, Indicador & Corte */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Identificador *
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Indicador 1"
                        value={indCode}
                        onChange={(e) => setIndCode(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nombre del Indicador *
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Cobertura de atenciones de rehabilitación integral"
                        value={indName}
                        onChange={(e) => setIndName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Corte Seleccionado
                      </label>
                      <select
                        value={indCorte}
                        onChange={(e) => setIndCorte(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="1° corte">1° corte</option>
                        <option value="2° corte">2° corte</option>
                        <option value="3° corte">3° corte</option>
                      </select>
                    </div>
                  </div>

                  {/* Objetivo Específico */}
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

                  {/* Numerador */}
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

                  {/* Denominador */}
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

                  {/* Peso Relativo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Peso Relativo en %
                    </label>
                    <div className="relative max-w-full sm:max-w-xs">
                      <input
                        type="number"
                        step="any"
                        placeholder="ej. 25"
                        value={indPesoRelativo}
                        onChange={(e) => setIndPesoRelativo(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>

                  {/* Medios de Verificación */}
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

                  {/* Meta Anual Texto */}
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

                  {/* Metas y Resultados en % */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Meta Anual en % *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          required
                          value={indMetaAnualPorc}
                          onChange={(e) => setIndMetaAnualPorc(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                          value={indCurrent}
                          onChange={(e) => setIndCurrent(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-bold text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Fecha de Corte *
                      </label>
                      <input
                        type="date"
                        value={indFechaCorte}
                        onChange={(e) => setIndFechaCorte(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Performance, Measurements & Attachments (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Visual Summary Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Resumen de Cortes y Desempeño
                    </span>
                    <TrafficLightBadge
                      current={indicator.currentResult}
                      target={indicator.annualTarget}
                      direction={indicator.direction}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Meta Anual</span>
                      <span className="text-xs font-bold text-slate-800">{indicator.annualTarget} %</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">1° Corte</span>
                      <span className="text-xs font-bold text-slate-800 truncate block">
                        {indicator.corte1 ? `${indicator.corte1.result} / ${indicator.corte1.target}%` : `${indicator.currentResult} / ${indicator.periodTarget}%`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">2° Corte</span>
                      <span className="text-xs font-bold text-indigo-600 truncate block">
                        {indicator.corte2 ? `${indicator.corte2.result} / ${indicator.corte2.target}%` : `Meta: ${indicator.annualTarget}%`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">Cumplimiento Acumulado</span>
                      <span className="text-slate-900 font-bold">{complianceRate}%</span>
                    </div>
                    <ProgressBar
                      current={indicator.currentResult}
                      target={indicator.annualTarget}
                      direction={indicator.direction}
                    />
                  </div>
                </div>

                {/* Record New Measurement */}
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span>Registrar Nuevo Corte / Medición</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">Resultado Numérico (%)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="ej. 85"
                        value={measurementValue}
                        onChange={(e) => setMeasurementValue(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">Período / Corte</label>
                      <input
                        type="text"
                        value={measurementPeriod}
                        onChange={(e) => setMeasurementPeriod(e.target.value)}
                        placeholder="ej. 2026-08 o 2° Corte"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">Observaciones / Respaldo REM</label>
                    <input
                      type="text"
                      placeholder="ej. Validado con REM P01 y registro Rayen"
                      value={measurementNotes}
                      onChange={(e) => setMeasurementNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!measurementValue) return;
                      recordMeasurement(indicator.id, parseFloat(measurementValue), measurementPeriod, measurementNotes);
                      setMeasurementValue('');
                      setMeasurementNotes('');
                      showToast('Medición guardada en el historial', 'success');
                    }}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-xs min-h-[40px]"
                  >
                    Guardar Medición en Historial
                  </button>
                </div>

                {/* History of measurements */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Historial de Mediciones ({indicator.measurements.length})
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {indicator.measurements.length > 0 ? (
                      indicator.measurements.map((m) => (
                        <div key={m.id} className="p-2.5 border border-slate-200 rounded-xl flex items-center justify-between text-xs bg-slate-50/50">
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-slate-800">{m.period}</span>
                            <span className="text-[11px] text-slate-500 ml-2">({formatDate(m.date)})</span>
                            {m.notes && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{m.notes}</p>}
                          </div>
                          <div className="font-bold text-slate-900 text-right shrink-0">
                            <div>{m.result} / {m.target} %</div>
                            <span className="text-[10px] text-slate-400 font-normal">{m.registeredBy}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">Sin mediciones previas registradas.</p>
                    )}
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                      Medios de Verificación Adjuntos ({entityAttachments.length})
                    </span>
                  </div>

                  {entityAttachments.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {entityAttachments.map((att) => (
                        <div key={att.id} className="p-2 border border-slate-200 rounded-xl flex items-center justify-between text-xs bg-slate-50">
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{att.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{(att.size / 1024).toFixed(0)} KB</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No hay documentos de verificación adjuntos.</p>
                  )}

                  <form onSubmit={handleAddFile} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ej. Reporte_DEIS_Corte1.pdf"
                      value={newAttachmentName}
                      onChange={(e) => setNewAttachmentName(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors shrink-0"
                    >
                      Adjuntar
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>

          {/* Footer - Mobile First */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
              Centro Operativo Quilicura • Ficha completa de Indicador
            </span>
            <div className="flex items-center justify-stretch sm:justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveIndicator}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <Save className="h-4 w-4" />
                <span>Guardar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveIndicator();
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-sm min-h-[40px]"
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODAL VIEW FOR ENTITIES (CENTERED & EXPANDED)
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 flex items-center justify-center animate-in fade-in duration-150">
      <div
        id="entity-drawer-panel"
        className="w-full h-full sm:h-auto sm:max-h-[94vh] max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col justify-between overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ProgramBadge programId={currentProgramId} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Detalle de {
                entityType === 'purchase' ? 'Compra' :
                entityType === 'task' ? 'Tarea' :
                entityType === 'meeting' ? 'Reunión' :
                entityType === 'email' ? 'Correo / Acción' :
                entityType === 'indicator' ? 'Indicador' :
                entityType === 'hr' ? 'Recursos Humanos' :
                entityType === 'budget' ? 'Presupuesto' :
                entityType === 'question' ? 'Pregunta' :
                entityType === 'knowledge' ? 'Conocimiento' :
                entityType === 'eleam' ? 'Caso ELEAM' : entityType
              }
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
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
            {/* TASK DETAILS */}
            {task && (() => {
              const curTask = draftTask || task;
              const isOverdue = isTaskOverdue(curTask);
              const isDone = ['terminada', 'completada'].includes(curTask.status);
              const checklist = curTask.checklist || [];
              const completedChecklist = checklist.filter((c) => c.isCompleted).length;
              const checklistPercent = checklist.length > 0 ? Math.round((completedChecklist / checklist.length) * 100) : 0;

              return (
                <div className="space-y-6">
                  {/* Status, Urgency & Overdue Alert Banner */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      {/* 3 Manual State Buttons */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
                        <button
                          type="button"
                          onClick={() => {
                            updateDraftTask({ status: 'por_hacer' });
                            if (curTask.id) {
                              quickUpdateTaskStatus(curTask.id, 'por_hacer');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            curTask.status === 'por_hacer' || curTask.status === 'pendiente'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Pendiente
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateDraftTask({ status: 'en_ejecucion' });
                            if (curTask.id) {
                              quickUpdateTaskStatus(curTask.id, 'en_ejecucion');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            curTask.status === 'en_ejecucion' || curTask.status === 'en_curso' || curTask.status === 'bloqueada'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          En ejecución
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateDraftTask({ 
                              status: 'terminada',
                              completedAt: '2026-08-15'
                            });
                            if (curTask.id) {
                              quickUpdateTaskStatus(curTask.id, 'terminada');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Completado
                        </button>
                      </div>

                      {/* Urgency Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextUrgent = !curTask.isUrgent;
                          updateDraftTask({ isUrgent: nextUrgent, priority: nextUrgent ? 'critica' : 'media' });
                          if (curTask.id) {
                            updateTask(curTask.id, { isUrgent: nextUrgent, priority: nextUrgent ? 'critica' : 'media' }, true);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          curTask.isUrgent
                            ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Flame className={`h-4 w-4 ${curTask.isUrgent ? 'fill-rose-500 text-rose-600' : 'text-slate-400'}`} />
                        <span>{curTask.isUrgent ? 'Tarea Urgente' : 'Marcar Urgente'}</span>
                      </button>
                    </div>

                    {/* Overdue Warning Alert */}
                    {isOverdue && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                        <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Tarea Vencida: </span>
                          <span>La fecha límite era el {formatDate(curTask.dueDate)}. Requiere acción o actualización inmediata.</span>
                        </div>
                      </div>
                    )}

                    {/* Origin info banner if exists */}
                    {curTask.origin && curTask.origin !== 'Manual' && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Origen de la tarea: <strong>{curTask.origin}</strong></span>
                        </div>
                        {curTask.originLabel && (
                          <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                            {curTask.originLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main Fields Form */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Datos Principales de la Tarea
                    </span>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Título de la Tarea *
                      </label>
                      <input
                        type="text"
                        required
                        value={curTask.title}
                        onChange={(e) => updateDraftTask({ title: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Description / Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Descripción y Observaciones Operativas
                      </label>
                      <textarea
                        rows={3}
                        value={curTask.description || ''}
                        onChange={(e) => updateDraftTask({ description: e.target.value })}
                        placeholder="Instrucciones detalladas, acuerdos previos o notas de contexto..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Program, Subprogram, Category, Priority Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Programa de Salud
                        </label>
                        <select
                          value={curTask.programId}
                          onChange={(e) => updateDraftTask({ programId: e.target.value as any })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                        >
                          {programs.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.shortName} ({p.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Subprograma / Componente
                        </label>
                        <input
                          type="text"
                          value={curTask.subprogramId || ''}
                          onChange={(e) => updateDraftTask({ subprogramId: e.target.value })}
                          placeholder="ej. Rehabilitación Integral, Sala ERA/IRA..."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Categoría de Tarea
                        </label>
                        <select
                          value={curTask.category || 'General'}
                          onChange={(e) => updateDraftTask({ category: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                        >
                          {taskCategories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nivel de Prioridad
                        </label>
                        <select
                          value={curTask.priority}
                          onChange={(e) => updateDraftTask({ priority: e.target.value as PriorityLevel })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                        >
                          <option value="critica">Crítica</option>
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Responsable Asignado
                        </label>
                        <input
                          type="text"
                          value={curTask.responsible || ''}
                          onChange={(e) => updateDraftTask({ responsible: e.target.value })}
                          placeholder="Nombre y cargo del responsable..."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Fecha Límite / Vencimiento *
                        </label>
                        <input
                          type="date"
                          required
                          value={curTask.dueDate}
                          onChange={(e) => updateDraftTask({ dueDate: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checklist / Subtareas Section */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <ListChecks className="h-4 w-4 text-indigo-600" />
                        Checklist de Subtareas ({completedChecklist}/{checklist.length})
                      </span>
                      {checklist.length > 0 && (
                        <span className="text-xs font-bold text-indigo-600">{checklistPercent}%</span>
                      )}
                    </div>

                    {/* Progress bar */}
                    {checklist.length > 0 && (
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${checklistPercent}%` }}
                        />
                      </div>
                    )}

                    {/* Checklist items */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {checklist.length > 0 ? (
                        checklist.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs"
                          >
                            <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                              <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={() => toggleChecklistItem(curTask.id, item.id)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0"
                              />
                              <span
                                className={`font-medium text-slate-800 truncate ${
                                  item.isCompleted ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {item.title}
                              </span>
                            </label>
                            {item.responsible && (
                              <span className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded shrink-0">
                                {item.responsible}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeChecklistItem(curTask.id, item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic py-1">Sin subtareas registradas.</p>
                      )}
                    </div>

                    {/* Add checklist item */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Nueva subtarea (ej. Revisar firmas, validar con REM)..."
                        value={newChecklistTitle}
                        onChange={(e) => setNewChecklistTitle(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newChecklistTitle.trim()) {
                            e.preventDefault();
                            addChecklistItem(curTask.id, newChecklistTitle.trim());
                            setNewChecklistTitle('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newChecklistTitle.trim()) {
                            addChecklistItem(curTask.id, newChecklistTitle.trim());
                            setNewChecklistTitle('');
                          }
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>

                  {/* Metadata & Audit Trail */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5 text-slate-500" />
                      Trazabilidad y Fechas del Sistema
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Fecha Creación</span>
                        <strong className="text-slate-700">{formatDate(curTask.createdAt)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Creado Por</span>
                        <strong className="text-slate-700">{curTask.createdBy || 'Sistema'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Última Modif.</span>
                        <strong className="text-slate-700">{formatDate(curTask.updatedAt)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Fecha Término</span>
                        <strong className="text-slate-700">{curTask.completedAt ? formatDate(curTask.completedAt) : 'Pendiente'}</strong>
                      </div>
                    </div>

                    {/* Audit History Timeline if exists */}
                    {curTask.history && curTask.history.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-600 block">Historial de Cambios ({curTask.history.length})</span>
                        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                          {curTask.history.map((h, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] space-y-0.5">
                              <div className="flex items-center justify-between text-slate-500">
                                <span className="font-semibold text-slate-700">{h.user}</span>
                                <span>{formatDateTime(h.timestamp)}</span>
                              </div>
                              <p className="text-slate-600">{h.details}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons inside Drawer */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        duplicateTask(curTask.id);
                        showToast('Copia de tarea creada', 'success');
                        onClose();
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Duplicar Tarea</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isDone) {
                          reopenTask(curTask.id);
                        } else {
                          completeTask(curTask.id);
                        }
                        onClose();
                      }}
                      className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                        isDone
                          ? 'bg-slate-800 hover:bg-slate-900'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {isDone ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>{isDone ? 'Reabrir Tarea' : 'Marcar como Terminada'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* PURCHASE DETAILS */}
            {purchase && (() => {
              const curPur = draftPurchase || purchase;
              const currentMacro = curPur.macroState || getPurchaseEffectiveMacroState(curPur);
              const alerts = getPurchaseAlerts(curPur);
              const reception = curPur.receptionStatus || 'pendiente';
              const invoice = curPur.invoiceStatus || 'sin_factura';

              return (
                <div className="space-y-5">
                  {/* Header & Badges */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {curPur.category || 'Insumos de rehabilitación'}
                        </span>
                        <span className="text-xs font-mono text-slate-500 font-semibold">
                          {curPur.requestNumber}
                        </span>
                      </div>
                      
                      {/* 3 Manual Macro State Buttons with immediate sync */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
                        <button
                          type="button"
                          onClick={() => {
                            updateDraftPurchase({
                              macroState: 'pendiente',
                              status: 'solicitado',
                              receptionStatus: 'pendiente',
                              invoiceStatus: 'sin_factura',
                            });
                            if (curPur.id) {
                              updatePurchase(curPur.id, {
                                macroState: 'pendiente',
                                status: 'solicitado',
                                receptionStatus: 'pendiente',
                                invoiceStatus: 'sin_factura',
                              });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentMacro === 'pendiente'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ⏳ Pendiente
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateDraftPurchase({
                              macroState: 'en_ejecucion',
                              status: 'en_compra',
                            });
                            if (curPur.id) {
                              updatePurchase(curPur.id, {
                                macroState: 'en_ejecucion',
                                status: 'en_compra',
                              });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentMacro === 'en_ejecucion'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          🔄 En ejecución
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const todayIso = new Date().toISOString().split('T')[0];
                            updateDraftPurchase({
                              macroState: 'completado',
                              status: 'recepcionado',
                              receptionStatus: curPur.receptionStatus === 'rechazada' ? 'rechazada' : 'conforme',
                              receptionDate: curPur.receptionDate || todayIso,
                            });
                            if (curPur.id) {
                              updatePurchase(curPur.id, {
                                macroState: 'completado',
                                status: 'recepcionado',
                                receptionStatus: curPur.receptionStatus === 'rechazada' ? 'rechazada' : 'conforme',
                                receptionDate: curPur.receptionDate || todayIso,
                              });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentMacro === 'completado' || currentMacro === 'realizado'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ✅ Completado
                        </button>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {curPur.itemOrService || curPur.description}
                      </h2>
                      {curPur.supplier && (
                        <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>Proveedor: <strong className="text-slate-800">{curPur.supplier}</strong></span>
                        </p>
                      )}
                    </div>

                    {/* Operational Alerts banner if any */}
                    {alerts.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        {alerts.map((al, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs ${
                              al.severity === 'critica'
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : al.severity === 'alta'
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                            }`}
                          >
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-bold">{al.title}: </span>
                              <span>{al.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 1. DETALLES GENERALES Y ECONÓMICOS (PUNTO 1) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      1. Datos de la Compra, Proveedor & Modalidad
                    </span>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Categoría de productos/servicios
                      </label>
                      <input
                        type="text"
                        value={curPur.category || ''}
                        onChange={(e) => updateDraftPurchase({ category: e.target.value })}
                        placeholder="ej. Insumos de rehabilitación, Fármacos, Equipamiento menor..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Producto o Servicio Solicitado *
                      </label>
                      <input
                        type="text"
                        required
                        value={curPur.itemOrService || ''}
                        onChange={(e) => updateDraftPurchase({ 
                          itemOrService: e.target.value,
                          description: `Adquisición de ${e.target.value}`
                        })}
                        placeholder="ej. Insumos de Curación Avanzada y Apósito Hidrocoloide"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Proveedor Elegido
                        </label>
                        <input
                          type="text"
                          value={curPur.supplier || ''}
                          onChange={(e) => updateDraftPurchase({ supplier: e.target.value })}
                          placeholder="ej. Droguería Central S.A."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Modalidad de Compra
                        </label>
                        <select
                          value={curPur.modalidadCompra || 'Convenio marco'}
                          onChange={(e) => updateDraftPurchase({ modalidadCompra: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="Compra ágil">Compra ágil</option>
                          <option value="Convenio marco">Convenio marco</option>
                          <option value="Licitación pública">Licitación pública</option>
                          <option value="Licitación privada">Licitación privada</option>
                          <option value="Trato directo">Trato directo</option>
                          <option value="Gran compra">Gran compra</option>
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
                          value={curPur.units || 1}
                          onChange={(e) => {
                            const u = parseFloat(e.target.value) || 1;
                            const withTax = curPur.unitPriceWithTax || 0;
                            const total = withTax > 0 ? withTax * u : (curPur.totalPriceWithTax || 0);
                            updateDraftPurchase({ 
                              units: u, 
                              totalPriceWithTax: total,
                              estimatedAmount: total
                            });
                          }}
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
                          value={curPur.unitPriceWithoutTax || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const withTax = Math.round(val * 1.19);
                            const u = curPur.units || 1;
                            const total = withTax * u;
                            updateDraftPurchase({
                              unitPriceWithoutTax: val,
                              unitPriceWithTax: withTax,
                              totalPriceWithTax: total,
                              estimatedAmount: total
                            });
                          }}
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
                          value={curPur.unitPriceWithTax || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const withoutTax = Math.round(val / 1.19);
                            const u = curPur.units || 1;
                            const total = val * u;
                            updateDraftPurchase({
                              unitPriceWithTax: val,
                              unitPriceWithoutTax: withoutTax,
                              totalPriceWithTax: total,
                              estimatedAmount: total
                            });
                          }}
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
                          value={curPur.totalPriceWithTax || ''}
                          onChange={(e) => {
                            const total = parseFloat(e.target.value) || 0;
                            updateDraftPurchase({
                              totalPriceWithTax: total,
                              estimatedAmount: total
                            });
                          }}
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
                          value={curPur.purchaseOrderNumber || ''}
                          onChange={(e) => updateDraftPurchase({ purchaseOrderNumber: e.target.value })}
                          placeholder="ej. 2356-45-CM26"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Fecha Envío Orden de Compra
                        </label>
                        <input
                          type="date"
                          value={curPur.orderSentDate || ''}
                          onChange={(e) => updateDraftPurchase({ orderSentDate: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>{getPurchaseDateFieldLabel(curPur.modalidadCompra)}</span>
                        <span className="text-[11px] font-normal text-indigo-600 font-sans">
                          ({curPur.modalidadCompra || 'Convenio marco'})
                        </span>
                      </label>
                      <input
                        type="date"
                        value={curPur.requiredDate || curPur.orderAcceptedDate || ''}
                        onChange={(e) => updateDraftPurchase({ 
                          requiredDate: e.target.value,
                          orderAcceptedDate: (curPur.modalidadCompra || '').toLowerCase().includes('ágil') || (curPur.modalidadCompra || '').toLowerCase().includes('agil') ? e.target.value : curPur.orderAcceptedDate,
                          decreeSigningDate: (curPur.modalidadCompra || '').toLowerCase().includes('convenio') ? e.target.value : curPur.decreeSigningDate,
                          contractClosingDate: (curPur.modalidadCompra || '').toLowerCase().includes('licitación') ? e.target.value : curPur.contractClosingDate
                        })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        {(curPur.modalidadCompra || '').toLowerCase().includes('ágil') && 'Fecha en que el proveedor acepta la Orden de Compra en Mercado Público.'}
                        {(curPur.modalidadCompra || '').toLowerCase().includes('convenio') && 'Fecha en que el decreto de adjudicación queda totalmente tramitado y firmado.'}
                        {(curPur.modalidadCompra || '').toLowerCase().includes('licitación') && 'Fecha de cierre y firma del contrato administrativo.'}
                        {!(curPur.modalidadCompra || '').toLowerCase().includes('ágil') && !(curPur.modalidadCompra || '').toLowerCase().includes('convenio') && !(curPur.modalidadCompra || '').toLowerCase().includes('licitación') && 'Fecha clave de formalización o aceptación del proceso de compra.'}
                      </p>
                    </div>

                    {/* Cero Papel: Fecha de iniciación (Obligatorio), Expediente y Estado */}
                    <div className="space-y-3 p-3 bg-white rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                            Fecha de iniciación de la compra en CeroPapel *
                          </span>
                          <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Obligatorio
                          </span>
                        </label>
                        <input
                          type="date"
                          required
                          value={curPur.ceroPapelInitiationDate || ''}
                          onChange={(e) => updateDraftPurchase({ ceroPapelInitiationDate: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Fecha en que se inició formalmente el proceso de compra en CeroPapel. Se mantiene en todos los estados (Pendiente, En ejecución, Completado).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Expediente Cero Papel
                          </label>
                          <input
                            type="text"
                            value={curPur.ceroPapelExpediente || ''}
                            onChange={(e) => updateDraftPurchase({ ceroPapelExpediente: e.target.value })}
                            placeholder="ej. EXP-2026-004512"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Estado en Cero Papel
                          </label>
                          <input
                            type="text"
                            value={curPur.ceroPapelEstado || ''}
                            onChange={(e) => updateDraftPurchase({ ceroPapelEstado: e.target.value })}
                            placeholder="ej. En Firma, Derivado a Adquisiciones, En Trámite..."
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Link de referencia producto/servicio */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Link de referencia producto/servicio
                        </label>
                        {curPur.referenceLink && curPur.referenceLink.trim().length > 0 && (
                          <a
                            href={normalizeUrl(curPur.referenceLink)}
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
                          value={curPur.referenceLink || ''}
                          onChange={(e) => updateDraftPurchase({ referenceLink: e.target.value })}
                          placeholder="ej. www.mercadopublico.cl, google.cl, ficha técnica, o cualquier web"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 pr-9 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {curPur.referenceLink && curPur.referenceLink.trim().length > 0 && (
                          <a
                            href={normalizeUrl(curPur.referenceLink)}
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
                        value={curPur.problemReason || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraftPurchase({ 
                            problemReason: val,
                            status: val.trim() ? 'problema' : (currentMacro === 'completado' || currentMacro === 'realizado' ? 'cerrado' : 'en_compra')
                          });
                        }}
                        placeholder="Si la compra presenta demora o inconvenientes con el proveedor, descríbalo aquí..."
                        className="w-full rounded-lg border border-rose-300 bg-white p-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* 2. SELECCIÓN DE MACROESTADO (3 ESTADOS PRINCIPALES: Pendiente, En ejecución, Completado) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Estado de la Compra (Etapa General)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Pendiente */}
                      <button
                        type="button"
                        onClick={() => {
                          updateDraftPurchase({ 
                            macroState: 'pendiente',
                            status: 'solicitado'
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          currentMacro === 'pendiente' || currentMacro === 'por_hacer'
                            ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30 text-amber-950 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-amber-600" />
                            Pendiente
                          </span>
                          {(currentMacro === 'pendiente' || currentMacro === 'por_hacer') && (
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Planificada, presupuestada o solicitada sin inicio administrativo.
                        </p>
                      </button>

                      {/* En ejecución */}
                      <button
                        type="button"
                        onClick={() => {
                          updateDraftPurchase({ 
                            macroState: 'en_ejecucion',
                            status: curPur.status === 'solicitado' ? 'en_compra' : curPur.status
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          currentMacro === 'en_ejecucion'
                            ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/30 text-blue-950 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <Truck className="h-4 w-4 text-blue-600" />
                            En ejecución
                          </span>
                          {currentMacro === 'en_ejecucion' && (
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          OC emitida, despacho o tramitación en curso.
                        </p>
                      </button>

                      {/* Completado */}
                      <button
                        type="button"
                        onClick={() => {
                          updateDraftPurchase({ 
                            macroState: 'completado',
                            status: 'cerrado',
                            receptionStatus: 'conforme',
                            invoiceStatus: curPur.invoiceStatus === 'sin_factura' ? 'pagada' : curPur.invoiceStatus
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          currentMacro === 'completado' || currentMacro === 'realizado'
                            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/30 text-emerald-950 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Completado
                          </span>
                          {(currentMacro === 'completado' || currentMacro === 'realizado') && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Recepción conforme + facturación y pago cerrados.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 3. MICROESTADOS: RECEPCIÓN CONFORME & FACTURACIÓN (SOLO CUANDO ESTÁ COMPLETADO) */}
                  {(currentMacro === 'completado' || currentMacro === 'realizado') && (
                    <div className="space-y-3 pt-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800">
                        3. Control de Recepción Conforme y Control de Facturación y Pago
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 3.A CONTROL DE RECEPCIÓN CONFORME */}
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <PackageCheck className="h-4 w-4 text-emerald-600" />
                              Control de Recepción Conforme
                            </span>
                            <PurchaseReceptionBadge status={reception} size="sm" />
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
                                    const updates: Partial<Purchase> = { 
                                      receptionStatus: newRec,
                                      receptionDate: newRec === 'conforme' && !curPur.receptionDate ? '2026-08-15' : curPur.receptionDate
                                    };
                                    updateDraftPurchase(updates);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                                    reception === opt.value
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
                                value={curPur.receptionDate || ''}
                                onChange={(e) => updateDraftPurchase({ receptionDate: e.target.value })}
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
                                value={curPur.receptionActDoc || ''}
                                onChange={(e) => updateDraftPurchase({ receptionActDoc: e.target.value })}
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
                              value={curPur.receptionResponsible || ''}
                              onChange={(e) => updateDraftPurchase({ receptionResponsible: e.target.value })}
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
                              value={curPur.receptionNotes || ''}
                              onChange={(e) => updateDraftPurchase({ receptionNotes: e.target.value })}
                              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                            />
                          </div>
                        </div>

                        {/* 3.B CONTROL DE FACTURACIÓN Y PAGO */}
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Receipt className="h-4 w-4 text-sky-600" />
                              Control de Facturación y Pago
                            </span>
                            <PurchaseInvoiceBadge status={invoice} invoiceNumber={curPur.invoiceNumber} size="sm" />
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
                                    const updates: Partial<Purchase> = { 
                                      invoiceStatus: newInv,
                                      invoiceDate: (newInv === 'recibida' || newInv === 'en_revision') && !curPur.invoiceDate ? '2026-08-15' : curPur.invoiceDate,
                                      invoicePaymentDate: newInv === 'pagada' && !curPur.invoicePaymentDate ? '2026-08-15' : curPur.invoicePaymentDate
                                    };
                                    updateDraftPurchase(updates);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                                    invoice === opt.value
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
                                value={curPur.invoiceNumber || ''}
                                onChange={(e) => updateDraftPurchase({ invoiceNumber: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Fecha de Factura
                              </label>
                              <input
                                type="date"
                                value={curPur.invoiceDate || ''}
                                onChange={(e) => updateDraftPurchase({ invoiceDate: e.target.value })}
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
                                value={curPur.invoiceAmount || ''}
                                onChange={(e) => updateDraftPurchase({ invoiceAmount: parseFloat(e.target.value) || undefined })}
                                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Fecha de Pago
                              </label>
                              <input
                                type="date"
                                value={curPur.invoicePaymentDate || ''}
                                onChange={(e) => updateDraftPurchase({ invoicePaymentDate: e.target.value })}
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
                              value={curPur.invoiceNotes || ''}
                              onChange={(e) => updateDraftPurchase({ invoiceNotes: e.target.value })}
                              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* MEETING DETAILS */}
            {meeting && (() => {
              const curMeeting = draftMeeting || meeting;
              const agreementsList: MeetingAgreement[] = Array.isArray(curMeeting.agreements)
                ? curMeeting.agreements
                : typeof curMeeting.agreements === 'string' && curMeeting.agreements
                ? [{ id: 'agr_single', meetingId: curMeeting.id, description: curMeeting.agreements, decisionType: 'acuerdo' }]
                : [];
              const commitmentsList: MeetingCommitment[] = curMeeting.commitments || [];
              const participantsList = curMeeting.participants || [];
              const completedCommitmentsCount = commitmentsList.filter(
                (c) => c.status === 'cumplido' || c.status === 'completado'
              ).length;

              return (
                <div className="space-y-6">
                  {/* 1. CABECERA & METADATOS DE LA INSTANCIA */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        1. Información General de la Instancia
                      </span>
                      <div className="flex items-center gap-2">
                        <MeetingTypeBadge type={curMeeting.type || 'reunion'} />
                        <MeetingStatusChip
                          status={curMeeting.status || 'pendiente'}
                          onChange={(newStatus) => updateDraftMeeting({ status: newStatus })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Título de la Instancia o Reunión *
                      </label>
                      <input
                        type="text"
                        required
                        value={curMeeting.title || ''}
                        onChange={(e) => updateDraftMeeting({ title: e.target.value })}
                        placeholder="ej. Comité Técnico Comunal de Cuidados Paliativos Universales"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Programa Asociado
                        </label>
                        <select
                          value={curMeeting.programId || 'praps_cpu'}
                          onChange={(e) => updateDraftMeeting({ programId: e.target.value as any })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        >
                          {programs.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.shortName}
                            </option>
                          ))}
                          <option value="transversal">Transversal / Comunal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tipo de Instancia
                        </label>
                        <select
                          value={curMeeting.type || 'comite'}
                          onChange={(e) => updateDraftMeeting({ type: e.target.value as MeetingType })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="comite">Comité Técnico</option>
                          <option value="reunion">Reunión de Equipo</option>
                          <option value="coordinacion">Coordinación de Red</option>
                          <option value="capacitacion">Capacitación Técnica</option>
                          <option value="consultoria">Consultoría / Asesoría</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Estado de la Sesión
                        </label>
                        <select
                          value={curMeeting.status || 'pendiente'}
                          onChange={(e) => updateDraftMeeting({ status: e.target.value as MeetingStatus })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_ejecucion">En ejecución</option>
                          <option value="completado">Completado</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Fecha y Hora de la Sesión
                        </label>
                        <input
                          type="datetime-local"
                          value={curMeeting.dateTime ? curMeeting.dateTime.substring(0, 16) : ''}
                          onChange={(e) => updateDraftMeeting({ dateTime: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Lugar / Modalidad
                        </label>
                        <input
                          type="text"
                          value={curMeeting.location || ''}
                          onChange={(e) => updateDraftMeeting({ location: e.target.value })}
                          placeholder="ej. Sala de Reuniones DISAM Quilicura / Zoom Híbrido"
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. OBJETIVO DE LA SESIÓN (MATCHING IMAGEN 1) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Objetivo de la sesión:
                      </label>
                      <span className="text-[11px] text-slate-400">Propósito y temario central</span>
                    </div>
                    <textarea
                      rows={3}
                      value={curMeeting.objective || ''}
                      onChange={(e) => updateDraftMeeting({ objective: e.target.value })}
                      placeholder="Analizar casos complejos de pacientes no oncológicos con dolor refractario y definir protocolo de enlace con Hospital San José."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                    />
                  </div>

                  {/* 3. PARTICIPANTES DE LA SESIÓN */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        Participantes ({participantsList.length})
                      </span>
                      <span className="text-[11px] text-slate-400">Asistencia y convocatoria</span>
                    </div>

                    {/* Participant Tags / Cards */}
                    {participantsList.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No hay participantes registrados aún.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {participantsList.map((p, idx) => {
                          const name = typeof p === 'string' ? p : p.name;
                          const role = typeof p === 'string' ? '' : (p.role || p.organization || '');
                          return (
                            <span
                              key={typeof p === 'string' ? `part_${idx}` : p.id || `part_${idx}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                            >
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-900">{name}</span>
                              {role && <span className="text-[10px] text-slate-500 font-medium">({role})</span>}
                              <button
                                type="button"
                                onClick={() => handleRemoveMeetingParticipant(idx)}
                                className="text-slate-400 hover:text-rose-600 ml-1 p-0.5 rounded transition-colors"
                                title="Quitar participante"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Quick Add Participant Row */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Nombre del participante (ej. Klaus Bauer)..."
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Cargo / Establecimiento (ej. Referente DISAM)..."
                        value={newPartRole}
                        onChange={(e) => setNewPartRole(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddMeetingParticipant}
                        className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors whitespace-nowrap"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>

                  {/* 4. ACUERDOS TOMADOS (MATCHING IMAGEN 1 PURPLE CARD) */}
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                        <FileSignature className="w-4 h-4 text-purple-600" />
                        ACUERDOS TOMADOS ({agreementsList.length})
                      </span>
                      <span className="text-[11px] text-purple-800/80 font-medium">Decisiones vinculantes</span>
                    </div>

                    {/* Agreements Bullet List */}
                    {agreementsList.length === 0 ? (
                      <p className="text-xs text-purple-800/70 italic py-1">Sin acuerdos formales registrados aún.</p>
                    ) : (
                      <ul className="space-y-2">
                        {agreementsList.map((agr, idx) => (
                          <li
                            key={agr.id || idx}
                            className="group flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white border border-purple-100 shadow-2xs text-xs text-slate-800 hover:border-purple-300 transition-all"
                          >
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                              <div className="space-y-0.5">
                                {agr.decisionType && (
                                  <span className="inline-block uppercase text-[10px] font-bold text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded mr-1.5">
                                    [{agr.decisionType}]
                                  </span>
                                )}
                                <span className="text-slate-800 leading-relaxed font-medium">{agr.description}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({
                                  title: '¿Confirmas que deseas eliminar este acuerdo?',
                                  message: `Esta acción eliminará el acuerdo "${agr.description}" de la minuta.`,
                                  onConfirm: () => handleRemoveMeetingAgreement(agr.id || idx),
                                })
                              }
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors opacity-70 group-hover:opacity-100 shrink-0"
                              title="Eliminar acuerdo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Add Agreement Row */}
                    <div className="pt-2 border-t border-purple-200/80 space-y-2">
                      <span className="text-[11px] font-bold text-purple-950 block">+ Agregar Nuevo Acuerdo:</span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={newAgrType}
                          onChange={(e) => setNewAgrType(e.target.value as any)}
                          className="rounded-lg border border-purple-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium shrink-0 focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="acuerdo">Acuerdo</option>
                          <option value="definicion">Definición</option>
                          <option value="resolucion">Resolución</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Descripción del acuerdo o definición técnica..."
                          value={newAgrText}
                          onChange={(e) => setNewAgrText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMeetingAgreement();
                            }
                          }}
                          className="flex-1 rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddMeetingAgreement}
                          className="px-3.5 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-bold hover:bg-purple-800 transition-colors whitespace-nowrap shadow-xs"
                        >
                          + Agregar Acuerdo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 5. COMPROMISOS ASIGNADOS (MATCHING IMAGEN 1) */}
                  <div className="space-y-3.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4 text-indigo-600" />
                        COMPROMISOS ASIGNADOS ({commitmentsList.length})
                      </span>
                      <span className="text-xs font-medium text-slate-500 lowercase">
                        {completedCommitmentsCount} cumplidos
                      </span>
                    </div>

                    {/* Commitment Cards */}
                    {commitmentsList.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        No hay compromisos asignados para esta sesión.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {commitmentsList.map((c) => {
                          const isDone = c.status === 'cumplido' || c.status === 'completado';
                          return (
                            <div
                              key={c.id}
                              className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isDone
                                  ? 'bg-emerald-50/40 border-emerald-200'
                                  : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => handleToggleMeetingCommitmentDone(c.id)}
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  title="Marcar como cumplido / pendiente"
                                />
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`text-xs font-bold ${
                                        isDone ? 'line-through text-slate-400' : 'text-slate-900'
                                      }`}
                                    >
                                      {c.description}
                                    </span>
                                    <PriorityChip priority={c.priority} />
                                  </div>
                                  <p className="text-[11px] text-slate-500">
                                    <span>
                                      Resp:{' '}
                                      <strong className="text-slate-700 font-medium">{c.responsible}</strong>
                                    </span>
                                    <span className="mx-1.5">•</span>
                                    <span>
                                      Plazo: <strong>{formatDate(c.deadline)}</strong>
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                {/* Status Select */}
                                <select
                                  value={isDone ? 'cumplido' : c.status}
                                  onChange={(e) =>
                                    handleChangeMeetingCommitmentStatus(c.id, e.target.value as CommitmentStatus)
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="pendiente">Pendiente</option>
                                  <option value="en_curso">En curso</option>
                                  <option value="cumplido">Cumplido</option>
                                  <option value="cancelado">Cancelado</option>
                                </select>

                                {/* Task Conversion Button / Badge */}
                                {c.taskId ? (
                                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tarea vinculada
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (curMeeting) {
                                        convertCommitmentToTask(curMeeting.id, c.id);
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                  >
                                    <ArrowRight className="w-3 h-3" /> + Crear tarea
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmAction({
                                      title: '¿Confirmas que deseas eliminar este compromiso?',
                                      message: `Esta acción eliminará el compromiso "${c.description}" de la sesión.`,
                                      onConfirm: () => handleRemoveMeetingCommitment(c.id),
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                  title="Eliminar compromiso"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* New Commitment Add Form */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <span className="text-[11px] font-bold text-slate-800 block uppercase tracking-wide">
                        + Nuevo Compromiso Asignado:
                      </span>
                      <input
                        type="text"
                        placeholder="Descripción del compromiso acordado..."
                        value={newComDesc}
                        onChange={(e) => setNewComDesc(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                            Responsable
                          </label>
                          <input
                            type="text"
                            placeholder="ej. Klaus Bauer"
                            value={newComResp}
                            onChange={(e) => setNewComResp(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                            Fecha Plazo
                          </label>
                          <input
                            type="date"
                            value={newComDeadline}
                            onChange={(e) => setNewComDeadline(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                            Prioridad
                          </label>
                          <select
                            value={newComPriority}
                            onChange={(e) => setNewComPriority(e.target.value as PriorityLevel)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                          >
                            <option value="alta">Alta</option>
                            <option value="critica">Crítica (Urgente)</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddMeetingCommitment}
                          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                        >
                          + Agregar Compromiso
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 6. NOTAS DE LA MINUTA */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Notas de la Minuta / Desarrollo de la Sesión
                    </label>
                    <textarea
                      rows={3}
                      value={curMeeting.notes || ''}
                      onChange={(e) => updateDraftMeeting({ notes: e.target.value })}
                      placeholder="Detalles sobre puntos tratados, dudas técnicas o acuerdos pendientes de confirmación..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                    />
                  </div>
                </div>
              );
            })()}

            {/* PENDING / OPERATIONAL EMAIL & REQUIREMENT DETAILS */}
            {email && (() => {
              const curEmail = draftEmail || email;
              const dueInfo = getEmailDueInfo(curEmail.deadline, curEmail.status);
              const isUrgent = curEmail.isUrgent ?? (curEmail.priority === 'critica' || curEmail.priority === 'alta');
              const canonicalStatus = normalizeCommunicationStatus(curEmail.status);
              const linkedTask = curEmail.taskId ? tasks.find((t) => t.id === curEmail.taskId && !t.archived) : undefined;
              const followUps = curEmail.followUps || [];
              const todayDateStr = '2026-08-15';

              // Categorization helper
              const currentCategory: CommunicationOperationalCategory = (() => {
                if (canonicalStatus === 'cerrado' || canonicalStatus === 'respondido') return 'cerrado';
                if (isEmailOverdue(curEmail, todayDateStr)) return 'vencido';
                if (curEmail.deadline === todayDateStr) return 'vence_hoy';
                if (canonicalStatus === 'en_gestion') return 'en_gestion';
                return 'pendiente';
              })();

              const handleApplyCategory = (targetCategory: CommunicationOperationalCategory) => {
                if (targetCategory === 'cerrado') {
                  updateDraftEmail({ status: 'cerrado' });
                } else if (targetCategory === 'vencido') {
                  const newStatus = canonicalStatus === 'cerrado' || canonicalStatus === 'respondido' ? 'en_gestion' : curEmail.status;
                  updateDraftEmail({
                    status: newStatus,
                    deadline: '2026-08-12',
                  });
                } else if (targetCategory === 'vence_hoy') {
                  const newStatus = canonicalStatus === 'cerrado' || canonicalStatus === 'respondido' ? 'en_gestion' : curEmail.status;
                  updateDraftEmail({
                    status: newStatus,
                    deadline: todayDateStr,
                  });
                } else if (targetCategory === 'en_gestion') {
                  const isPastOrToday = curEmail.deadline && (curEmail.deadline <= todayDateStr);
                  updateDraftEmail({
                    status: 'en_gestion',
                    ...(isPastOrToday ? { deadline: '2026-08-25' } : {}),
                  });
                } else if (targetCategory === 'pendiente') {
                  const isPastOrToday = curEmail.deadline && (curEmail.deadline <= todayDateStr);
                  updateDraftEmail({
                    status: 'pendiente',
                    ...(isPastOrToday ? { deadline: '2026-08-25' } : {}),
                  });
                }
              };

              return (
                <div className="space-y-6">
                  {/* Status, Urgency & Overdue Alert Banner */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      {/* Operational 5-Category Switcher */}
                      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleApplyCategory('pendiente')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentCategory === 'pendiente'
                              ? 'bg-white text-amber-900 border border-amber-300 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Pendientes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCategory('en_gestion')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentCategory === 'en_gestion'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          En gestión
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCategory('cerrado')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentCategory === 'cerrado'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Cerrados
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCategory('vence_hoy')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentCategory === 'vence_hoy'
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Vencen hoy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCategory('vencido')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentCategory === 'vencido'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Vencidos
                        </button>
                      </div>

                      {/* Right Controls: Status Chip & Urgency Chip */}
                      <div className="flex items-center gap-2">
                        <CommunicationStatusChip
                          status={curEmail.status}
                          deadline={curEmail.deadline}
                          onChange={(newCategory) => handleApplyCategory(newCategory)}
                        />
                        <TaskUrgencyChip
                          isUrgent={isUrgent}
                          onChange={(urgent) => {
                            updateDraftEmail({
                              isUrgent: urgent,
                              priority: urgent ? 'alta' : 'media',
                            });
                          }}
                        />
                      </div>
                    </div>

                    {/* Due info notice banner */}
                    {dueInfo.type === 'vencido' && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                          <span className="font-semibold">
                            Plazo de gestión vencido hace {dueInfo.days} {dueInfo.days === 1 ? 'día' : 'días'} (Fecha límite: {formatDate(curEmail.deadline)})
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-200 text-rose-800">
                          Vencido
                        </span>
                      </div>
                    )}
                    {dueInfo.type === 'hoy' && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                          <span className="font-semibold">
                            El plazo de este requerimiento vence hoy ({formatDate(curEmail.deadline)})
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-800">
                          Vence hoy
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Asunto / Título del Requerimiento *
                    </label>
                    <input
                      type="text"
                      value={curEmail.subject || ''}
                      onChange={(e) => updateDraftEmail({ subject: e.target.value })}
                      placeholder="ej. Reiteración compra urgente de apósitos CPU..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                    />
                  </div>

                  {/* Key Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {/* Tipo de Comunicación */}
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Tipo de Comunicación
                      </label>
                      <select
                        value={curEmail.type || 'requerimiento'}
                        onChange={(e) => updateDraftEmail({ type: e.target.value as CommunicationType })}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="requerimiento">Requerimiento</option>
                        <option value="oficio">Oficio</option>
                        <option value="correo_recibido">Correo Recibido</option>
                        <option value="correo_por_enviar">Correo por Enviar</option>
                        <option value="solicitud">Solicitud</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    {/* Programa Asociado */}
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Programa Asociado
                      </label>
                      <select
                        value={curEmail.programId}
                        onChange={(e) => updateDraftEmail({ programId: e.target.value as any })}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      >
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.shortName || p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Responsable */}
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Responsable de Gestión
                      </label>
                      <input
                        type="text"
                        value={curEmail.responsible || ''}
                        onChange={(e) => updateDraftEmail({ responsible: e.target.value })}
                        placeholder="ej. Klaus Bauer"
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* De (Remitente) */}
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        De (Remitente)
                      </label>
                      <input
                        type="text"
                        value={curEmail.sender || ''}
                        onChange={(e) => updateDraftEmail({ sender: e.target.value })}
                        placeholder="ej. Klaus Bauer (DISAM)"
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Para (Destinatario) */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-semibold mb-1">
                        Para (Destinatarios)
                      </label>
                      <input
                        type="text"
                        value={curEmail.recipient || ''}
                        onChange={(e) => updateDraftEmail({ recipient: e.target.value })}
                        placeholder="ej. ventas@drogueriamedica.cl; adquisiciones@quilicurasalud.cl"
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Fecha de Ingreso */}
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Fecha Ingreso / Recepción
                      </label>
                      <input
                        type="date"
                        value={curEmail.receivedOrSentDate || curEmail.receivedDate || (curEmail.createdAt ? curEmail.createdAt.split('T')[0] : '')}
                        onChange={(e) => updateDraftEmail({ receivedOrSentDate: e.target.value, receivedDate: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Plazo / Fecha Límite */}
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Plazo de Gestión / Envío
                      </label>
                      <input
                        type="date"
                        value={curEmail.deadline || ''}
                        onChange={(e) => updateDraftEmail({ deadline: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Acción / Objetivo */}
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Tipo de Acción Requerida
                      </label>
                      <select
                        value={curEmail.action || 'responder'}
                        onChange={(e) => updateDraftEmail({ action: e.target.value as EmailAction })}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="enviar">Enviar</option>
                        <option value="responder">Responder</option>
                        <option value="revisar">Revisar</option>
                        <option value="seguimiento">Seguimiento</option>
                      </select>
                    </div>
                  </div>

                  {/* Highlighted Action Required Box */}
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                    <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                      Acción Requerida Operativa
                    </label>
                    <textarea
                      rows={2}
                      value={curEmail.requiredAction || ''}
                      onChange={(e) => updateDraftEmail({ requiredAction: e.target.value })}
                      placeholder="ej. Confirmar número de guía de despacho y fecha estimada de entrega con Adquisiciones."
                      className="w-full rounded-lg border border-amber-300/80 bg-white p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                  </div>

                  {/* Detailed Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Detalle, Notas y Contexto
                    </label>
                    <textarea
                      rows={3}
                      value={curEmail.notes || curEmail.summary || ''}
                      onChange={(e) => updateDraftEmail({ notes: e.target.value, summary: e.target.value })}
                      placeholder="Detalles adicionales sobre este requerimiento, orientaciones recibidas o exigencias..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                    />
                  </div>

                  {/* Operational Task Bridge */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                        Vinculación con Tarea Operativa
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {linkedTask
                          ? `Vinculada con tarea activa "${linkedTask.title}" (${linkedTask.status})`
                          : 'Crea una tarea operativa en el plan de trabajo para hacer seguimiento a este requerimiento.'}
                      </p>
                    </div>

                    {linkedTask ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer shrink-0"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        Ver Tarea: {linkedTask.title.substring(0, 25)}...
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const taskCreated = convertEmailToTask(curEmail.id);
                          if (taskCreated) {
                            updateDraftEmail({ taskId: taskCreated.id, status: 'en_gestion' });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Crear Tarea Operativa
                      </button>
                    )}
                  </div>

                  {/* Follow-ups & Milestones Timeline (Hitos de Seguimiento) */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-indigo-600" />
                        Bitácora de Hitos y Respuestas ({followUps.length})
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {followUps.length} {followUps.length === 1 ? 'hito registrado' : 'hitos registrados'}
                      </span>
                    </div>

                    {/* Timeline list */}
                    {followUps.length > 0 ? (
                      <div className="space-y-2">
                        {followUps.map((fu) => {
                          const fuTypeLabels: Record<string, { label: string; bg: string; text: string }> = {
                            contacto: { label: 'Contacto Telefónico / Verbal', bg: 'bg-blue-50', text: 'text-blue-700' },
                            respuesta_enviada: { label: 'Respuesta Enviada', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                            informacion_solicitada: { label: 'Información Solicitada', bg: 'bg-amber-50', text: 'text-amber-700' },
                            documento_recibido: { label: 'Documento Recibido', bg: 'bg-purple-50', text: 'text-purple-700' },
                            derivacion: { label: 'Derivación', bg: 'bg-indigo-50', text: 'text-indigo-700' },
                            recordatorio: { label: 'Recordatorio / Reiteración', bg: 'bg-rose-50', text: 'text-rose-700' },
                            observacion: { label: 'Observación', bg: 'bg-slate-100', text: 'text-slate-700' },
                            otro: { label: 'Hito', bg: 'bg-slate-100', text: 'text-slate-700' },
                          };
                          const conf = fuTypeLabels[fu.type] || fuTypeLabels.otro;

                          return (
                            <div
                              key={fu.id}
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5 text-xs relative group"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${conf.bg} ${conf.text}`}>
                                    {conf.label}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {formatDate(fu.createdAt)} • Por <strong className="text-slate-700">{fu.createdBy}</strong>
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEmailFollowUp(fu.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                                  title="Eliminar hito"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-slate-800 leading-relaxed font-medium pl-1">
                                {fu.note}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                        No hay hitos registrados aún en la bitácora. Registra llamadas, envíos o avances para mantener la trazabilidad.
                      </p>
                    )}

                    {/* Add new follow-up form */}
                    <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2.5">
                      <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Registrar Nuevo Hito en la Bitácora
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <select
                            value={newEmailFuType}
                            onChange={(e) => setNewEmailFuType(e.target.value as CommunicationFollowUpType)}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800"
                          >
                            <option value="contacto">📞 Contacto / Llamada</option>
                            <option value="recordatorio">⏰ Recordatorio / Reiteración</option>
                            <option value="respuesta_enviada">✉️ Respuesta Enviada</option>
                            <option value="informacion_solicitada">📋 Info Solicitada</option>
                            <option value="documento_recibido">📥 Documento Recibido</option>
                            <option value="derivacion">↗️ Derivación</option>
                            <option value="observacion">📝 Observación</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 flex gap-2">
                          <input
                            type="text"
                            value={newEmailFuNote}
                            onChange={(e) => setNewEmailFuNote(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddEmailFollowUp();
                              }
                            }}
                            placeholder="Describa el avance, llamada o respuesta recibida..."
                            className="flex-1 rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={handleAddEmailFollowUp}
                            disabled={!newEmailFuNote.trim()}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                          >
                            Agregar Hito
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* QUESTION DETAILS */}
            {question && (() => {
              const curQ = draftQuestion || question;
              return (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {curQ.category}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">{curQ.question}</h2>
                    <p className="text-xs text-slate-500 mt-1">{curQ.context}</p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Respuesta / Aclaración del Servicio de Salud
                    </span>
                    <textarea
                      rows={4}
                      value={curQ.finalAnswer || ''}
                      onChange={(e) => updateDraftQuestion({ finalAnswer: e.target.value })}
                      placeholder="Escriba la orientación oficial recibida por correo, reunión o memorando..."
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Estado de la Consulta</span>
                      <select
                        value={curQ.status}
                        onChange={(e) => updateDraftQuestion({ status: e.target.value as QuestionStatus })}
                        className="w-full rounded border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800"
                      >
                        <option value="abierta">Abierta (Sin respuesta)</option>
                        <option value="enviada_a_ss">Enviada al SSMN</option>
                        <option value="respondida">Respondida Oficialmente</option>
                        <option value="archivada">Archivada</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Referente / Responsable</span>
                      <input
                        type="text"
                        value={curQ.responsible || ''}
                        onChange={(e) => updateDraftQuestion({ responsible: e.target.value })}
                        placeholder="ej. Dra. Francisca Ruiz (SSMN)"
                        className="w-full rounded border border-slate-300 p-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* KNOWLEDGE DETAILS */}
            {know && (() => {
              const curKnow = draftKnowledge || know;
              return (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {curKnow.category}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">{curKnow.title}</h2>
                    <p className="text-xs text-slate-500">Por {curKnow.author} • {formatDate(curKnow.createdAt)}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-700">
                    {curKnow.content}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">Consejos Prácticos y Buenas Prácticas</span>
                    <textarea
                      rows={3}
                      value={curKnow.content}
                      onChange={(e) => updateDraftKnowledge({ content: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800"
                    />
                  </div>
                </div>
              );
            })()}

            {/* HR DETAILS */}
            {hr && (() => {
              const curHr = draftHR || hr;
              return (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {curHr.role}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">{curHr.name || 'Cupo Vacante'}</h2>
                    <p className="text-xs text-slate-500">
                      Establecimiento: {curHr.establishmentId} • Contrato: {curHr.contractType}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Horas Semanales</span>
                      <input
                        type="number"
                        value={curHr.workdayHours}
                        onChange={(e) => updateDraftHR({ workdayHours: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Estado de Dotación</span>
                      <select
                        value={curHr.status}
                        onChange={(e) => updateDraftHR({ status: e.target.value as any })}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                      >
                        <option value="activo">Activo</option>
                        <option value="en_proceso_seleccion">En Selección</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block mb-1">Nombre del Profesional</span>
                      <input
                        type="text"
                        value={curHr.name || ''}
                        onChange={(e) => updateDraftHR({ name: e.target.value })}
                        placeholder="ej. Klga. Camila Sepúlveda"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ELEAM DETAILS */}
            {eleam && (() => {
              const curEleam = draftEleam || eleam;
              return (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      RUT: {curEleam.patientRut}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">{curEleam.patientName}</h2>
                    <p className="text-xs text-slate-500">
                      Edad: {curEleam.patientAge} años • Cuidador: {curEleam.caregiverContact}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                    <div>
                      <span className="text-slate-500 block mb-1">Estado de la Postulación</span>
                      <select
                        value={curEleam.status}
                        onChange={(e) => updateDraftEleam({ status: e.target.value as any })}
                        className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
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
                        value={curEleam.nextAction}
                        onChange={(e) => updateDraftEleam({ nextAction: e.target.value })}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Fecha Plazo</span>
                      <input
                        type="date"
                        value={curEleam.deadline}
                        onChange={(e) => updateDraftEleam({ deadline: e.target.value })}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ATTACHMENTS MANAGER FOR ANY ENTITY */}
            {(() => {
              const emailAttachments = entityType === 'email' && draftEmail ? (draftEmail.attachments || []) : [];
              const combinedAttachments = entityType === 'email' ? [...emailAttachments, ...entityAttachments] : entityAttachments;

              return (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                      Archivos y Documentos Adjuntos ({combinedAttachments.length})
                    </span>
                  </div>

                  {combinedAttachments.length > 0 ? (
                    <div className="space-y-1.5">
                      {combinedAttachments.map((att: any) => {
                        const isEmailAtt = emailAttachments.some((a) => a.id === att.id);
                        return (
                          <div key={att.id} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between text-xs bg-slate-50">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                              <span className="font-medium text-slate-800 truncate max-w-[220px]">{att.name}</span>
                              <span className="text-[10px] text-slate-400">
                                ({typeof att.size === 'number' ? `${(att.size / 1024).toFixed(0)} KB` : att.size || 'PDF'})
                              </span>
                              {att.uploadedBy && (
                                <span className="text-[10px] text-slate-500 hidden sm:inline">• Por {att.uploadedBy}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (isEmailAtt) {
                                  handleRemoveEmailAttachment(att.id);
                                } else {
                                  deleteAttachment(att.id);
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1 transition-colors cursor-pointer"
                              title="Eliminar adjunto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No hay documentos adjuntos aún.</p>
                  )}

                  {/* Add document form */}
                  <form onSubmit={handleAddFile} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ej. Orden_Compra_Firmada.pdf o Guia_Despacho_6241.pdf"
                      value={newAttachmentName}
                      onChange={(e) => setNewAttachmentName(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors shrink-0 cursor-pointer"
                    >
                      Adjuntar
                    </button>
                  </form>
                </div>
              );
            })()}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Guardar
            </button>
          </div>
        </div>

      {/* Internal Item Confirm Deletion Modal with 'OK' validation */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.title || '¿Confirmar eliminación?'}
        message={confirmAction?.message || 'Esta acción no se puede deshacer.'}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isDestructive={true}
        requireOkInput={true}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction.onConfirm();
            setConfirmAction(null);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
