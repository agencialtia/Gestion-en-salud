import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ProgramId, 
  TaskStatus, 
  PurchaseStatus, 
  PriorityLevel, 
  KnowledgeCategory, 
  QuestionStatus, 
  FinancialPeriod, 
  BudgetComponent, 
  ProgramBudget2025Note, 
  HRRecord, 
  getPurchaseDateFieldLabel,
  getPurchaseEffectiveMacroState,
  getPurchaseAlerts,
  PurchaseMacroState,
  PurchaseReceptionStatus,
  PurchaseInvoiceStatus,
  isTaskOverdue,
  isTaskCompleted,
  normalizeTaskStatus,
  isCommitmentOverdue,
  CommunicationType,
  CommunicationStatus,
  PendingEmail,
  normalizeCommunicationStatus,
  isEmailOverdue,
  getEmailDueInfo,
} from '../../types';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckSquare,
  Users,
  Mail,
  HelpCircle,
  Lightbulb,
  UserCheck,
  FolderHeart,
  Plus,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Building,
  Sparkles,
  Info,
  Pencil,
  Check,
  X,
  Trash2,
  FileText,
  Save,
  Truck,
  Package,
  Pill,
  Wind,
  Layers,
  Tag,
  Edit,
  PackageCheck,
  Receipt,
  BellRing,
  Flame,
  GripVertical,
} from 'lucide-react';
import { 
  ProgramBadge, 
  TrafficLightBadge, 
  PriorityChip, 
  TaskUrgencyChip, 
  TaskStatusChip, 
  TaskOperationalCategory,
  PurchaseStatusChip, 
  ProgressBar, 
  PurchaseMacroBadge, 
  PurchaseReceptionBadge, 
  PurchaseInvoiceBadge, 
  MeetingStatusChip, 
  MeetingOperationalCategory,
  CommitmentStatusChip, 
  OverdueBadge, 
  CommunicationTypeBadge, 
  CommunicationStatusChip, 
  CommunicationOperationalCategory,
  CommunicationDueBadge, 
  CommunicationDeadlineNotice, 
} from '../common/UIComponents';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { DrawerEntityType } from '../common/EntityDrawer';
import { QuickCreateTab } from '../common/QuickCreateModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const ProgramDetailView: React.FC<{
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onDeleteRequest?: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: (tab?: QuickCreateTab) => void;
  onOpenCreateIndicator?: () => void;
}> = ({ onOpenEntity, onDeleteRequest, onOpenQuickCreate, onOpenCreateIndicator }) => {
  const {
    programs,
    updateProgram,
    selectedProgramId,
    setSelectedProgramId,
    programSummaries,
    tasks,
    indicators,
    financialPeriods,
    budgetComponents,
    budget2025Notes,
    purchases,
    meetings,
    emails,
    questions,
    knowledge,
    hrRecords,
    eleamCases,
    establishments,
    completeTask,
    reopenTask,
    quickUpdateTaskStatus,
    updateTask,
    updatePurchase,
    updateMeeting,
    deleteMeeting,
    deleteMeetingCommitment,
    convertCommitmentToTask,
    toggleMeetingCommitmentStatus,
    updateFinancialPeriod,
    addFinancialPeriod,
    deleteFinancialPeriod,
    addBudgetComponent,
    updateBudgetComponent,
    deleteBudgetComponent,
    updateBudget2025Note,
    addHRRecord,
    updateHRRecord,
    deleteHRRecord,
    updateEmail,
    convertEmailToTask,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'resumen'
    | 'indicadores'
    | 'presupuesto'
    | 'compras'
    | 'tareas'
    | 'reuniones'
    | 'correos'
    | 'preguntas'
    | 'rrhh'
    | 'conocimiento'
    | 'eleam'
  >('resumen');

  const [selectedCut, setSelectedCut] = useState<'corte1' | 'corte2'>('corte1');

  // Editable top budget summary cards state
  const [isEditingBudgetCards, setIsEditingBudgetCards] = useState(false);
  const [budgetEditAuthorized, setBudgetEditAuthorized] = useState<number | string>(0);
  const [budgetEditSpent, setBudgetEditSpent] = useState<number | string>(0);

  // Editable financial item modal state
  const [editingFinancial, setEditingFinancial] = useState<FinancialPeriod | null>(null);
  const [isCreatingFinancial, setIsCreatingFinancial] = useState(false);
  const [financialForm, setFinancialForm] = useState<{
    periodName: string;
    subprogramId: string;
    assignedBudget: number;
    modifications: number;
    executedAmount: number;
    committedAmount: number;
    notes: string;
    cutoffDate: string;
    year: number;
  }>({
    periodName: '',
    subprogramId: '',
    assignedBudget: 0,
    modifications: 0,
    executedAmount: 0,
    committedAmount: 0,
    notes: '',
    cutoffDate: new Date().toISOString().split('T')[0],
    year: 2026,
  });

  // State for Budget Components management
  const [editingComponent, setEditingComponent] = useState<BudgetComponent | null>(null);
  const [isCreatingComponent, setIsCreatingComponent] = useState(false);
  const [componentForm, setComponentForm] = useState<{
    name: string;
    category: string;
    budgetToSpend: number;
    spentAmount: number;
    notes: string;
  }>({
    name: '',
    category: 'Operacional',
    budgetToSpend: 0,
    spentAmount: 0,
    notes: '',
  });

  // State for 2025 Budget Note editing
  const [isEditing2025Note, setIsEditing2025Note] = useState(false);
  const [note2025Form, setNote2025Form] = useState<{
    budgetAmount: number | string;
    fulfillmentRate: number | string;
  }>({
    budgetAmount: 0,
    fulfillmentRate: 99,
  });

  // Helper to format establishment name with backward compatibility
  const getEstDisplayName = (idOrCode: string) => {
    const est = (establishments || []).find((e) => e.id === idOrCode || e.code === idOrCode);
    if (est) return est.name;
    if (idOrCode === 'cesfam_manuel_bustos' || idOrCode === 'MBH') return 'Cesfam MBH';
    if (idOrCode === 'cesfam_salvador_allende' || idOrCode === 'PSA' || idOrCode === 'PSAG') return 'Cesfam PSAG';
    if (idOrCode === 'cesfam_irene_frei' || idOrCode === 'IFC') return 'Cesfam IFC';
    if (idOrCode === 'cesfam_mur' || idOrCode === 'MUR') return 'Cesfam MUR';
    if (idOrCode === 'cecosf_el_manio' || idOrCode === 'cecosf_pdl' || idOrCode === 'PDL') return 'CECOSF PDL';
    if (idOrCode === 'cecosf_lf' || idOrCode === 'LF') return 'CECOSF LF';
    if (idOrCode === 'cecosf_pucara' || idOrCode === 'cecosf_bph' || idOrCode === 'BPH') return 'CECOSF BPH';
    if (idOrCode === 'direccion_salud' || idOrCode === 'desam' || idOrCode === 'DISAM') return 'DESAM';
    if (idOrCode === 'comunal' || idOrCode === 'COM') return 'Comunal';
    return idOrCode || '—';
  };

  // Filter states
  const [purchaseFilter, setPurchaseFilter] = useState<'pendiente' | 'en_ejecucion' | 'completado' | 'por_hacer' | 'realizado'>('pendiente');
  const [taskFilter, setTaskFilter] = useState<'todos' | 'pendiente' | 'en_ejecucion' | 'completado' | 'vence_hoy' | 'vencido'>('todos');
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskCard, setDragOverTaskCard] = useState<'pendiente' | 'en_ejecucion' | 'completado' | 'vence_hoy' | 'vencido' | null>(null);

  const [meetingCommitmentFilter, setMeetingCommitmentFilter] = useState<'todos' | 'pendiente' | 'en_ejecucion' | 'completado' | 'vence_hoy' | 'vencido'>('todos');
  const [meetingSearchQuery, setMeetingSearchQuery] = useState<string>('');
  const [draggedMeetingId, setDraggedMeetingId] = useState<string | null>(null);
  const [dragOverMeetingCard, setDragOverMeetingCard] = useState<'pendiente' | 'en_ejecucion' | 'completado' | 'vence_hoy' | 'vencido' | null>(null);

  const [emailStatusFilter, setEmailStatusFilter] = useState<'todos' | 'pendiente' | 'en_gestion' | 'cerrado' | 'vence_hoy' | 'vencido'>('todos');
  const [emailTypeFilter, setEmailTypeFilter] = useState<string>('todos');
  const [emailUrgencyFilter, setEmailUrgencyFilter] = useState<'todos' | 'vencidos' | 'hoy'>('todos');
  const [emailSearchQuery, setEmailSearchQuery] = useState<string>('');
  const [draggedEmailId, setDraggedEmailId] = useState<string | null>(null);
  const [dragOverCard, setDragOverCard] = useState<'pendiente' | 'en_gestion' | 'cerrado' | 'vence_hoy' | 'vencido' | null>(null);
  const [editingHR, setEditingHR] = useState<HRRecord | null>(null);
  const [isCreatingHR, setIsCreatingHR] = useState(false);
  const [hrToDelete, setHrToDelete] = useState<HRRecord | null>(null);
  const [componentToDelete, setComponentToDelete] = useState<BudgetComponent | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [commitmentToDelete, setCommitmentToDelete] = useState<{
    meetingId: string;
    commitmentId: string;
    description: string;
  } | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [hrForm, setHrForm] = useState<{
    name: string;
    profession: string;
    role: string;
    establishmentId: string;
    workdayHours: number;
    programHours: number;
    contractType: 'Contrata' | 'Planta' | 'Honorarios' | 'Código del Trabajo';
    status: 'activo' | 'vacante' | 'ausencia' | 'en_proceso_seleccion';
    functions: string;
    notes: string;
  }>({
    name: '',
    profession: '',
    role: '',
    establishmentId: establishments[0]?.id || 'comunal',
    workdayHours: 44,
    programHours: 44,
    contractType: 'Contrata',
    status: 'activo',
    functions: '',
    notes: '',
  });

  const handleOpenEditHR = (h: HRRecord) => {
    setEditingHR(h);
    setIsCreatingHR(false);
    setHrForm({
      name: h.name || '',
      profession: h.profession || '',
      role: h.role || '',
      establishmentId: h.establishmentId || establishments[0]?.id || 'comunal',
      workdayHours: h.workdayHours || 44,
      programHours: h.programHours || 44,
      contractType: h.contractType || 'Contrata',
      status: h.status || 'activo',
      functions: h.functions || '',
      notes: h.notes || '',
    });
  };

  const handleHRFormFieldChange = (fieldUpdates: Partial<typeof hrForm>) => {
    const updated = { ...hrForm, ...fieldUpdates };
    setHrForm(updated);

    if (editingHR) {
      updateHRRecord(
        editingHR.id,
        {
          ...(fieldUpdates.name !== undefined ? { name: fieldUpdates.name } : {}),
          ...(fieldUpdates.profession !== undefined ? { profession: fieldUpdates.profession } : {}),
          ...(fieldUpdates.role !== undefined ? { role: fieldUpdates.role } : {}),
          ...(fieldUpdates.establishmentId !== undefined ? { establishmentId: fieldUpdates.establishmentId } : {}),
          ...(fieldUpdates.programHours !== undefined ? { programHours: Number(fieldUpdates.programHours) || 0, workdayHours: Number(fieldUpdates.programHours) || 0 } : {}),
          ...(fieldUpdates.workdayHours !== undefined ? { workdayHours: Number(fieldUpdates.workdayHours) || 0 } : {}),
          ...(fieldUpdates.contractType !== undefined ? { contractType: fieldUpdates.contractType } : {}),
          ...(fieldUpdates.status !== undefined ? { status: fieldUpdates.status as any } : {}),
          ...(fieldUpdates.functions !== undefined ? { functions: fieldUpdates.functions } : {}),
          ...(fieldUpdates.notes !== undefined ? { notes: fieldUpdates.notes } : {}),
        },
        true // silent real-time update
      );
    }
  };

  const handleOpenCreateHR = () => {
    setEditingHR(null);
    setIsCreatingHR(true);
    setHrForm({
      name: '',
      profession: '',
      role: '',
      establishmentId: establishments[0]?.id || 'comunal',
      workdayHours: 44,
      programHours: 44,
      contractType: 'Contrata',
      status: 'activo',
      functions: '',
      notes: '',
    });
  };

  const handleStartDeleteHR = (h: HRRecord) => {
    setHrToDelete(h);
    setDeleteConfirmationText('');
  };

  const handleConfirmDeleteHR = () => {
    if (!hrToDelete) return;
    if (deleteConfirmationText.trim().toUpperCase() !== 'OK') return;
    deleteHRRecord(hrToDelete.id);
    setHrToDelete(null);
    setDeleteConfirmationText('');
  };

  const handleSaveHR = () => {
    if (!hrForm.name.trim()) return;

    if (editingHR) {
      updateHRRecord(
        editingHR.id,
        {
          name: hrForm.name.trim(),
          profession: hrForm.profession.trim(),
          role: hrForm.role.trim(),
          establishmentId: hrForm.establishmentId,
          workdayHours: Number(hrForm.workdayHours) || 44,
          programHours: Number(hrForm.programHours) || 44,
          contractType: hrForm.contractType,
          status: hrForm.status as any,
          functions: hrForm.functions.trim(),
          notes: hrForm.notes.trim() || undefined,
        },
        false // trigger audit and toast
      );
      setEditingHR(null);
    } else if (isCreatingHR) {
      addHRRecord({
        programId: currentProgram.id,
        name: hrForm.name.trim(),
        profession: hrForm.profession.trim(),
        role: hrForm.role.trim(),
        establishmentId: hrForm.establishmentId,
        workdayHours: Number(hrForm.workdayHours) || 44,
        programHours: Number(hrForm.programHours) || 44,
        contractType: hrForm.contractType,
        startDate: new Date().toISOString().split('T')[0],
        status: hrForm.status as any,
        functions: hrForm.functions.trim() || 'Atención y coordinación del programa de salud en establecimiento asignado.',
        notes: hrForm.notes.trim() || undefined,
      });
      setIsCreatingHR(false);
    }
  };

  const handleOpenEditComponent = (comp: BudgetComponent) => {
    setEditingComponent(comp);
    setIsCreatingComponent(false);
    setComponentForm({
      name: comp.name,
      category: comp.category || 'Operacional',
      budgetToSpend: comp.budgetToSpend || 0,
      spentAmount: comp.spentAmount || 0,
      notes: comp.notes || '',
    });
  };

  const handleOpenCreateComponent = (suggestedName?: string, suggestedCat?: string) => {
    setEditingComponent(null);
    setIsCreatingComponent(true);
    setComponentForm({
      name: suggestedName || '',
      category: suggestedCat || 'Operacional',
      budgetToSpend: 0,
      spentAmount: 0,
      notes: '',
    });
  };

  const handleSaveComponent = () => {
    if (!componentForm.name.trim()) return;

    if (editingComponent) {
      updateBudgetComponent(editingComponent.id, {
        name: componentForm.name.trim(),
        category: componentForm.category.trim() || undefined,
        budgetToSpend: Number(componentForm.budgetToSpend) || 0,
        spentAmount: Number(componentForm.spentAmount) || 0,
        notes: componentForm.notes.trim() || undefined,
      });
      setEditingComponent(null);
    } else if (isCreatingComponent) {
      addBudgetComponent({
        programId: currentProgram.id,
        name: componentForm.name.trim(),
        category: componentForm.category.trim() || undefined,
        budgetToSpend: Number(componentForm.budgetToSpend) || 0,
        spentAmount: Number(componentForm.spentAmount) || 0,
        notes: componentForm.notes.trim() || undefined,
        year: 2026,
      });
      setIsCreatingComponent(false);
    }
  };

  const handleOpenEditFinancial = (it: FinancialPeriod) => {
    setEditingFinancial(it);
    setIsCreatingFinancial(false);
    setFinancialForm({
      periodName: it.periodName,
      subprogramId: it.subprogramId || '',
      assignedBudget: it.assignedBudget || 0,
      modifications: it.modifications || 0,
      executedAmount: it.executedAmount || 0,
      committedAmount: it.committedAmount || 0,
      notes: it.notes || '',
      cutoffDate: it.cutoffDate || new Date().toISOString().split('T')[0],
      year: it.year || 2026,
    });
  };

  const handleOpenCreateFinancial = () => {
    setEditingFinancial(null);
    setIsCreatingFinancial(true);
    setFinancialForm({
      periodName: 'Presupuesto 2026',
      subprogramId: '',
      assignedBudget: 0,
      modifications: 0,
      executedAmount: 0,
      committedAmount: 0,
      notes: '',
      cutoffDate: new Date().toISOString().split('T')[0],
      year: 2026,
    });
  };

  const handleSaveFinancial = () => {
    if (!financialForm.periodName.trim()) return;

    if (editingFinancial) {
      updateFinancialPeriod(editingFinancial.id, {
        periodName: financialForm.periodName,
        subprogramId: financialForm.subprogramId.trim() || undefined,
        assignedBudget: Number(financialForm.assignedBudget) || 0,
        modifications: Number(financialForm.modifications) || 0,
        executedAmount: Number(financialForm.executedAmount) || 0,
        committedAmount: Number(financialForm.committedAmount) || 0,
        notes: financialForm.notes.trim() || undefined,
        cutoffDate: financialForm.cutoffDate,
        year: Number(financialForm.year) || 2026,
      });
      setEditingFinancial(null);
    } else if (isCreatingFinancial) {
      addFinancialPeriod({
        programId: currentProgram.id,
        periodName: financialForm.periodName,
        subprogramId: financialForm.subprogramId.trim() || undefined,
        assignedBudget: Number(financialForm.assignedBudget) || 0,
        modifications: Number(financialForm.modifications) || 0,
        executedAmount: Number(financialForm.executedAmount) || 0,
        committedAmount: Number(financialForm.committedAmount) || 0,
        projectedAmount: 0,
        notes: financialForm.notes.trim() || undefined,
        cutoffDate: financialForm.cutoffDate,
        year: Number(financialForm.year) || 2026,
      });
      setIsCreatingFinancial(false);
    }
  };

  const currentProgram = programs.find((p) => p.id === selectedProgramId) || programs[0];
  const summary = programSummaries[currentProgram.id];

  // Scoped Data
  const programTasks = tasks.filter((t) => !t.archived && t.programId === currentProgram.id);
  const programIndicators = indicators.filter((i) => !i.archived && i.programId === currentProgram.id);
  const programFinancials = (financialPeriods || []).filter((f) => f.programId === currentProgram.id);
  const progComponents = (budgetComponents || []).filter((c) => c.programId === currentProgram.id);
  const totalComponentBudget = progComponents.reduce((acc, c) => acc + (c.budgetToSpend || 0), 0);
  const totalComponentSpent = progComponents.reduce((acc, c) => acc + (c.spentAmount || 0), 0);

  // Active Fiscal Year & Previous Reference Year
  // Determines current active year from program financials or fallback to current calendar year
  const currentYear = programFinancials.length > 0
    ? Math.max(...programFinancials.map((f) => f.year || 2026))
    : new Date().getFullYear();
  const previousYear = currentYear - 1;

  // Resolve previous year historical budget (automatic fallback + real-time storage)
  const resolvePreviousYearBudget = () => {
    const key = `${currentProgram.id}_${previousYear}`;
    const stored = budget2025Notes[key] || (previousYear === 2025 ? budget2025Notes[currentProgram.id] : undefined);
    if (stored && stored.budgetAmount > 0) {
      const rate = stored.fulfillmentRate !== undefined
        ? stored.fulfillmentRate
        : (stored.executedAmount && stored.budgetAmount ? ((stored.executedAmount / stored.budgetAmount) * 100) : 99.2);
      return {
        year: previousYear,
        budgetAmount: stored.budgetAmount,
        fulfillmentRate: Number(rate.toFixed(1)),
      };
    }

    // Check if there are historical financial periods for previousYear
    const prevFinancials = (financialPeriods || []).filter((f) => f.programId === currentProgram.id && f.year === previousYear);
    if (prevFinancials.length > 0) {
      const prevAssigned = prevFinancials.reduce((acc, f) => acc + (f.assignedBudget || 0) + (f.modifications || 0), 0);
      const prevSpent = prevFinancials.reduce((acc, f) => acc + (f.executedAmount || 0), 0);
      const rate = prevAssigned > 0 ? (prevSpent / prevAssigned) * 100 : 99.0;
      return {
        year: previousYear,
        budgetAmount: prevAssigned,
        fulfillmentRate: Number(rate.toFixed(1)),
      };
    }

    // Fallback for 2025 if in initial data
    const fallback = budget2025Notes[currentProgram.id];
    if (fallback && fallback.budgetAmount > 0) {
      const rate = fallback.fulfillmentRate !== undefined
        ? fallback.fulfillmentRate
        : (fallback.executedAmount && fallback.budgetAmount ? ((fallback.executedAmount / fallback.budgetAmount) * 100) : 99.2);
      return {
        year: previousYear,
        budgetAmount: fallback.budgetAmount,
        fulfillmentRate: Number(rate.toFixed(1)),
      };
    }

    return {
      year: previousYear,
      budgetAmount: 0,
      fulfillmentRate: 99.0,
    };
  };

  const prevYearData = resolvePreviousYearBudget();

  const handleStartEdit2025Note = () => {
    setNote2025Form({
      budgetAmount: prevYearData.budgetAmount,
      fulfillmentRate: prevYearData.fulfillmentRate,
    });
    setIsEditing2025Note(true);
  };

  const handleSave2025Note = () => {
    updateBudget2025Note(
      currentProgram.id,
      {
        budgetAmount: Number(note2025Form.budgetAmount) || 0,
        fulfillmentRate: Number(note2025Form.fulfillmentRate) || 0,
        year: previousYear,
        note: `Presupuesto ${previousYear}`,
      },
      previousYear
    );
    setIsEditing2025Note(false);
  };

  const totalAssigned = programFinancials.reduce((acc, f) => acc + (f.assignedBudget || 0) + (f.modifications || 0), 0);
  // Presupuesto gastado: Si el programa tiene componentes definidos (como CPU con sus 5 componentes), es la suma exacta de lo gastado en los componentes
  const totalExecuted = progComponents.length > 0
    ? totalComponentSpent
    : programFinancials.reduce((acc, f) => acc + (f.executedAmount || 0), 0);
  const totalCommitted = programFinancials.reduce((acc, f) => acc + (f.committedAmount || 0), 0);
  const totalAvailable = Math.max(0, totalAssigned - totalExecuted - totalCommitted);

  const programPurchases = purchases.filter((p) => !p.archived && p.programId === currentProgram.id);
  const programMeetings = meetings.filter((m) => !m.archived && m.programId === currentProgram.id);
  const programEmails = emails.filter((e) => !e.archived && e.programId === currentProgram.id);
  const programQuestions = questions.filter((q) => !q.archived && q.programId === currentProgram.id);
  const programKnowledge = knowledge.filter((k) => !k.archived && k.programId === currentProgram.id);
  const programHR = hrRecords.filter((h) => !h.archived && h.programId === currentProgram.id);

  // Editable description state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(currentProgram.description || '');

  // Keep edited description synced when selected program changes
  useEffect(() => {
    setEditedDescription(currentProgram.description || '');
    setIsEditingDescription(false);
  }, [currentProgram.id, currentProgram.description]);

  const handleStartEditingBudgetCards = () => {
    setBudgetEditAuthorized(totalAssigned);
    setBudgetEditSpent(totalExecuted);
    setIsEditingBudgetCards(true);
  };

  const handleCancelEditingBudgetCards = () => {
    setIsEditingBudgetCards(false);
  };

  const handleSaveBudgetCards = () => {
    const authVal = Math.max(0, Number(budgetEditAuthorized) || 0);
    const spentVal = Math.max(0, Number(budgetEditSpent) || 0);

    if (programFinancials.length === 0) {
      addFinancialPeriod({
        programId: currentProgram.id,
        periodName: `Presupuesto ${currentProgram.name} 2026`,
        assignedBudget: authVal,
        modifications: 0,
        executedAmount: spentVal,
        committedAmount: 0,
        projectedAmount: 0,
        cutoffDate: new Date().toISOString().split('T')[0],
        year: 2026,
      });
    } else {
      const mainFin = programFinancials[0];
      const otherAssigned = programFinancials.slice(1).reduce((acc, f) => acc + (f.assignedBudget || 0) + (f.modifications || 0), 0);
      const otherSpent = programFinancials.slice(1).reduce((acc, f) => acc + (f.executedAmount || 0), 0);

      const newMainAssigned = Math.max(0, authVal - otherAssigned - (mainFin.modifications || 0));
      const newMainSpent = Math.max(0, spentVal - otherSpent);

      updateFinancialPeriod(mainFin.id, {
        assignedBudget: newMainAssigned,
        executedAmount: newMainSpent,
      });
    }

    setIsEditingBudgetCards(false);
  };

  // Tab definitions - Simplified and compact for responsive mobile & desktop view
  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: TrendingUp },
    { id: 'indicadores', label: `Indicadores (${programIndicators.length})`, icon: TrendingUp },
    { id: 'presupuesto', label: 'Presupuesto', icon: DollarSign },
    { id: 'compras', label: `Compras (${programPurchases.length})`, icon: ShoppingBag },
    { id: 'tareas', label: `Tareas (${programTasks.filter((t) => t.status !== 'completada').length})`, icon: CheckSquare },
    { id: 'reuniones', label: `Reuniones (${programMeetings.length})`, icon: Users },
    { id: 'correos', label: `Correos (${programEmails.length})`, icon: Mail },
    { id: 'preguntas', label: `Dudas (${programQuestions.filter((q) => q.status !== 'resuelta').length})`, icon: HelpCircle },
    { id: 'rrhh', label: `RRHH (${programHR.length})`, icon: UserCheck },
    { id: 'conocimiento', label: `Tips (${programKnowledge.length})`, icon: Lightbulb },
  ];

  if (currentProgram.id === 'prog_personas_mayores') {
    tabs.push({ id: 'eleam', label: `ELEAM (${eleamCases.length})`, icon: FolderHeart });
  }

  return (
    <div id="view-program-detail" className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Program Top Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Title & Editable Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentProgram.color }} />
            <span className="font-mono text-xs font-bold text-slate-400">
              {currentProgram.code}
            </span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {currentProgram.name}
          </h1>

          {/* Editable Program Description */}
          {isEditingDescription ? (
            <div className="space-y-2 pt-1 max-w-3xl animate-in fade-in duration-100">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={3}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-indigo-300 rounded-xl p-3 focus:border-indigo-500 focus:bg-white focus:outline-none ring-2 ring-indigo-500/10 transition-all resize-y"
                placeholder="Ingrese la descripción del programa..."
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editedDescription.trim()) {
                      updateProgram(currentProgram.id, { description: editedDescription.trim() });
                      setIsEditingDescription(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Confirmar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditedDescription(currentProgram.description || '');
                    setIsEditingDescription(false);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 max-w-3xl group">
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentProgram.description}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditedDescription(currentProgram.description || '');
                  setIsEditingDescription(true);
                }}
                title="Editar descripción del programa"
                className="opacity-70 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all shrink-0 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation (Responsive wrap without horizontal scroll or awkward gaps) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2.5 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-program-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200/70'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT AREA */}

      {/* 1. RESUMEN / SALUD GENERAL */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Live Status Banner (Visible only in Resumen tab) */}
          {summary && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <TrafficLightBadge status={summary.status} />
                <div className="text-xs">
                  <span className="font-semibold text-slate-700">Diagnóstico: </span>
                  <span className="text-slate-600">{summary.statusReason}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Indicadores: </span>
                  <strong className="text-slate-800">{summary.indicatorsCompliance.toFixed(0)}%</strong>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className="text-slate-400 font-medium">Financiero: </span>
                  <strong className={summary.financialExecutionRate < 45 ? 'text-rose-600' : 'text-slate-800'}>
                    {summary.financialExecutionRate.toFixed(1)}%
                  </strong>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className="text-slate-400 font-medium">Vencidas: </span>
                  <strong className={summary.overdueTasksCount > 0 ? 'text-rose-600' : 'text-slate-800'}>
                    {summary.overdueTasksCount}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Quick Metrics */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumen Presupuestario
              </span>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-600 font-medium">Presupuesto autorizado SSMN</span>
                  <span className="font-bold text-emerald-600">
                    ${totalAssigned.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-600 font-medium">Presupuesto gastado</span>
                  <span className="font-bold text-rose-600">
                    ${totalExecuted.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between text-xs items-center pt-1 border-t border-slate-100 font-bold">
                  <span className="text-slate-700">Presupuesto disponible</span>
                  <span className="text-purple-600">
                    ${totalAvailable.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado de Indicadores */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estado de Indicadores ({programIndicators.length})
              </span>
              <div className="space-y-2">
                {programIndicators.slice(0, 3).map((ind) => (
                  <div key={ind.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate max-w-[180px]">{ind.name}</span>
                      <span className="font-bold text-slate-900">{ind.currentResult} / {ind.periodTarget}</span>
                    </div>
                    <ProgressBar
                      value={ind.periodTarget > 0 ? (ind.currentResult / ind.periodTarget) * 100 : 0}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Próximo Hito y Dotación */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hito Operativo & Personal
              </span>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Próximo Hito
                </span>
                <p className="text-indigo-950 font-medium">
                  {summary ? summary.nextMilestone : 'Sin hito próximo'}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Personal Asignado:</span>
                <strong className="text-slate-900">{programHR.length} profesionales</strong>
              </div>
            </div>
          </div>

          {/* Pending Tasks in this Program */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Tareas Pendientes de {currentProgram.shortName}
              </h3>
              <button
                onClick={() => setActiveTab('tareas')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Ver todas ({programTasks.length}) →
              </button>
            </div>

            <div className="space-y-2">
              {programTasks.filter((t) => t.status !== 'completada').length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No hay tareas pendientes en este programa.
                </p>
              ) : (
                programTasks
                  .filter((t) => t.status !== 'completada')
                  .slice(0, 4)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => completeTask(t.id)}
                          className="h-4 w-4 rounded border border-slate-300 hover:bg-emerald-50 text-emerald-600 flex items-center justify-center"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 opacity-0 hover:opacity-100" />
                        </button>
                        <div>
                          <span
                            onClick={() => onOpenEntity('task', t.id)}
                            className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                          >
                            {t.title}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>Resp: {t.responsible}</span>
                            <span>•</span>
                            <span className={t.dueDate < '2026-08-15' ? 'text-rose-600 font-bold' : ''}>
                              Vence: {formatDate(t.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <PriorityChip priority={t.priority} />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. METAS E INDICADORES */}
      {activeTab === 'indicadores' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-900">
                Indicadores SSMN
              </h3>

              {/* Botones de 1° corte y 2° corte */}
              <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setSelectedCut('corte1')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                    selectedCut === 'corte1'
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  1° corte
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCut('corte2')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                    selectedCut === 'corte2'
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  2° corte
                </button>
              </div>
            </div>
          </div>

          {/* Cuadro Resumen Global de Indicadores (mismo color bg-indigo-600) */}
          {(() => {
            const hasExplicitWeights = programIndicators.some(
              (i) => i.pesoRelativo !== undefined && i.pesoRelativo > 0
            );

            let totalWeight = 0;
            const items = programIndicators.map((ind) => {
              const cutTarget = selectedCut === 'corte1'
                ? (ind.corte1?.target ?? ind.periodTarget)
                : (ind.corte2?.target ?? ind.annualTarget);

              const cutResult = selectedCut === 'corte1'
                ? (ind.corte1?.result ?? ind.currentResult)
                : (ind.corte2?.result ?? ind.currentResult);

              let percent = 0;
              if (ind.direction === 'higher_is_better') {
                percent = cutTarget > 0 ? (cutResult / cutTarget) * 100 : 0;
              } else {
                percent = cutResult > 0 ? (cutTarget / cutResult) * 100 : 100;
              }

              let weight = ind.pesoRelativo;
              if (!hasExplicitWeights || weight === undefined || weight <= 0) {
                weight = programIndicators.length > 0
                  ? Math.round((100 / programIndicators.length) * 10) / 10
                  : 0;
              }

              totalWeight += weight;
              const contribution = (percent * weight) / 100;

              return {
                id: ind.id,
                code: ind.code,
                name: ind.name,
                unit: ind.unit,
                cutTarget,
                cutResult,
                weight,
                percent,
                contribution,
                isCompliant: percent >= 90,
              };
            });

            const weightedCompliance = totalWeight > 0
              ? items.reduce((acc, item) => acc + (item.percent * item.weight), 0) / totalWeight
              : 0;

            const meetsGoal = weightedCompliance >= 90;
            const formattedCompliance = Number(weightedCompliance.toFixed(1));

            return (
              <div className="rounded-2xl bg-indigo-600 text-white p-3.5 sm:p-4 shadow-md border border-indigo-500/60 space-y-3">
                {/* Header of Global Summary */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/15 backdrop-blur-xs border border-white/20 text-white shadow-xs">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        Resumen Global de Indicadores
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                        {selectedCut === 'corte1' ? '1° Corte' : '2° Corte'}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Status: CUMPLE / NO CUMPLE (más compacto) */}
                  <div className="flex items-center gap-1.5">
                    {meetsGoal ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-black tracking-wide shadow-xs uppercase border border-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Cumple</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-black tracking-wide shadow-xs uppercase border border-rose-400">
                        <AlertTriangle className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>No Cumple</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* % Cumplimiento Global Metric Card (más compacto) */}
                <div className="bg-indigo-700/70 rounded-xl p-3 border border-indigo-400/25 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                      % Cumplimiento Global
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {formattedCompliance}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-indigo-950/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        meetsGoal ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, formattedCompliance))}%` }}
                    />
                  </div>
                </div>

                {/* Desglose Individual de Aportes Ponderados */}
                {items.length > 0 && (
                  <div className="pt-2 border-t border-indigo-500/40 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">
                      Aporte por Indicador ({selectedCut === 'corte1' ? '1° Corte' : '2° Corte'}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-indigo-800/70 border border-indigo-400/20 px-3 py-2 rounded-xl text-xs gap-2"
                        >
                          <div className="truncate min-w-0">
                            <span className="font-mono font-bold text-indigo-200 mr-1.5">
                              {item.code}:
                            </span>
                            <span className="text-white font-medium truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-indigo-200 font-semibold">
                              Peso {item.weight}%
                            </span>
                            <span className="font-bold text-white bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-400/30">
                              {item.percent.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Botón Nuevo Indicador debajo del Resumen Global */}
          <div className="flex items-center justify-start">
            <button
              onClick={() => {
                if (onOpenCreateIndicator) {
                  onOpenCreateIndicator();
                } else {
                  onOpenQuickCreate();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Nuevo Indicador
            </button>
          </div>

          {/* Mobile Card List (sm:hidden) */}
          <div className="block sm:hidden space-y-3">
            {programIndicators.map((ind) => {
              const cutTarget = selectedCut === 'corte1'
                ? (ind.corte1?.target ?? ind.periodTarget)
                : (ind.corte2?.target ?? ind.annualTarget);

              const cutResult = selectedCut === 'corte1'
                ? (ind.corte1?.result ?? ind.currentResult)
                : (ind.corte2?.result ?? ind.currentResult);

              let percent = 0;
              if (ind.direction === 'higher_is_better') {
                percent = cutTarget > 0 ? (cutResult / cutTarget) * 100 : 0;
              } else {
                percent = cutResult > 0 ? (cutTarget / cutResult) * 100 : 100;
              }

              const isCritical = percent < 70;
              const isYellow = percent >= 70 && percent < 90;

              let gap = 0;
              let isGapPositive = false;
              if (ind.direction === 'higher_is_better') {
                gap = cutTarget - cutResult;
                isGapPositive = gap > 0;
              } else {
                gap = cutResult - cutTarget;
                isGapPositive = gap > 0;
              }
              const formattedGap = Number(Math.abs(gap).toFixed(2));

              return (
                <div
                  key={ind.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {ind.code}
                        </span>
                        {ind.pesoRelativo !== undefined && (
                          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100/70 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                            Peso {ind.pesoRelativo}%
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {ind.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenEntity('indicator', ind.id)}
                        className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all"
                        title="Ver en pantalla completa"
                        aria-label="Editar"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      {onDeleteRequest && (
                        <button
                          onClick={() => onDeleteRequest('indicator', ind.id)}
                          className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 transition-all"
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Meta {selectedCut === 'corte1' ? '1° Corte' : '2° Corte'}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {cutTarget} {ind.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">Resultado</span>
                      <span className="font-bold text-slate-900">
                        {cutResult} {ind.unit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] font-medium">Cumplimiento</span>
                      <span
                        className={`font-bold ${
                          isCritical ? 'text-rose-600' : isYellow ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={percent}
                      colorScheme={isCritical ? 'rose' : isYellow ? 'amber' : 'emerald'}
                      size="sm"
                    />
                    <div className="text-[11px] font-medium pt-0.5">
                      {ind.direction === 'higher_is_better' ? (
                        isGapPositive ? (
                          <span className="text-amber-700">Faltan {formattedGap} {ind.unit}</span>
                        ) : (
                          <span className="text-emerald-700">Cumplida (+{formattedGap} {ind.unit})</span>
                        )
                      ) : (
                        isGapPositive ? (
                          <span className="text-rose-700">Exceso +{formattedGap} {ind.unit}</span>
                        ) : (
                          <span className="text-emerald-700">En meta ({cutResult} {ind.unit})</span>
                        )
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenEntity('indicator', ind.id)}
                    className="w-full py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Abrir Ficha Completa</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table (hidden sm:block) */}
          <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                    <th className="p-3.5">Indicador</th>
                    <th className="p-3.5">Nombre del Indicador</th>
                    <th className="p-3.5 text-center">Peso</th>
                    <th className="p-3.5 text-center">Meta Anual</th>
                    <th className="p-3.5 text-center">
                      {selectedCut === 'corte1' ? 'Meta 1° Corte' : 'Meta 2° Corte'}
                    </th>
                    <th className="p-3.5 text-center">Resultado</th>
                    <th className="p-3.5">Cumplimiento</th>
                    <th className="p-3.5">Brecha</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programIndicators.map((ind) => {
                    const cutTarget = selectedCut === 'corte1'
                      ? (ind.corte1?.target ?? ind.periodTarget)
                      : (ind.corte2?.target ?? ind.annualTarget);

                    const cutResult = selectedCut === 'corte1'
                      ? (ind.corte1?.result ?? ind.currentResult)
                      : (ind.corte2?.result ?? ind.currentResult);

                    let percent = 0;
                    if (ind.direction === 'higher_is_better') {
                      percent = cutTarget > 0 ? (cutResult / cutTarget) * 100 : 0;
                    } else {
                      percent = cutResult > 0 ? (cutTarget / cutResult) * 100 : 100;
                    }

                    const isCritical = percent < 70;
                    const isYellow = percent >= 70 && percent < 90;

                    // Format gap cleanly without floating point precision artifacts
                    let gap = 0;
                    let isGapPositive = false;
                    if (ind.direction === 'higher_is_better') {
                      gap = cutTarget - cutResult;
                      isGapPositive = gap > 0;
                    } else {
                      gap = cutResult - cutTarget;
                      isGapPositive = gap > 0;
                    }
                    const formattedGap = Number(Math.abs(gap).toFixed(2));

                    return (
                      <tr key={ind.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-indigo-700">
                          {ind.code}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 max-w-xs">
                          {ind.name}
                        </td>
                        <td className="p-3.5 text-center font-bold text-indigo-700">
                          <span className="bg-indigo-50 px-2 py-1 rounded-md text-[11px]">
                            {ind.pesoRelativo ?? 50}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-medium text-slate-700">
                          {ind.annualTarget} {ind.unit}
                        </td>
                        <td className="p-3.5 text-center font-medium text-slate-700">
                          {cutTarget} {ind.unit}
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-900">
                          {cutResult} {ind.unit}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2 w-28">
                            <ProgressBar
                              value={percent}
                              colorScheme={isCritical ? 'rose' : isYellow ? 'amber' : 'emerald'}
                              size="sm"
                            />
                            <span
                              className={`font-bold ${
                                isCritical ? 'text-rose-600' : isYellow ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              {percent.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-600">
                          {ind.direction === 'higher_is_better' ? (
                            isGapPositive ? (
                              <span className="text-amber-700 font-semibold">
                                Faltan {formattedGap} {ind.unit}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">
                                Cumplida (+{formattedGap} {ind.unit})
                              </span>
                            )
                          ) : (
                            isGapPositive ? (
                              <span className="text-rose-700 font-semibold">
                                Exceso +{formattedGap} {ind.unit}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">
                                En meta ({cutResult} {ind.unit})
                              </span>
                            )
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenEntity('indicator', ind.id)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                              title="Editar / Ver detalle"
                              aria-label="Editar"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            {onDeleteRequest && (
                              <button
                                onClick={() => onDeleteRequest('indicator', ind.id)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                                title="Eliminar indicador"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRESUPUESTO Y FINANZAS */}
      {activeTab === 'presupuesto' && (
        <div className="space-y-6">
          {/* Action bar when editing budget cards */}
          {isEditingBudgetCards && (
            <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in duration-150">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Pencil className="h-3.5 w-3.5 text-emerald-600" /> Editando valores del presupuesto
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEditingBudgetCards}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-xs"
                >
                  <X className="h-3.5 w-3.5" /> Cancelar
                </button>
                <button
                  onClick={handleSaveBudgetCards}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" /> Guardar Presupuesto
                </button>
              </div>
            </div>
          )}

          {/* Top 3 Summary Cards */}
          {(() => {
            const liveAuthorizedNum = isEditingBudgetCards
              ? (parseFloat(String(budgetEditAuthorized)) || 0)
              : totalAssigned;
            const liveSpentNum = isEditingBudgetCards
              ? (parseFloat(String(budgetEditSpent)) || 0)
              : totalExecuted;
            const liveAvailableNum = Math.max(0, liveAuthorizedNum - liveSpentNum - totalCommitted);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Presupuesto autorizado por SSMN (Verde - Editable) */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-2 relative ${
                    isEditingBudgetCards
                      ? 'border-emerald-400 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-emerald-200 bg-emerald-50/50 shadow-xs hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Presupuesto autorizado por SSMN
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!isEditingBudgetCards && (
                        <button
                          onClick={handleStartEditingBudgetCards}
                          className="p-1 rounded-md text-emerald-700 hover:bg-emerald-200/60 transition-colors"
                          title="Editar presupuesto autorizado"
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <span className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700">
                        <DollarSign className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  {isEditingBudgetCards ? (
                    <div className="space-y-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 font-bold text-lg pointer-events-none">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={budgetEditAuthorized}
                          onChange={(e) =>
                            setBudgetEditAuthorized(
                              e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveBudgetCards();
                            if (e.key === 'Escape') handleCancelEditingBudgetCards();
                          }}
                          placeholder="0"
                          className="w-full pl-8 pr-3 py-1.5 text-xl sm:text-2xl font-black text-emerald-800 bg-white border border-emerald-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono tracking-tight shadow-inner"
                          autoFocus
                        />
                      </div>
                      <div className="text-[11px] font-bold text-emerald-700">
                        ${liveAuthorizedNum.toLocaleString('es-CL')}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={handleStartEditingBudgetCards}
                      className="cursor-pointer group flex items-baseline gap-1"
                      title="Haz clic para editar"
                    >
                      <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight group-hover:text-emerald-800 transition-colors font-mono">
                        ${totalAssigned.toLocaleString('es-CL')}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-emerald-600 font-medium">
                    Marco global vigente {currentYear} aprobado por convenio
                  </p>
                </div>

                {/* 2. Presupuesto gastado (Rojo - Editable) */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-2 relative ${
                    isEditingBudgetCards
                      ? 'border-rose-400 bg-rose-50/80 shadow-md ring-2 ring-rose-500/20'
                      : 'border-rose-200 bg-rose-50/50 shadow-xs hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                      Presupuesto gastado
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!isEditingBudgetCards && (
                        <button
                          onClick={handleStartEditingBudgetCards}
                          className="p-1 rounded-md text-rose-700 hover:bg-rose-200/60 transition-colors"
                          title="Editar presupuesto gastado"
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <span className="p-1.5 rounded-lg bg-rose-100/80 text-rose-700">
                        <DollarSign className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  {isEditingBudgetCards ? (
                    <div className="space-y-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-600 font-bold text-lg pointer-events-none">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={budgetEditSpent}
                          onChange={(e) =>
                            setBudgetEditSpent(
                              e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveBudgetCards();
                            if (e.key === 'Escape') handleCancelEditingBudgetCards();
                          }}
                          placeholder="0"
                          className="w-full pl-8 pr-3 py-1.5 text-xl sm:text-2xl font-black text-rose-700 bg-white border border-rose-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono tracking-tight shadow-inner"
                        />
                      </div>
                      <div className="text-[11px] font-bold text-rose-600">
                        ${liveSpentNum.toLocaleString('es-CL')}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={handleStartEditingBudgetCards}
                      className="cursor-pointer group flex items-baseline gap-1"
                      title="Haz clic para editar"
                    >
                      <p className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight group-hover:text-rose-700 transition-colors font-mono">
                        ${totalExecuted.toLocaleString('es-CL')}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-rose-500 font-medium">
                    Gasto acumulado devengado / pagado {currentYear}
                  </p>
                </div>

                {/* 3. Presupuesto disponible (Morado - Automático en tiempo real) */}
                <div className="p-4 sm:p-5 rounded-2xl border border-purple-200 bg-purple-50/50 shadow-xs space-y-2 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                      Presupuesto disponible
                    </span>
                    <span className="p-1.5 rounded-lg bg-purple-100/80 text-purple-700">
                      <DollarSign className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight font-mono">
                      ${liveAvailableNum.toLocaleString('es-CL')}
                    </p>
                    {isEditingBudgetCards && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 animate-pulse">
                        En tiempo real: ${liveAuthorizedNum.toLocaleString('es-CL')} - ${liveSpentNum.toLocaleString('es-CL')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-purple-600 font-medium">
                    Saldo libre para nuevas compras o asignaciones {currentYear}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* NOTA DISCRETA Y COMPACTA: PRESUPUESTO AÑO ANTERIOR (DINÁMICO SEGÚN AÑO ACTIVO) */}
          {(() => {
            return (
              <div
                className={`py-1.5 px-2.5 sm:px-3 rounded-lg border transition-all ${
                  isEditing2025Note
                    ? 'border-amber-400 bg-amber-50/95 shadow-xs ring-1 ring-amber-400/30'
                    : 'border-amber-200/60 bg-amber-50/40 shadow-2xs hover:border-amber-300'
                }`}
              >
                {isEditing2025Note ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-amber-700" />
                        Editar Presupuesto {previousYear} (Histórico)
                      </span>
                      <button
                        onClick={() => setIsEditing2025Note(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 text-xs transition-colors"
                        title="Cerrar edición"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="block text-[10px] font-bold text-amber-900">
                          Presupuesto {previousYear} ($ CLP)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-700 font-bold text-[11px] pointer-events-none">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={note2025Form.budgetAmount}
                            onChange={(e) =>
                              setNote2025Form({
                                ...note2025Form,
                                budgetAmount: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave2025Note();
                              if (e.key === 'Escape') setIsEditing2025Note(false);
                            }}
                            className="w-full pl-5 pr-2 py-0.5 text-xs font-bold text-amber-950 bg-white border border-amber-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="block text-[10px] font-bold text-amber-900">
                          % Cumplido {previousYear}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={note2025Form.fulfillmentRate}
                            onChange={(e) =>
                              setNote2025Form({
                                ...note2025Form,
                                fulfillmentRate: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave2025Note();
                              if (e.key === 'Escape') setIsEditing2025Note(false);
                            }}
                            className="w-full px-2 pr-5 py-0.5 text-xs font-bold text-amber-950 bg-white border border-amber-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-700 font-bold text-[11px] pointer-events-none">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-0.5">
                      <button
                        onClick={() => setIsEditing2025Note(false)}
                        className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave2025Note}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold hover:bg-amber-700 transition-colors shadow-2xs"
                      >
                        <Check className="h-3 w-3" /> Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 py-0.5">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-200/80">
                        <Calendar className="h-3 w-3 text-amber-700" />
                        Presupuesto {previousYear}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          onClick={handleStartEdit2025Note}
                          className="font-bold text-amber-950 font-mono text-xs sm:text-sm cursor-pointer hover:text-amber-800 transition-colors"
                          title="Clic para editar"
                        >
                          ${Number(prevYearData.budgetAmount || 0).toLocaleString('es-CL')}
                        </span>
                        <span className="text-amber-300 font-light">•</span>
                        <span className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                          {Number(prevYearData.fulfillmentRate || 0).toFixed(1)}% cumplido
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleStartEdit2025Note}
                      className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100/80 rounded-md transition-colors"
                      title={`Editar presupuesto ${previousYear}`}
                      aria-label="Editar presupuesto año anterior"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* COMPONENTES PRESUPUESTARIOS CONTEMPLADOS CON SU RESPECTIVO PRESUPUESTO A GASTAR */}
          {(() => {
            const progComponents = budgetComponents.filter((c) => c.programId === currentProgram.id);
            const totalComponentBudget = progComponents.reduce((acc, c) => acc + (c.budgetToSpend || 0), 0);
            const totalComponentSpent = progComponents.reduce((acc, c) => acc + (c.spentAmount || 0), 0);
            const totalComponentAvailable = Math.max(0, totalComponentBudget - totalComponentSpent);
            const compExecutionRate = totalComponentBudget > 0 ? (totalComponentSpent / totalComponentBudget) * 100 : 0;

            const getCompIcon = (name: string, category?: string) => {
              const n = name.toLowerCase();
              const c = (category || '').toLowerCase();
              if (n.includes('rrhh') || n.includes('personal') || n.includes('humano') || c.includes('rrhh')) return Users;
              if (n.includes('movil') || n.includes('traslado') || n.includes('transporte') || n.includes('vehic')) return Truck;
              if (n.includes('fármaco') || n.includes('farmaco') || n.includes('medicament') || n.includes('droga')) return Pill;
              if (n.includes('oxígeno') || n.includes('oxigeno') || n.includes('gas') || n.includes('cilindro')) return Wind;
              if (n.includes('insumo') || n.includes('material') || n.includes('clínico') || n.includes('clinico')) return Package;
              return Layers;
            };

            const commonPresets = currentProgram.id === 'praps_cpu'
              ? ['Recursos Humanos', 'Movilización', 'Insumos', 'Fármacos', 'Oxígeno']
              : currentProgram.id === 'praps_rehab'
              ? ['Recursos Humanos', 'Equipamiento y Ayudas Técnicas', 'Insumos Terapéuticos', 'Movilización']
              : currentProgram.id === 'praps_imagenes'
              ? ['Servicios Radiológicos y Mamografías', 'Recursos Humanos', 'Insumos y Mantención']
              : currentProgram.id === 'praps_mas_ama'
              ? ['Recursos Humanos', 'Material Didáctico y Estimulación', 'Movilización y Eventos']
              : currentProgram.id === 'praps_respiratoria'
              ? ['Recursos Humanos', 'Fármacos e Inhaladores', 'Oxígeno y Espirometría']
              : ['Recursos Humanos', 'Movilización', 'Insumos', 'Fármacos', 'Oxígeno'];

            const missingPresets = commonPresets.filter(
              (preset) => !progComponents.some(
                (c) => c.name.toLowerCase().trim() === preset.toLowerCase().trim() ||
                       (preset === 'Recursos Humanos' && (c.name.toLowerCase().trim() === 'rrhh' || c.name.toLowerCase().trim() === 'recursos humanos'))
              )
            );

            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Componentes Presupuestarios
                    </h3>
                  </div>
                  <button
                    onClick={() => handleOpenCreateComponent()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Agregar Componente
                  </button>
                </div>

                {/* Sugerencias Rápidas de Componentes */}
                {missingPresets.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
                      <Sparkles className="h-3 w-3 text-indigo-500" /> Sugeridos del programa:
                    </span>
                    {missingPresets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleOpenCreateComponent(preset)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-colors shadow-2xs"
                      >
                        <Plus className="h-3 w-3 text-indigo-600" />
                        <span>{preset}</span>
                      </button>
                    ))}
                  </div>
                )}

                {progComponents.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">No hay componentes presupuestarios registrados</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Agrega los componentes contemplados para este programa (ej. Recursos Humanos, Movilización, Insumos, Fármacos, Oxígeno)
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                      <button
                        onClick={() => handleOpenCreateComponent()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Agregar Componente
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                            <th className="p-3">Componente</th>
                            <th className="p-3">Categoría</th>
                            <th className="p-3 text-indigo-900">Presupuesto Componente</th>
                            <th className="p-3 text-rose-800">Presupuesto Gastado</th>
                            <th className="p-3 text-purple-800">Saldo Disponible</th>
                            <th className="p-3">% Ejecución</th>
                            <th className="p-3">Observaciones</th>
                            <th className="p-3 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {progComponents.map((comp) => {
                            const toSpend = comp.budgetToSpend || 0;
                            const spent = comp.spentAmount || 0;
                            const available = Math.max(0, toSpend - spent);
                            const pct = toSpend > 0 ? (spent / toSpend) * 100 : 0;
                            const IconComp = getCompIcon(comp.name, comp.category);

                            return (
                              <tr
                                key={comp.id}
                                onClick={() => handleOpenEditComponent(comp)}
                                className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                                title="Haz clic en cualquier fila para editar el componente"
                              >
                                <td className="p-3 font-semibold text-slate-800">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:bg-indigo-100 transition-colors shrink-0">
                                      <IconComp className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{comp.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                    {comp.category || 'Operacional'}
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-indigo-900 font-mono">
                                  ${toSpend.toLocaleString('es-CL')}
                                </td>
                                <td className="p-3 font-bold text-rose-600 font-mono">
                                  ${spent.toLocaleString('es-CL')}
                                </td>
                                <td className="p-3 font-bold text-purple-700 font-mono">
                                  ${available.toLocaleString('es-CL')}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2 w-28">
                                    <ProgressBar value={pct} size="sm" />
                                    <span className="font-bold text-slate-700">{pct.toFixed(0)}%</span>
                                  </div>
                                </td>
                                <td className="p-3 max-w-[200px]">
                                  <span className="text-[11px] text-slate-500 truncate block">
                                    {comp.notes || '—'}
                                  </span>
                                </td>
                                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditComponent(comp)}
                                      className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
                                      title="Editar componente"
                                      aria-label="Editar"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setComponentToDelete(comp)}
                                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-xs"
                                      title="Eliminar componente (Requiere OK)"
                                      aria-label="Eliminar"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-800">
                            <td className="p-3 text-slate-900 font-black" colSpan={2}>
                              Total Componentes ({progComponents.length})
                            </td>
                            <td className="p-3 text-indigo-900 font-mono font-black">
                              ${totalComponentBudget.toLocaleString('es-CL')}
                            </td>
                            <td className="p-3 text-rose-700 font-mono font-black">
                              ${totalComponentSpent.toLocaleString('es-CL')}
                            </td>
                            <td className="p-3 text-purple-800 font-mono font-black">
                              ${totalComponentAvailable.toLocaleString('es-CL')}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2 w-28">
                                <ProgressBar value={compExecutionRate} size="sm" />
                                <span className="font-bold text-slate-800">{compExecutionRate.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="p-3" colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Mobile Cards View */}
                    <div className="md:hidden space-y-3">
                      {progComponents.map((comp) => {
                        const toSpend = comp.budgetToSpend || 0;
                        const spent = comp.spentAmount || 0;
                        const available = Math.max(0, toSpend - spent);
                        const pct = toSpend > 0 ? (spent / toSpend) * 100 : 0;
                        const IconComp = getCompIcon(comp.name, comp.category);

                        return (
                          <div
                            key={comp.id}
                            onClick={() => handleOpenEditComponent(comp)}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-colors cursor-pointer space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  <IconComp className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">{comp.name}</h4>
                                  <span className="text-[10px] text-slate-500 font-medium">{comp.category || 'Operacional'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleOpenEditComponent(comp)}
                                  className="p-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-semibold inline-flex items-center gap-1 shadow-xs"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setComponentToDelete(comp)}
                                  className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 shadow-xs"
                                  title="Eliminar (Requiere OK)"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200">
                              <div>
                                <span className="text-[10px] text-slate-500 block">Presupuesto</span>
                                <span className="font-bold text-indigo-900">${toSpend.toLocaleString('es-CL')}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">Gastado</span>
                                <span className="font-bold text-rose-600">${spent.toLocaleString('es-CL')}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">Disponible</span>
                                <span className="font-bold text-purple-700">${available.toLocaleString('es-CL')}</span>
                              </div>
                            </div>

                            {comp.notes && (
                              <p className="text-[11px] text-slate-500 italic bg-white/70 p-2 rounded-lg border border-slate-100">
                                {comp.notes}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-slate-500">Ejecución: {pct.toFixed(0)}%</span>
                              <div className="w-24">
                                <ProgressBar value={pct} size="sm" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. COMPRAS Y ADQUISICIONES */}
      {activeTab === 'compras' && (() => {
        const pendientesPurchases = programPurchases.filter((p) => getPurchaseEffectiveMacroState(p) === 'pendiente');
        const enEjecucionPurchases = programPurchases.filter((p) => getPurchaseEffectiveMacroState(p) === 'en_ejecucion');
        const completadosPurchases = programPurchases.filter((p) => getPurchaseEffectiveMacroState(p) === 'completado');

        const pendientesTotal = pendientesPurchases.reduce((acc, p) => acc + ((p.totalPriceWithTax ?? p.estimatedAmount) || 0), 0);
        const enEjecucionTotal = enEjecucionPurchases.reduce((acc, p) => acc + ((p.totalPriceWithTax ?? p.estimatedAmount) || 0), 0);
        const completadosTotal = completadosPurchases.reduce((acc, p) => acc + ((p.totalPriceWithTax ?? p.estimatedAmount) || 0), 0);

        const currentFilteredPurchases =
          purchaseFilter === 'pendiente' || purchaseFilter === 'por_hacer'
            ? pendientesPurchases
            : purchaseFilter === 'en_ejecucion'
            ? enEjecucionPurchases
            : completadosPurchases;

        return (
          <div className="space-y-4">
            {/* Header with 3 Macrostate Tabs & Quick Stats */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* 3 Botones Filtro de Macroestado */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="tab-compras-pendiente"
                  onClick={() => setPurchaseFilter('pendiente')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    purchaseFilter === 'pendiente' || purchaseFilter === 'por_hacer'
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Pendiente</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      purchaseFilter === 'pendiente' || purchaseFilter === 'por_hacer'
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {pendientesPurchases.length}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-compras-en-ejecucion"
                  onClick={() => setPurchaseFilter('en_ejecucion')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    purchaseFilter === 'en_ejecucion'
                      ? 'bg-white text-amber-800 shadow-xs border border-amber-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                  <span>En ejecución</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      purchaseFilter === 'en_ejecucion'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {enEjecucionPurchases.length}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-compras-completado"
                  onClick={() => setPurchaseFilter('completado')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    purchaseFilter === 'completado' || purchaseFilter === 'realizado'
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Completado</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      purchaseFilter === 'completado' || purchaseFilter === 'realizado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {completadosPurchases.length}
                  </span>
                </button>
              </div>

              {/* Botón Nueva Compra */}
              <button
                type="button"
                id="btn-nueva-compra-tab"
                onClick={() => onOpenQuickCreate('purchase')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Nueva compra
              </button>
            </div>

            {/* Sub-header Context Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Info className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  {(purchaseFilter === 'pendiente' || purchaseFilter === 'por_hacer') && 'Compras planificadas, presupuestadas o en formulación antes de iniciar gestión.'}
                  {purchaseFilter === 'en_ejecucion' && 'Compras con gestión iniciada: OC emitida, esperando despacho o tramitación en curso.'}
                  {(purchaseFilter === 'completado' || purchaseFilter === 'realizado') && 'Compras con recepción conforme y proceso de facturación y pago completados.'}
                </span>
              </div>
              <div className="font-mono font-bold text-slate-700 text-[11px] shrink-0">
                Total estimado / ejecutado: ${
                  (purchaseFilter === 'pendiente' || purchaseFilter === 'por_hacer' ? pendientesTotal : purchaseFilter === 'en_ejecucion' ? enEjecucionTotal : completadosTotal).toLocaleString('es-CL')
                }
              </div>
            </div>

            {currentFilteredPurchases.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1.5">
                <p className="text-xs font-bold text-slate-700">
                  {(purchaseFilter === 'pendiente' || purchaseFilter === 'por_hacer') && 'No hay compras pendientes por gestionar'}
                  {purchaseFilter === 'en_ejecucion' && 'No hay compras en ejecución actualmente'}
                  {(purchaseFilter === 'completado' || purchaseFilter === 'realizado') && 'No hay compras completadas / recepcionadas aún'}
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  {(purchaseFilter === 'pendiente' || purchaseFilter === 'por_hacer') && 'Todas las compras han avanzado a ejecución o se encuentran finalizadas.'}
                  {purchaseFilter === 'en_ejecucion' && 'No hay órdenes de compra activas en gestión o en proceso con proveedores.'}
                  {(purchaseFilter === 'completado' || purchaseFilter === 'realizado') && 'Las compras recibidas conforme y con factura cerrada aparecerán en esta sección.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenQuickCreate('purchase')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Registrar Compra
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="block md:hidden space-y-3">
                  {currentFilteredPurchases.map((p) => {
                    const alerts = getPurchaseAlerts(p);
                    const effectiveMacro = getPurchaseEffectiveMacroState(p);

                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 inline-block">
                              {p.category || 'Insumos / Servicios'}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 mt-1.5">{p.itemOrService}</h4>
                          </div>
                          <PurchaseMacroBadge macroState={effectiveMacro} size="sm" />
                        </div>

                        {/* Operative Badges: Reception & Invoice (Solo en completado) */}
                        {effectiveMacro === 'completado' && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <PurchaseReceptionBadge 
                              status={p.receptionStatus || (p.status === 'recepcionado' || p.status === 'cerrado' ? 'conforme' : 'pendiente')} 
                              date={p.receptionDate} 
                              showDate 
                              size="sm" 
                            />
                            <PurchaseInvoiceBadge 
                              status={p.invoiceStatus || (p.status === 'cerrado' ? 'pagada' : 'sin_factura')} 
                              invoiceNumber={p.invoiceNumber} 
                              showNumber 
                              size="sm" 
                            />
                          </div>
                        )}

                        {/* Operational Alerts */}
                        {alerts.length > 0 && (
                          <div className="space-y-1">
                            {alerts.map((al, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                                  al.severity === 'alta'
                                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                                }`}
                              >
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                <span>{al.description}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {p.problemReason && (
                          <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-700 font-medium">
                            <span className="font-bold">Traba: </span>{p.problemReason}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Precio Total (c/IVA):</span>
                            <span className="font-bold text-slate-800 font-mono">
                              ${((p.totalPriceWithTax ?? p.estimatedAmount) || 0).toLocaleString('es-CL')}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Proveedor Elegido:</span>
                            <span className="font-medium text-slate-700">{p.supplier || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Modalidad / Unidades:</span>
                            <span className="font-medium text-slate-700">
                              {p.modalidadCompra || 'Convenio Marco'} {p.units ? `(${p.units} un.)` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">{getPurchaseDateFieldLabel(p.modalidadCompra)}:</span>
                            <span className="font-medium text-slate-700">{formatDate(p.requiredDate || p.orderAcceptedDate)}</span>
                          </div>
                          {p.ceroPapelInitiationDate && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">Iniciación CeroPapel:</span>
                              <span className="font-medium text-indigo-700">{formatDate(p.ceroPapelInitiationDate)}</span>
                            </div>
                          )}
                          {p.ceroPapelExpediente && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">Cero Papel:</span>
                              <span className="font-medium text-slate-700">{p.ceroPapelExpediente} ({p.ceroPapelEstado || 'En Trámite'})</span>
                            </div>
                          )}
                          {p.purchaseOrderNumber && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">Orden de Compra:</span>
                              <span className="font-mono font-medium text-indigo-700">{p.purchaseOrderNumber}</span>
                            </div>
                          )}
                        </div>

                        {p.referenceLink && p.referenceLink.trim().length > 0 && (
                          <div className="pt-1">
                            <a
                              href={p.referenceLink.trim().match(/^https?:\/\//i) ? p.referenceLink.trim() : `https://${p.referenceLink.trim()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium break-all"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              <span>Link de referencia producto/servicio</span>
                            </a>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onOpenEntity('purchase', p.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-semibold shadow-2xs cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" /> Editar / Gestionar
                          </button>
                          {onDeleteRequest && (
                            <button
                              type="button"
                              onClick={() => onDeleteRequest('purchase', p.id)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs shadow-2xs cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                        <th className="p-3.5">Categoría / Ítem</th>
                        <th className="p-3.5">Monto / Proveedor</th>
                        <th className="p-3.5">Modalidad / OC / Fecha</th>
                        {(purchaseFilter === 'completado' || purchaseFilter === 'realizado') && (
                          <>
                            <th className="p-3.5">Recepción Conforme</th>
                            <th className="p-3.5">Facturación</th>
                          </>
                        )}
                        <th className="p-3.5">Estado / Alertas</th>
                        <th className="p-3.5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentFilteredPurchases.map((p) => {
                        const alerts = getPurchaseAlerts(p);
                        const effectiveMacro = getPurchaseEffectiveMacroState(p);

                        return (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 text-[11px] mb-1">
                                {p.category || 'Insumos / Servicios'}
                              </span>
                              <div className="font-semibold text-slate-900">{p.itemOrService}</div>
                              {p.units && (
                                <span className="text-[11px] font-normal text-slate-500">{p.units} unidad(es)</span>
                              )}
                              {p.referenceLink && p.referenceLink.trim().length > 0 && (
                                <div className="mt-1">
                                  <a
                                    href={p.referenceLink.trim().match(/^https?:\/\//i) ? p.referenceLink.trim() : `https://${p.referenceLink.trim()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" /> Ver link ref.
                                  </a>
                                </div>
                              )}
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-800 font-mono text-xs">
                                ${((p.totalPriceWithTax ?? p.estimatedAmount) || 0).toLocaleString('es-CL')}
                              </div>
                              <div className="text-slate-600 text-[11px] mt-0.5">
                                {p.supplier || '—'}
                              </div>
                            </td>
                            <td className="p-3.5 text-slate-600">
                              <div className="font-medium text-slate-800">{p.modalidadCompra || 'Convenio marco'}</div>
                              {p.purchaseOrderNumber && (
                                <div className="text-[11px] font-mono text-indigo-600 font-semibold">{p.purchaseOrderNumber}</div>
                              )}
                              {(p.requiredDate || p.orderAcceptedDate) && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  <span className="text-slate-400 font-normal">{getPurchaseDateFieldLabel(p.modalidadCompra)}:</span>{' '}
                                  <span className="font-semibold text-slate-700">{formatDate(p.requiredDate || p.orderAcceptedDate)}</span>
                                </div>
                              )}
                              {p.ceroPapelInitiationDate && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  <span className="text-slate-400 font-normal">Inic. CeroPapel:</span>{' '}
                                  <span className="font-semibold text-indigo-700">{formatDate(p.ceroPapelInitiationDate)}</span>
                                </div>
                              )}
                            </td>
                            {(purchaseFilter === 'completado' || purchaseFilter === 'realizado') && (
                              <>
                                <td className="p-3.5">
                                  <PurchaseReceptionBadge 
                                    status={p.receptionStatus || (p.status === 'recepcionado' || p.status === 'cerrado' ? 'conforme' : 'pendiente')} 
                                    date={p.receptionDate} 
                                    showDate 
                                    size="sm" 
                                  />
                                  {p.receptionResponsible && (
                                    <div className="text-[10px] text-slate-500 mt-1">
                                      Por: <span className="font-medium text-slate-700">{p.receptionResponsible}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3.5">
                                  <PurchaseInvoiceBadge 
                                    status={p.invoiceStatus || (p.status === 'cerrado' ? 'pagada' : 'sin_factura')} 
                                    invoiceNumber={p.invoiceNumber} 
                                    showNumber 
                                    size="sm" 
                                  />
                                  {p.invoicePaymentDate && (
                                    <div className="text-[10px] text-emerald-700 font-medium mt-1">
                                      Pagada: {formatDate(p.invoicePaymentDate)}
                                    </div>
                                  )}
                                </td>
                              </>
                            )}
                            <td className="p-3.5">
                              <div className="space-y-1">
                                <PurchaseMacroBadge macroState={effectiveMacro} size="sm" />
                                {alerts.length > 0 && (
                                  <div className="space-y-0.5">
                                    {alerts.map((al, idx) => (
                                      <div
                                        key={idx}
                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                          al.severity === 'alta'
                                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                                            : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}
                                        title={al.description}
                                      >
                                        <AlertTriangle className="h-3 w-3 shrink-0" />
                                        <span>{al.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {p.problemReason && (
                                  <p className="text-[10px] text-rose-600 font-normal">
                                    Traba: {p.problemReason}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onOpenEntity('purchase', p.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs cursor-pointer"
                                  title="Editar / Gestionar"
                                  aria-label="Editar"
                                >
                                  <FileText className="h-4 w-4" />
                                </button>
                                {onDeleteRequest && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteRequest('purchase', p.id)}
                                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs cursor-pointer"
                                    title="Eliminar compra"
                                    aria-label="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* 5. TAREAS Y COMPROMISOS */}
      {activeTab === 'tareas' && (() => {
        const todayStr = '2026-08-15';

        // Categorization helper: maps each task to one of the 5 canonical cards
        const getTaskCurrentCategory = (
          t: typeof programTasks[0],
          currentDate: string = todayStr
        ): TaskOperationalCategory => {
          if (isTaskCompleted(t.status)) {
            return 'completado';
          }
          if (t.dueDate) {
            if (t.dueDate < currentDate) {
              return 'vencido';
            }
            if (t.dueDate === currentDate) {
              return 'vence_hoy';
            }
          }
          const normalized = normalizeTaskStatus(t.status);
          if (normalized === 'en_ejecucion') {
            return 'en_ejecucion';
          }
          return 'pendiente';
        };

        // Handler to move a task to any of the 5 target categories in real-time
        const handleApplyTaskCategory = (
          taskId: string,
          targetCategory: TaskOperationalCategory
        ) => {
          const task = programTasks.find((tk) => tk.id === taskId);
          if (!task) return;

          if (targetCategory === 'completado') {
            quickUpdateTaskStatus(taskId, 'terminada');
          } else if (targetCategory === 'vencido') {
            updateTask(taskId, {
              status: 'por_hacer',
              dueDate: '2026-08-12', // 3 days overdue relative to 2026-08-15
            }, true);
          } else if (targetCategory === 'vence_hoy') {
            updateTask(taskId, {
              status: 'por_hacer',
              dueDate: todayStr,
            }, true);
          } else if (targetCategory === 'en_ejecucion') {
            const isPastOrToday = task.dueDate && task.dueDate <= todayStr;
            updateTask(taskId, {
              status: 'en_ejecucion',
              ...(isPastOrToday ? { dueDate: '2026-08-25' } : {}),
            }, true);
          } else if (targetCategory === 'pendiente') {
            const isPastOrToday = task.dueDate && task.dueDate <= todayStr;
            updateTask(taskId, {
              status: 'por_hacer',
              ...(isPastOrToday ? { dueDate: '2026-08-25' } : {}),
            }, true);
          }
        };

        // Filter logic matching 5 operational categories (Pendiente, En gestión, Cerrado, Vence hoy, Vencido)
        const filteredTasks = programTasks.filter((t) => {
          const currentCat = getTaskCurrentCategory(t, todayStr);

          if (taskFilter !== 'todos' && currentCat !== taskFilter) {
            return false;
          }

          if (taskSearchQuery.trim()) {
            const query = taskSearchQuery.toLowerCase();
            const matchTitle = (t.title || '').toLowerCase().includes(query);
            const matchResponsible = (t.responsible || '').toLowerCase().includes(query);
            const matchCategory = (t.category || '').toLowerCase().includes(query);
            const matchNotes = (t.description || t.notes || '').toLowerCase().includes(query);
            if (!matchTitle && !matchResponsible && !matchCategory && !matchNotes) {
              return false;
            }
          }

          return true;
        });

        // Compute counts for all 5 categories
        const pendingCount = programTasks.filter((t) => getTaskCurrentCategory(t, todayStr) === 'pendiente').length;
        const inProgressCount = programTasks.filter((t) => getTaskCurrentCategory(t, todayStr) === 'en_ejecucion').length;
        const completedCount = programTasks.filter((t) => getTaskCurrentCategory(t, todayStr) === 'completado').length;
        const dueTodayCount = programTasks.filter((t) => getTaskCurrentCategory(t, todayStr) === 'vence_hoy').length;
        const overdueCount = programTasks.filter((t) => getTaskCurrentCategory(t, todayStr) === 'vencido').length;

        return (
          <div className="space-y-4">
            {/* Top Bar with 5 Segmented Tabs & Action (Image 1 Style) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              {/* Segmented Filter Pills (5 categories) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-fit flex-wrap">
                <button
                  type="button"
                  id="tab-tareas-pendiente"
                  onClick={() => setTaskFilter(taskFilter === 'pendiente' ? 'todos' : 'pendiente')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverTaskCard !== 'pendiente') setDragOverTaskCard('pendiente');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverTaskCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverTaskCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedTaskId;
                    if (id) handleApplyTaskCategory(id, 'pendiente');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverTaskCard === 'pendiente'
                      ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                      : taskFilter === 'pendiente'
                      ? 'bg-white text-amber-900 shadow-xs border border-amber-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Pendiente</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      taskFilter === 'pendiente'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {pendingCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-tareas-en-ejecucion"
                  onClick={() => setTaskFilter(taskFilter === 'en_ejecucion' ? 'todos' : 'en_ejecucion')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverTaskCard !== 'en_ejecucion') setDragOverTaskCard('en_ejecucion');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverTaskCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverTaskCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedTaskId;
                    if (id) handleApplyTaskCategory(id, 'en_ejecucion');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverTaskCard === 'en_ejecucion'
                      ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-400'
                      : taskFilter === 'en_ejecucion'
                      ? 'bg-white text-blue-800 shadow-xs border border-blue-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  <span>En gestión</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      taskFilter === 'en_ejecucion'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {inProgressCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-tareas-completado"
                  onClick={() => setTaskFilter(taskFilter === 'completado' ? 'todos' : 'completado')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverTaskCard !== 'completado') setDragOverTaskCard('completado');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverTaskCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverTaskCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedTaskId;
                    if (id) handleApplyTaskCategory(id, 'completado');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverTaskCard === 'completado'
                      ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-400'
                      : taskFilter === 'completado'
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Cerrados</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      taskFilter === 'completado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {completedCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-tareas-vence-hoy"
                  onClick={() => setTaskFilter(taskFilter === 'vence_hoy' ? 'todos' : 'vence_hoy')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverTaskCard !== 'vence_hoy') setDragOverTaskCard('vence_hoy');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverTaskCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverTaskCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedTaskId;
                    if (id) handleApplyTaskCategory(id, 'vence_hoy');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverTaskCard === 'vence_hoy'
                      ? 'bg-orange-100 text-orange-900 ring-2 ring-orange-400'
                      : taskFilter === 'vence_hoy'
                      ? 'bg-white text-orange-800 shadow-xs border border-orange-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                  <span>Vence hoy</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      taskFilter === 'vence_hoy'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {dueTodayCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-tareas-vencidos"
                  onClick={() => setTaskFilter(taskFilter === 'vencido' ? 'todos' : 'vencido')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverTaskCard !== 'vencido') setDragOverTaskCard('vencido');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverTaskCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverTaskCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedTaskId;
                    if (id) handleApplyTaskCategory(id, 'vencido');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverTaskCard === 'vencido'
                      ? 'bg-rose-100 text-rose-900 ring-2 ring-rose-400'
                      : taskFilter === 'vencido'
                      ? 'bg-white text-rose-800 shadow-xs border border-rose-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span>Vencidos</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      taskFilter === 'vencido'
                        ? 'bg-rose-100 text-rose-800'
                        : overdueCount > 0
                        ? 'bg-rose-100 text-rose-700 font-extrabold'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {overdueCount}
                  </span>
                </button>
              </div>

              {/* Search Bar & Action Button */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    placeholder="Buscar tarea o responsable..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  {taskSearchQuery && (
                    <button
                      onClick={() => setTaskSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  id="btn-nueva-tarea-tab"
                  onClick={() => onOpenQuickCreate('task')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Nueva tarea
                </button>
              </div>
            </div>

            {/* List of Tasks */}
            {filteredTasks.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                <CheckSquare className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">
                  No hay tareas en esta vista
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {taskSearchQuery
                    ? 'No se encontraron resultados para los filtros y término de búsqueda ingresados.'
                    : 'Registra tareas operativas para mantener el control y seguimiento de compromisos.'}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenQuickCreate('task')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Registrar Nueva Tarea
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map((t) => {
                  const isDone = isTaskCompleted(t.status);
                  const isOverdue = isTaskOverdue(t);
                  const currentCategory = getTaskCurrentCategory(t, todayStr);

                  return (
                    <div
                      key={t.id}
                      draggable={true}
                      onDragStart={(ev) => {
                        ev.dataTransfer.setData('text/plain', t.id);
                        ev.dataTransfer.effectAllowed = 'move';
                        setDraggedTaskId(t.id);
                      }}
                      onDragEnd={() => {
                        setDraggedTaskId(null);
                        setDragOverTaskCard(null);
                      }}
                      className={`group p-4 rounded-2xl border transition-all shadow-xs space-y-3 ${
                        draggedTaskId === t.id
                          ? 'opacity-40 border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-200'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {/* Top Row: Drag Handle + Checkbox + Title & Category + Urgency + Status Chip + Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1 flex items-start gap-2">
                          <div 
                            className="mt-0.5 p-1 rounded-md text-slate-300 group-hover:text-slate-500 hover:bg-slate-100 cursor-grab active:cursor-grabbing transition-colors shrink-0" 
                            title="Arrastra esta tarea a una de las tarjetas superiores para moverla de categoría"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (isDone) {
                                reopenTask(t.id);
                              } else {
                                completeTask(t.id);
                              }
                            }}
                            className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600'
                            }`}
                            title={isDone ? 'Reabrir tarea' : 'Marcar como completada'}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                onClick={() => onOpenEntity('task', t.id)}
                                className={`text-sm font-bold hover:text-indigo-600 cursor-pointer transition-colors leading-snug ${
                                  isDone ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {t.title}
                              </h4>
                              {t.category && (
                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                  {t.category}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                              <span>Resp: <strong className="text-slate-700">{t.responsible || 'Sin asignar'}</strong></span>
                              <span>•</span>
                              <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                                Plazo: {formatDate(t.dueDate)}
                              </span>
                              {t.origin && (
                                <>
                                  <span>•</span>
                                  <span>Origen: {t.origin}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side controls: Urgency selector, 5-option Status Chip, View, Delete */}
                        <div className="flex items-center gap-1.5 shrink-0 self-start">
                          <TaskUrgencyChip 
                            isUrgent={t.isUrgent || t.priority === 'critica'} 
                            onChange={(urgent) => {
                              updateTask(t.id, { isUrgent: urgent, priority: urgent ? 'critica' : 'media' }, true);
                            }} 
                          />

                          <TaskStatusChip 
                            status={t.status}
                            dueDate={t.dueDate}
                            category={currentCategory}
                            onChange={(newCat) => handleApplyTaskCategory(t.id, newCat)} 
                          />

                          <button
                            type="button"
                            onClick={() => onOpenEntity('task', t.id)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs cursor-pointer"
                            title="Editar / Ver detalle"
                            aria-label="Editar"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          {onDeleteRequest && (
                            <button
                              type="button"
                              onClick={() => onDeleteRequest('task', t.id)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs cursor-pointer"
                              title="Eliminar tarea"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Description / Subtasks if available */}
                      {t.description && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                          {t.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 6. REUNIONES Y ACUERDOS */}
      {activeTab === 'reuniones' && (() => {
        const todayStr = '2026-08-15';

        const normalizeMeetingStatus = (st?: string): 'pendiente' | 'en_ejecucion' | 'completado' => {
          if (st === 'completado' || st === 'finalizada' || st === 'cumplido' || st === 'terminada') return 'completado';
          if (st === 'en_ejecucion' || st === 'en_curso' || st === 'en_progreso') return 'en_ejecucion';
          return 'pendiente';
        };

        // Categorization helper: maps each meeting to one of the 5 canonical cards
        const getMeetingCurrentCategory = (
          m: typeof programMeetings[0],
          currentDate: string = todayStr
        ): MeetingOperationalCategory => {
          const norm = normalizeMeetingStatus(m.status);
          if (norm === 'completado') {
            return 'completado';
          }
          if (m.dateTime) {
            const datePart = m.dateTime.split('T')[0];
            if (datePart < currentDate) {
              return 'vencido';
            }
            if (datePart === currentDate) {
              return 'vence_hoy';
            }
          }
          if (norm === 'en_ejecucion') {
            return 'en_ejecucion';
          }
          return 'pendiente';
        };

        // Handler to move a meeting to any of the 5 target categories in real-time
        const handleApplyMeetingCategory = (
          meetingId: string,
          targetCategory: MeetingOperationalCategory
        ) => {
          const m = programMeetings.find((mt) => mt.id === meetingId);
          if (!m) return;

          if (targetCategory === 'completado') {
            updateMeeting(meetingId, { status: 'finalizada' });
          } else if (targetCategory === 'vencido') {
            updateMeeting(meetingId, {
              status: 'programada',
              dateTime: '2026-08-12T10:00:00', // 3 days overdue relative to 2026-08-15
            });
          } else if (targetCategory === 'vence_hoy') {
            updateMeeting(meetingId, {
              status: 'programada',
              dateTime: `${todayStr}T10:00:00`,
            });
          } else if (targetCategory === 'en_ejecucion') {
            const datePart = m.dateTime ? m.dateTime.split('T')[0] : '';
            const isPastOrToday = datePart && datePart <= todayStr;
            updateMeeting(meetingId, {
              status: 'en_curso',
              ...(isPastOrToday ? { dateTime: '2026-08-25T10:00:00' } : {}),
            });
          } else if (targetCategory === 'pendiente') {
            const datePart = m.dateTime ? m.dateTime.split('T')[0] : '';
            const isPastOrToday = datePart && datePart <= todayStr;
            updateMeeting(meetingId, {
              status: 'programada',
              ...(isPastOrToday ? { dateTime: '2026-08-25T10:00:00' } : {}),
            });
          }
        };

        // Filter logic matching 5 operational categories (Pendiente, En gestión, Cerrado, Vence hoy, Vencido)
        const filteredMeetings = programMeetings.filter((m) => {
          const currentCat = getMeetingCurrentCategory(m, todayStr);

          if (meetingCommitmentFilter !== 'todos' && currentCat !== meetingCommitmentFilter) {
            return false;
          }

          if (meetingSearchQuery.trim()) {
            const query = meetingSearchQuery.toLowerCase();
            const matchTitle = (m.title || '').toLowerCase().includes(query);
            const matchObjective = (m.objective || '').toLowerCase().includes(query);
            const matchLocation = (m.location || '').toLowerCase().includes(query);
            const matchParticipants = (m.participants || []).some((p) => p.toLowerCase().includes(query));
            const matchCommitments = (m.commitments || []).some((c) => (c.description || '').toLowerCase().includes(query));
            if (!matchTitle && !matchObjective && !matchLocation && !matchParticipants && !matchCommitments) {
              return false;
            }
          }

          return true;
        });

        // Compute counts for all 5 categories
        const pendingCount = programMeetings.filter((m) => getMeetingCurrentCategory(m, todayStr) === 'pendiente').length;
        const inProgressCount = programMeetings.filter((m) => getMeetingCurrentCategory(m, todayStr) === 'en_ejecucion').length;
        const completedCount = programMeetings.filter((m) => getMeetingCurrentCategory(m, todayStr) === 'completado').length;
        const dueTodayCount = programMeetings.filter((m) => getMeetingCurrentCategory(m, todayStr) === 'vence_hoy').length;
        const overdueCount = programMeetings.filter((m) => getMeetingCurrentCategory(m, todayStr) === 'vencido').length;

        return (
          <div className="space-y-4">
            {/* Top Bar with 5 Segmented Tabs & Action (Image 1 Style) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              {/* Segmented Filter Pills (5 categories) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-fit flex-wrap">
                <button
                  type="button"
                  id="tab-reuniones-pendiente"
                  onClick={() => setMeetingCommitmentFilter(meetingCommitmentFilter === 'pendiente' ? 'todos' : 'pendiente')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverMeetingCard !== 'pendiente') setDragOverMeetingCard('pendiente');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverMeetingCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverMeetingCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedMeetingId;
                    if (id) handleApplyMeetingCategory(id, 'pendiente');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverMeetingCard === 'pendiente'
                      ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                      : meetingCommitmentFilter === 'pendiente'
                      ? 'bg-white text-amber-900 shadow-xs border border-amber-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Pendiente</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      meetingCommitmentFilter === 'pendiente'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {pendingCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-reuniones-en-ejecucion"
                  onClick={() => setMeetingCommitmentFilter(meetingCommitmentFilter === 'en_ejecucion' ? 'todos' : 'en_ejecucion')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverMeetingCard !== 'en_ejecucion') setDragOverMeetingCard('en_ejecucion');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverMeetingCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverMeetingCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedMeetingId;
                    if (id) handleApplyMeetingCategory(id, 'en_ejecucion');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverMeetingCard === 'en_ejecucion'
                      ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-400'
                      : meetingCommitmentFilter === 'en_ejecucion'
                      ? 'bg-white text-blue-800 shadow-xs border border-blue-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  <span>En gestión</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      meetingCommitmentFilter === 'en_ejecucion'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {inProgressCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-reuniones-completado"
                  onClick={() => setMeetingCommitmentFilter(meetingCommitmentFilter === 'completado' ? 'todos' : 'completado')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverMeetingCard !== 'completado') setDragOverMeetingCard('completado');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverMeetingCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverMeetingCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedMeetingId;
                    if (id) handleApplyMeetingCategory(id, 'completado');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverMeetingCard === 'completado'
                      ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-400'
                      : meetingCommitmentFilter === 'completado'
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Cerrados</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      meetingCommitmentFilter === 'completado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {completedCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-reuniones-vence-hoy"
                  onClick={() => setMeetingCommitmentFilter(meetingCommitmentFilter === 'vence_hoy' ? 'todos' : 'vence_hoy')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverMeetingCard !== 'vence_hoy') setDragOverMeetingCard('vence_hoy');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverMeetingCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverMeetingCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedMeetingId;
                    if (id) handleApplyMeetingCategory(id, 'vence_hoy');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverMeetingCard === 'vence_hoy'
                      ? 'bg-orange-100 text-orange-900 ring-2 ring-orange-400'
                      : meetingCommitmentFilter === 'vence_hoy'
                      ? 'bg-white text-orange-800 shadow-xs border border-orange-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                  <span>Vence hoy</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      meetingCommitmentFilter === 'vence_hoy'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {dueTodayCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-reuniones-vencidos"
                  onClick={() => setMeetingCommitmentFilter(meetingCommitmentFilter === 'vencido' ? 'todos' : 'vencido')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverMeetingCard !== 'vencido') setDragOverMeetingCard('vencido');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverMeetingCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverMeetingCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedMeetingId;
                    if (id) handleApplyMeetingCategory(id, 'vencido');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverMeetingCard === 'vencido'
                      ? 'bg-rose-100 text-rose-900 ring-2 ring-rose-400'
                      : meetingCommitmentFilter === 'vencido'
                      ? 'bg-white text-rose-800 shadow-xs border border-rose-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span>Vencidos</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      meetingCommitmentFilter === 'vencido'
                        ? 'bg-rose-100 text-rose-800'
                        : overdueCount > 0
                        ? 'bg-rose-100 text-rose-700 font-extrabold'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {overdueCount}
                  </span>
                </button>
              </div>

              {/* Search Bar & Action Button */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={meetingSearchQuery}
                    onChange={(e) => setMeetingSearchQuery(e.target.value)}
                    placeholder="Buscar reunión, tema o acuerdo..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  {meetingSearchQuery && (
                    <button
                      onClick={() => setMeetingSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  id="btn-nueva-reunion-tab"
                  onClick={() => onOpenQuickCreate('meeting')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Nueva reunión
                </button>
              </div>
            </div>

            {/* List of Meetings */}
            {filteredMeetings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">
                  No hay reuniones en esta vista
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {meetingSearchQuery
                    ? 'No se encontraron resultados para los filtros y término de búsqueda ingresados.'
                    : 'No hay reuniones registradas con este criterio.'}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenQuickCreate('meeting')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Registrar reunión
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMeetings.map((m) => {
                  const agreementsList = Array.isArray(m.agreements)
                    ? m.agreements
                    : m.agreements
                    ? [{ id: 'agr_1', meetingId: m.id, description: m.agreements }]
                    : [];
                  const commitmentsList = m.commitments || [];
                  const overdueComs = commitmentsList.filter((c) => isCommitmentOverdue(c)).length;
                  const currentCategory = getMeetingCurrentCategory(m, todayStr);

                  return (
                    <div 
                      key={m.id} 
                      draggable={true}
                      onDragStart={(ev) => {
                        ev.dataTransfer.setData('text/plain', m.id);
                        ev.dataTransfer.effectAllowed = 'move';
                        setDraggedMeetingId(m.id);
                      }}
                      onDragEnd={() => {
                        setDraggedMeetingId(null);
                        setDragOverMeetingCard(null);
                      }}
                      className={`group p-5 rounded-2xl border bg-white space-y-3.5 shadow-xs transition-all ${
                        draggedMeetingId === m.id
                          ? 'opacity-40 border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-200'
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex items-start gap-2 min-w-0 flex-1">
                          <div 
                            className="mt-0.5 p-1 rounded-md text-slate-300 group-hover:text-slate-500 hover:bg-slate-100 cursor-grab active:cursor-grabbing transition-colors shrink-0" 
                            title="Arrastra esta reunión a una de las tarjetas superiores para moverla de categoría"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <MeetingStatusChip
                                status={m.status}
                                dateTime={m.dateTime}
                                category={currentCategory}
                                onChange={(newCat) => handleApplyMeetingCategory(m.id, newCat)}
                              />
                              {overdueComs > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  {overdueComs} compromiso{overdueComs > 1 ? 's' : ''} vencido{overdueComs > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>

                            <h4 
                              onClick={() => onOpenEntity('meeting', m.id)}
                              className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                            >
                              {m.title}
                            </h4>
                            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {formatDateTime(m.dateTime)}
                              </span>
                              {m.location && (
                                <>
                                  <span>•</span>
                                  <span>{m.location}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{(m.participants || []).length} participantes</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onOpenEntity('meeting', m.id)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                            title="Ver minuta, acuerdos y compromisos"
                            aria-label="Editar"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {onDeleteRequest && (
                            <button
                              onClick={() => onDeleteRequest('meeting', m.id)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                              title="Eliminar reunión"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {m.objective && (
                        <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-0.5 border border-slate-100">
                          <span className="font-bold text-slate-700">Objetivo de la sesión:</span>
                          <p className="text-slate-600 leading-relaxed">{m.objective}</p>
                        </div>
                      )}

                      {/* Acuerdos tomados */}
                      {agreementsList.length > 0 && (
                        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1.5">
                          <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wide flex items-center gap-1">
                            Acuerdos Tomados ({agreementsList.length})
                          </span>
                          <ul className="space-y-1">
                            {agreementsList.map((agr, idx) => (
                              <li key={agr.id || idx} className="text-xs text-slate-700 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                <span>{agr.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Compromisos with direct convert button & status toggle */}
                      {commitmentsList.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                            <span>Compromisos Asignados ({commitmentsList.length})</span>
                            <span className="text-2xs font-normal text-slate-500 lowercase">
                              {commitmentsList.filter((c) => c.status === 'cumplido' || c.status === 'completado').length} de {commitmentsList.length} cumplidos
                            </span>
                          </span>
                          <div className="space-y-1.5">
                            {commitmentsList.map((c) => {
                              const isOverdue = isCommitmentOverdue(c);
                              const isDone = c.status === 'cumplido' || c.status === 'completado';

                              return (
                                <div 
                                  key={c.id} 
                                  className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all ${
                                    isDone ? 'bg-slate-50 border-slate-200 opacity-85' : 'bg-white border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <button
                                      onClick={() => toggleMeetingCommitmentStatus(m.id, c.id)}
                                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                        isDone
                                          ? 'bg-emerald-600 border-emerald-600 text-white'
                                          : 'bg-white border-slate-300 hover:border-indigo-500'
                                      }`}
                                      title="Marcar como cumplido / pendiente"
                                    >
                                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                                    </button>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                          {c.description}
                                        </span>
                                        {c.isUrgent && (
                                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                            Urgente
                                          </span>
                                        )}
                                        {isOverdue && <OverdueBadge />}
                                      </div>
                                      <p className="text-[11px] text-slate-500">
                                        Resp: <strong className="text-slate-700">{c.responsible}</strong> • Plazo:{' '}
                                        <strong className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                                          {formatDate(c.deadline)}
                                        </strong>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                    <CommitmentStatusChip
                                      status={c.status}
                                      onChange={(newSt) => toggleMeetingCommitmentStatus(m.id, c.id, newSt)}
                                    />
                                    {c.taskId ? (
                                      <span 
                                        onClick={() => onOpenEntity('task', c.taskId!)}
                                        className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-emerald-100"
                                        title="Ver tarea sincronizada"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Tarea sincronizada
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => convertCommitmentToTask(m.id, c.id)}
                                        className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[11px] font-bold border border-indigo-200 transition-all active:scale-95"
                                        title="Convertir a tarea operativa"
                                      >
                                        + Crear tarea
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCommitmentToDelete({
                                          meetingId: m.id,
                                          commitmentId: c.id,
                                          description: c.description,
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 7. CORREOS Y REQUERIMIENTOS OPERATIVOS */}
      {activeTab === 'correos' && (() => {
        const todayStr = '2026-08-15';

        // Categorization helper: maps each email to one of the 5 canonical cards
        const getEmailCurrentCategory = (
          e: PendingEmail,
          currentDate: string = todayStr
        ): CommunicationOperationalCategory => {
          const canonical = normalizeCommunicationStatus(e.status);
          if (canonical === 'cerrado' || canonical === 'respondido') {
            return 'cerrado';
          }
          if (isEmailOverdue(e, currentDate)) {
            return 'vencido';
          }
          if (e.deadline === currentDate) {
            return 'vence_hoy';
          }
          if (canonical === 'en_gestion') {
            return 'en_gestion';
          }
          return 'pendiente';
        };

        // Handler to move an email to any of the 5 target categories in real-time
        const handleApplyEmailCategory = (
          emailId: string,
          targetCategory: CommunicationOperationalCategory
        ) => {
          const email = programEmails.find((em) => em.id === emailId);
          if (!email) return;

          if (targetCategory === 'cerrado') {
            updateEmail(emailId, { status: 'cerrado' });
          } else if (targetCategory === 'vencido') {
            const canonical = normalizeCommunicationStatus(email.status);
            const newStatus = canonical === 'cerrado' || canonical === 'respondido' ? 'en_gestion' : email.status;
            updateEmail(emailId, {
              status: newStatus,
              deadline: '2026-08-12', // 3 days overdue relative to 2026-08-15
            });
          } else if (targetCategory === 'vence_hoy') {
            const canonical = normalizeCommunicationStatus(email.status);
            const newStatus = canonical === 'cerrado' || canonical === 'respondido' ? 'en_gestion' : email.status;
            updateEmail(emailId, {
              status: newStatus,
              deadline: todayStr,
            });
          } else if (targetCategory === 'en_gestion') {
            const isPastOrToday = email.deadline && (email.deadline <= todayStr);
            updateEmail(emailId, {
              status: 'en_gestion',
              ...(isPastOrToday ? { deadline: '2026-08-25' } : {}),
            });
          } else if (targetCategory === 'pendiente') {
            const isPastOrToday = email.deadline && (email.deadline <= todayStr);
            updateEmail(emailId, {
              status: 'pendiente',
              ...(isPastOrToday ? { deadline: '2026-08-25' } : {}),
            });
          }
        };
        
        // Filter logic matching 3 canonical tabs (Pendiente, En gestión, Cerrado)
        const isEmailClosed = (e: any) => e.status === 'cerrado' || e.status === 'respondido';
        const isEmailInProcess = (e: any) => e.status === 'en_gestion' || e.status === 'en_curso' || e.status === 'en_ejecucion';

        const filteredEmails = programEmails.filter((e) => {
          const isClosed = isEmailClosed(e);
          const isInProg = isEmailInProcess(e);

          if (emailStatusFilter === 'pendiente' && (isClosed || isInProg)) {
            return false;
          }
          if (emailStatusFilter === 'en_gestion' && (isClosed || !isInProg)) {
            return false;
          }
          if (emailStatusFilter === 'cerrado' && !isClosed) {
            return false;
          }

          if (emailTypeFilter !== 'todos' && (e.type || 'correo_recibido') !== emailTypeFilter) {
            return false;
          }

          if (emailSearchQuery.trim()) {
            const query = emailSearchQuery.toLowerCase();
            const matchSubject = (e.subject || '').toLowerCase().includes(query);
            const matchSender = (e.sender || '').toLowerCase().includes(query);
            const matchRecipient = (e.recipient || '').toLowerCase().includes(query);
            const matchResponsible = (e.responsible || '').toLowerCase().includes(query);
            const matchAction = (e.requiredAction || e.notes || '').toLowerCase().includes(query);
            if (!matchSubject && !matchSender && !matchRecipient && !matchResponsible && !matchAction) {
              return false;
            }
          }

          return true;
        });

        // Compute counts for the 3 tabs
        const pendingCount = programEmails.filter((e) => !isEmailClosed(e) && !isEmailInProcess(e)).length;
        const inProgressCount = programEmails.filter((e) => !isEmailClosed(e) && isEmailInProcess(e)).length;
        const resolvedCount = programEmails.filter((e) => isEmailClosed(e)).length;

        return (
          <div className="space-y-4">
            {/* Top Bar with 3 Segmented Tabs & Action (Image 1 Style) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              {/* Segmented Filter Pills (Image 1 Format) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-fit flex-wrap">
                <button
                  type="button"
                  id="tab-correos-pendiente"
                  onClick={() => setEmailStatusFilter('pendiente')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverCard !== 'pendiente') setDragOverCard('pendiente');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedEmailId;
                    if (id) handleApplyEmailCategory(id, 'pendiente');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverCard === 'pendiente'
                      ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                      : emailStatusFilter === 'pendiente' || emailStatusFilter === 'todos'
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Pendiente</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      emailStatusFilter === 'pendiente' || emailStatusFilter === 'todos'
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {pendingCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-correos-en-gestion"
                  onClick={() => setEmailStatusFilter('en_gestion')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverCard !== 'en_gestion') setDragOverCard('en_gestion');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedEmailId;
                    if (id) handleApplyEmailCategory(id, 'en_gestion');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverCard === 'en_gestion'
                      ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-400'
                      : emailStatusFilter === 'en_gestion'
                      ? 'bg-white text-blue-800 shadow-xs border border-blue-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                  <span>En gestión</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      emailStatusFilter === 'en_gestion'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {inProgressCount}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-correos-cerrado"
                  onClick={() => setEmailStatusFilter('cerrado')}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';
                    if (dragOverCard !== 'cerrado') setDragOverCard('cerrado');
                  }}
                  onDragLeave={(ev) => {
                    if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
                    setDragOverCard(null);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    setDragOverCard(null);
                    const id = ev.dataTransfer.getData('text/plain') || draggedEmailId;
                    if (id) handleApplyEmailCategory(id, 'cerrado');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dragOverCard === 'cerrado'
                      ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-400'
                      : emailStatusFilter === 'cerrado'
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Cerrado</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      emailStatusFilter === 'cerrado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {resolvedCount}
                  </span>
                </button>
              </div>

              {/* Search Bar & Action Button */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={emailSearchQuery}
                    onChange={(e) => setEmailSearchQuery(e.target.value)}
                    placeholder="Buscar requerimiento..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  {emailSearchQuery && (
                    <button
                      onClick={() => setEmailSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  id="btn-nuevo-requerimiento-tab"
                  onClick={() => onOpenQuickCreate('email')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Nuevo requerimiento
                </button>
              </div>
            </div>

            {/* Communications List */}
            {filteredEmails.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                <Mail className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">
                  No hay requerimientos en esta vista
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {emailSearchQuery
                    ? 'No se encontraron resultados para los filtros y término de búsqueda ingresados.'
                    : 'Registra correos, oficios y solicitudes para mantener la trazabilidad administrativa.'}
                </p>
                <button
                  onClick={() => onOpenQuickCreate('email')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Registrar Requerimiento
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredEmails.map((e) => {
                  const linkedTask = e.taskId ? tasks.find((t) => t.id === e.taskId && !t.archived) : undefined;
                  const followUpsCount = (e.followUps || []).length;
                  const attachmentsCount = (e.attachments || []).length;
                  const isEmailUrgent = e.isUrgent ?? (e.priority === 'critica' || e.priority === 'alta');

                  return (
                    <div
                      key={e.id}
                      draggable={true}
                      onDragStart={(ev) => {
                        ev.dataTransfer.setData('text/plain', e.id);
                        ev.dataTransfer.effectAllowed = 'move';
                        setDraggedEmailId(e.id);
                      }}
                      onDragEnd={() => {
                        setDraggedEmailId(null);
                        setDragOverCard(null);
                      }}
                      className={`group p-4 rounded-2xl border transition-all shadow-xs space-y-3 ${
                        draggedEmailId === e.id
                          ? 'opacity-40 border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-200'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {/* Top Row: Drag Handle + Type Badge + Title, Urgency Selector + Status Chip + Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1 flex items-start gap-2">
                          <div 
                            className="mt-0.5 p-1 rounded-md text-slate-300 group-hover:text-slate-500 hover:bg-slate-100 cursor-grab active:cursor-grabbing transition-colors shrink-0" 
                            title="Arrastra este correo a una de las tarjetas superiores para moverlo de categoría"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CommunicationTypeBadge type={e.type} />
                              <h4
                                onClick={() => onOpenEntity('email', e.id)}
                                className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors leading-snug"
                              >
                                {e.subject}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                              <span>Resp: {e.responsible || 'Sin responsable'}</span>
                              <span>•</span>
                              <CommunicationDeadlineNotice deadline={e.deadline} status={e.status} />
                              {e.sender && (
                                <>
                                  <span>•</span>
                                  <span>De: {e.sender}</span>
                                </>
                              )}
                              {e.recipient && (
                                <>
                                  <span>•</span>
                                  <span>Para: {e.recipient}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side controls: Urgency selector (dropdown like tasks), Status chip with 5 options, View, Delete */}
                        <div className="flex items-center gap-1.5 shrink-0 self-start">
                          <TaskUrgencyChip
                            isUrgent={isEmailUrgent}
                            onChange={(urgent) => {
                              updateEmail(e.id, { isUrgent: urgent, priority: urgent ? 'critica' : 'media' }, true);
                            }}
                          />

                          <CommunicationStatusChip
                            status={e.status}
                            deadline={e.deadline}
                            onChange={(newCategory) => handleApplyEmailCategory(e.id, newCategory)}
                          />

                          <button
                            type="button"
                            onClick={() => onOpenEntity('email', e.id)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs cursor-pointer"
                            title="Editar / Ver detalle"
                            aria-label="Editar"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          {onDeleteRequest && (
                            <button
                              type="button"
                              onClick={() => onDeleteRequest('email', e.id)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs cursor-pointer"
                              title="Archivar requerimiento"
                              aria-label="Archivar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Required Action Highlight Box */}
                      {e.requiredAction && (
                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                          <span className="font-bold text-amber-800 shrink-0">Acción requerida:</span>
                          <span className="font-medium leading-relaxed">{e.requiredAction}</span>
                        </div>
                      )}

                      {/* Meta Information & Operational Task Bridge */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        {/* Received Date and badges */}
                        <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500">
                          {e.receivedOrSentDate && (
                            <span>
                              <strong className="text-slate-700">Ingreso:</strong> {formatDate(e.receivedOrSentDate)}
                            </span>
                          )}
                          {followUpsCount > 0 && (
                            <button
                              type="button"
                              onClick={() => onOpenEntity('email', e.id)}
                              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                              title="Ver hitos de seguimiento"
                            >
                              💬 {followUpsCount} {followUpsCount === 1 ? 'hito' : 'hitos'}
                            </button>
                          )}
                          {attachmentsCount > 0 && (
                            <button
                              type="button"
                              onClick={() => onOpenEntity('email', e.id)}
                              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                              title="Ver documentos adjuntos"
                            >
                              📎 {attachmentsCount} {attachmentsCount === 1 ? 'adjunto' : 'adjuntos'}
                            </button>
                          )}
                        </div>

                        {/* Task Bridge Action */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          {linkedTask ? (
                            <button
                              type="button"
                              onClick={() => onOpenEntity('task', linkedTask.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold transition-all cursor-pointer"
                              title="Ver tarea operativa vinculada"
                            >
                              <CheckSquare className="h-3 w-3" />
                              <span>Tarea vinculada</span>
                              <span className="opacity-75 font-normal">({linkedTask.status})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => convertEmailToTask(e.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
                              title="Crear tarea operativa vinculada a este correo"
                            >
                              <Plus className="h-3 w-3" /> Crear Tarea Operativa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 8. PREGUNTAS Y DUDAS ABIERTAS */}
      {activeTab === 'preguntas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Preguntas y Dudas a Resolver ({programQuestions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Consultas técnicas, normativas y financieras para mesas técnicas
              </p>
            </div>
            <button
              onClick={() => onOpenQuickCreate('question')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva Duda
            </button>
          </div>

          <div className="space-y-3">
            {programQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-purple-700 text-[10px] uppercase bg-purple-50 px-2 py-0.5 rounded">
                      {q.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{q.question}</h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Estado: {q.status}
                    </span>
                    <button
                      onClick={() => onOpenEntity('question', q.id)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                      title="Editar / Ver detalle"
                      aria-label="Editar"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    {onDeleteRequest && (
                      <button
                        onClick={() => onDeleteRequest('question', q.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                        title="Eliminar duda"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 text-xs">{q.context}</p>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Próxima instancia: <strong>{q.nextInstance || 'Por definir'}</strong></span>
                  <span>Resp: {q.responsible}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. DOTACIÓN RRHH */}
      {activeTab === 'rrhh' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Equipo ejecutor ({programHR.length})
            </h3>
            <button
              onClick={handleOpenCreateHR}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar
            </button>
          </div>

          {programHR.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <UserCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No hay profesionales registrados en este programa</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Agrega los funcionarios que componen el equipo ejecutor.</p>
              <button
                onClick={handleOpenCreateHR}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar Funcionario
              </button>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block sm:hidden space-y-2.5">
                {programHR.map((h) => {
                  const est = (establishments || []).find((e) => e.id === h.establishmentId);
                  return (
                    <div
                      key={h.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{h.name}</h4>
                          <p className="text-[11px] font-medium text-slate-600">{h.profession}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.status === 'activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : h.status === 'vacante'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {h.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Cargo:</span>
                          <span className="font-medium text-slate-800">{h.role || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Establecimiento:</span>
                          <span className="font-medium text-slate-800">{getEstDisplayName(h.establishmentId)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Horas Prog:</span>
                          <span className="font-bold text-indigo-700">{h.programHours}h</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Contrato:</span>
                          <span className="font-medium text-slate-800">{h.contractType}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleOpenEditHR(h)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                        >
                          <Pencil className="h-3 w-3" /> Editar
                        </button>
                        <button
                          onClick={() => handleStartDeleteHR(h)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" /> Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop / Tablet View - Table */}
              <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                      <th className="p-3.5">Nombre</th>
                      <th className="p-3.5">Profesión</th>
                      <th className="p-3.5">Cargo / Rol</th>
                      <th className="p-3.5">Establecimiento</th>
                      <th className="p-3.5 text-center">Horas Prog.</th>
                      <th className="p-3.5">Contrato</th>
                      <th className="p-3.5 text-center">Estado</th>
                      <th className="p-3.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {programHR.map((h) => {
                      const est = (establishments || []).find((e) => e.id === h.establishmentId);
                      return (
                        <tr
                          key={h.id}
                          className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                          onClick={() => handleOpenEditHR(h)}
                        >
                          <td className="p-3.5 font-bold text-slate-900 group-hover:text-indigo-900">{h.name}</td>
                          <td className="p-3.5 font-medium text-slate-700">{h.profession}</td>
                          <td className="p-3.5 text-slate-600">{h.role}</td>
                          <td className="p-3.5 text-slate-600">{getEstDisplayName(h.establishmentId)}</td>
                          <td className="p-3.5 text-center font-bold text-indigo-700">{h.programHours}h</td>
                          <td className="p-3.5 text-slate-600">{h.contractType}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              h.status === 'activo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : h.status === 'vacante'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {h.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditHR(h)}
                                className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-xs"
                                title="Editar funcionario"
                                aria-label="Editar"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleStartDeleteHR(h)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-all shadow-xs"
                                title="Eliminar funcionario (Requiere OK)"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* 10. TIPS Y CRITERIOS OPERATIVOS */}
      {activeTab === 'conocimiento' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Base de Conocimiento y Criterios Operativos ({programKnowledge.length})
              </h3>
              <p className="text-xs text-slate-500">
                Tips, errores frecuentes a evitar, flujos normativos y requisitos
              </p>
            </div>
            <button
              onClick={() => onOpenQuickCreate('knowledge')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar Tip
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programKnowledge.map((k) => (
              <div
                key={k.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] uppercase">
                    {k.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenEntity('knowledge', k.id)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                      title="Editar / Ver detalle"
                      aria-label="Editar"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    {onDeleteRequest && (
                      <button
                        onClick={() => onDeleteRequest('knowledge', k.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                        title="Eliminar tip"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{k.title}</h4>
                <p className="text-slate-600 leading-relaxed">{k.content}</p>
                <div className="flex gap-1.5 flex-wrap pt-2">
                  {(k.tags || []).map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. ELEAM / CASOS (Personas Mayores) */}
      {activeTab === 'eleam' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Casos y Postulaciones ELEAM / Personas Mayores ({eleamCases.length})
              </h3>
              <p className="text-xs text-slate-500">
                Seguimiento de casos, expedientes SENAMA, EMPAM y Campaña de Invierno
              </p>
            </div>
            <button
              onClick={() => onOpenQuickCreate('eleam')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo Caso ELEAM
            </button>
          </div>

          <div className="space-y-3">
            {eleamCases.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-rose-300 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      {e.caseCode}
                    </span>
                    <span className="font-bold text-slate-900">Postulación ELEAM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 uppercase">
                      {e.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => onOpenEntity('eleam', e.id)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                      title="Editar / Ver detalle"
                      aria-label="Editar"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    {onDeleteRequest && (
                      <button
                        onClick={() => onDeleteRequest('eleam', e.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                        title="Eliminar caso"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-slate-600">
                  <div><strong>Próxima acción:</strong> {e.nextAction}</div>
                  <div><strong>Plazo:</strong> {formatDate(e.deadline)} • <strong>Doc. Pendiente:</strong> {e.pendingDocumentation.join(', ') || 'Completa'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN / CREACIÓN DE PARTIDAS PRESUPUESTARIAS */}
      {(editingFinancial !== null || isCreatingFinancial) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingFinancial ? 'Editar Partida Presupuestaria' : 'Nueva Partida Presupuestaria'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentProgram.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingFinancial(null);
                  setIsCreatingFinancial(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Computed Live Status Strip */}
              {(() => {
                const vig = (Number(financialForm.assignedBudget) || 0) + (Number(financialForm.modifications) || 0);
                const gas = Number(financialForm.executedAmount) || 0;
                const com = Number(financialForm.committedAmount) || 0;
                const dis = Math.max(0, vig - gas - com);
                const pct = vig > 0 ? ((gas / vig) * 100).toFixed(1) : '0.0';

                return (
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Autorizado</span>
                      <span className="text-xs font-bold text-emerald-700">${vig.toLocaleString('es-CL')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Gastado</span>
                      <span className="text-xs font-bold text-rose-600">${gas.toLocaleString('es-CL')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Disponible</span>
                      <span className="text-xs font-bold text-purple-700">${dis.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="col-span-3 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Ejecución Proyectada: {pct}%</span>
                      <div className="w-24">
                        <ProgressBar value={Number(pct)} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Partida / Glosa */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Nombre de la Partida / Glosa / Periodo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={financialForm.periodName}
                  onChange={(e) => setFinancialForm({ ...financialForm, periodName: e.target.value })}
                  placeholder="Ej. Subtítulo 21 - Personal, Subtítulo 22 - Bienes y Servicios..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Subprograma */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Subprograma / Línea Específica (Opcional)
                </label>
                <input
                  type="text"
                  value={financialForm.subprogramId}
                  onChange={(e) => setFinancialForm({ ...financialForm, subprogramId: e.target.value })}
                  placeholder="Ej. Componente Operativo, Prestaciones..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Presupuesto Inicial & Modificaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Presupuesto Inicial ($ CLP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={financialForm.assignedBudget}
                    onChange={(e) => setFinancialForm({ ...financialForm, assignedBudget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Modificaciones (+/- $ CLP)
                  </label>
                  <input
                    type="number"
                    value={financialForm.modifications}
                    onChange={(e) => setFinancialForm({ ...financialForm, modifications: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Presupuesto Gastado & Comprometido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Presupuesto Gastado / Ejecutado ($ CLP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={financialForm.executedAmount}
                    onChange={(e) => setFinancialForm({ ...financialForm, executedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-rose-700 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Comprometido en Compras ($ CLP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={financialForm.committedAmount}
                    onChange={(e) => setFinancialForm({ ...financialForm, committedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Fecha de Corte */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Fecha de Corte / Registro
                </label>
                <input
                  type="date"
                  value={financialForm.cutoffDate}
                  onChange={(e) => setFinancialForm({ ...financialForm, cutoffDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Observaciones / Notas */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Observaciones / Justificación de Modificaciones
                </label>
                <textarea
                  rows={2}
                  value={financialForm.notes}
                  onChange={(e) => setFinancialForm({ ...financialForm, notes: e.target.value })}
                  placeholder="Detalles sobre resoluciones, transferencias o partidas..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setEditingFinancial(null);
                  setIsCreatingFinancial(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFinancial}
                disabled={!financialForm.periodName.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {editingFinancial ? 'Guardar Cambios' : 'Crear Partida'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE EDICIÓN / CREACIÓN DE COMPONENTES PRESUPUESTARIOS */}
      {(editingComponent !== null || isCreatingComponent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingComponent ? 'Editar Componente Presupuestario' : 'Nuevo Componente Presupuestario'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentProgram.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingComponent(null);
                  setIsCreatingComponent(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Presets chips / Selector dinámico por programa */}
              {(() => {
                // Determine component presets dynamically per current program
                const programPresetMap: Record<string, Array<{ name: string; cat: string }>> = {
                  praps_cpu: [
                    { name: 'Recursos Humanos', cat: 'Subtítulo 21 - Personal' },
                    { name: 'Movilización', cat: 'Subtítulo 22 - Bienes y Servicios' },
                    { name: 'Insumos', cat: 'Subtítulo 22 - Insumos Clínicos' },
                    { name: 'Fármacos', cat: 'Subtítulo 22 - Fármacos y Medicamentos' },
                    { name: 'Oxígeno', cat: 'Subtítulo 22 - Gases Clínicos y Equipos' },
                  ],
                  praps_rehab: [
                    { name: 'Recursos Humanos', cat: 'Subtítulo 21 - Personal' },
                    { name: 'Equipamiento y Ayudas Técnicas', cat: 'Subtítulo 29 - Equipamiento' },
                    { name: 'Insumos Terapéuticos', cat: 'Subtítulo 22 - Insumos' },
                    { name: 'Movilización', cat: 'Subtítulo 22 - Traslados' },
                  ],
                  praps_imagenes: [
                    { name: 'Servicios Radiológicos y Mamografías', cat: 'Subtítulo 22 - Servicios Externos' },
                    { name: 'Recursos Humanos', cat: 'Subtítulo 21 - Personal' },
                    { name: 'Insumos y Mantención', cat: 'Subtítulo 22 - Mantención e Insumos' },
                  ],
                  praps_mas_ama: [
                    { name: 'Recursos Humanos', cat: 'Subtítulo 21 - Personal' },
                    { name: 'Material Didáctico y Estimulación', cat: 'Subtítulo 22 - Materiales' },
                    { name: 'Movilización y Eventos', cat: 'Subtítulo 22 - Movilización' },
                  ],
                  praps_respiratoria: [
                    { name: 'Recursos Humanos', cat: 'Subtítulo 21 - Personal' },
                    { name: 'Fármacos e Inhaladores', cat: 'Subtítulo 22 - Fármacos' },
                    { name: 'Oxígeno y Espirometría', cat: 'Subtítulo 22 - Gases e Insumos' },
                  ],
                  prog_personas_mayores: [
                    { name: 'Recursos Humanos', cat: 'Subtítulo 21 - Personal' },
                    { name: 'Talleres y Participación', cat: 'Subtítulo 22 - Actividades Comunitarias' },
                    { name: 'Insumos y Logística', cat: 'Subtítulo 22 - Insumos' },
                  ],
                };

                const currentPresets = programPresetMap[currentProgram.id] || [
                  { name: 'Recursos Humanos', cat: 'Subtítulo 21 - Personal' },
                  { name: 'Movilización', cat: 'Subtítulo 22 - Bienes y Servicios' },
                  { name: 'Insumos', cat: 'Subtítulo 22 - Insumos Clínicos' },
                  { name: 'Fármacos', cat: 'Subtítulo 22 - Fármacos' },
                  { name: 'Oxígeno', cat: 'Subtítulo 22 - Gases Medicinales' },
                ];

                const isStandardMatched = currentPresets.some(
                  (p) => p.name.toLowerCase() === componentForm.name.toLowerCase() ||
                         (p.name === 'Recursos Humanos' && (componentForm.name === 'RRHH' || componentForm.name.toLowerCase() === 'recursos humanos'))
                );

                return (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Nombre del Componente <span className="text-rose-500">*</span>
                    </label>

                    {/* Botones de selección rápida y directa de los 5 componentes del programa */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {currentPresets.map((p) => {
                        const isSelected =
                          componentForm.name.toLowerCase() === p.name.toLowerCase() ||
                          (p.name === 'Recursos Humanos' && (componentForm.name === 'RRHH' || componentForm.name.toLowerCase() === 'recursos humanos'));

                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setComponentForm({
                                ...componentForm,
                                name: p.name,
                                category: p.cat || componentForm.category,
                              });
                            }}
                            className={`px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all text-left flex items-center justify-between gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/70 hover:text-indigo-800 hover:border-indigo-200'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Categoría */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Categoría / Tipo de Gasto
                </label>
                <input
                  type="text"
                  value={componentForm.category}
                  onChange={(e) => setComponentForm({ ...componentForm, category: e.target.value })}
                  placeholder="Ej. Subtítulo 21 - Personal, Subtítulo 22 - Bienes y Servicios..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Presupuesto Componente & Presupuesto Gastado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-indigo-950">
                    Presupuesto Componente ($ CLP) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 font-bold text-xs pointer-events-none">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={componentForm.budgetToSpend}
                      onChange={(e) => setComponentForm({ ...componentForm, budgetToSpend: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-6 pr-3 py-2 text-xs border border-indigo-200 bg-indigo-50/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-indigo-950"
                    />
                  </div>
                  <p className="text-[10px] text-indigo-600 font-medium">Presupuesto asignado a este componente</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-rose-950">
                    Presupuesto Gastado ($ CLP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-600 font-bold text-xs pointer-events-none">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={componentForm.spentAmount}
                      onChange={(e) => setComponentForm({ ...componentForm, spentAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-6 pr-3 py-2 text-xs border border-rose-200 bg-rose-50/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-rose-700 font-mono font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-rose-500 font-medium">Gasto acumulado devengado / pagado</p>
                </div>
              </div>

              {/* Live Status Calculation */}
              {(() => {
                const toSpend = Number(componentForm.budgetToSpend) || 0;
                const spent = Number(componentForm.spentAmount) || 0;
                const available = Math.max(0, toSpend - spent);
                const pct = toSpend > 0 ? ((spent / toSpend) * 100).toFixed(1) : '0.0';

                return (
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Asignado</span>
                      <span className="text-xs font-bold text-indigo-900">${toSpend.toLocaleString('es-CL')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Gastado</span>
                      <span className="text-xs font-bold text-rose-600">${spent.toLocaleString('es-CL')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Disponible</span>
                      <span className="text-xs font-bold text-purple-700">${available.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="col-span-3 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Ejecución del componente: {pct}%</span>
                      <div className="w-24">
                        <ProgressBar value={Number(pct)} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Observaciones / Notas */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Observaciones / Detalle
                </label>
                <textarea
                  rows={2}
                  value={componentForm.notes}
                  onChange={(e) => setComponentForm({ ...componentForm, notes: e.target.value })}
                  placeholder="Detalles sobre asignación, horas contratadas, insumos específicos..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              <div>
                {editingComponent && (
                  <button
                    type="button"
                    onClick={() => {
                      const comp = editingComponent;
                      setEditingComponent(null);
                      setComponentToDelete(comp);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar Componente
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingComponent(null);
                    setIsCreatingComponent(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveComponent}
                  disabled={!componentForm.name.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {editingComponent ? 'Guardar Cambios' : 'Agregar Componente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing / Creating HR Record (Equipo ejecutor) */}
      {(editingHR || isCreatingHR) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingHR ? 'Editar Profesional' : 'Agregar Profesional al Equipo'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {currentProgram.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingHR(null);
                  setIsCreatingHR(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Nombre y Profesión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Nombre del Profesional *
                  </label>
                  <input
                    type="text"
                    required
                    value={hrForm.name}
                    onChange={(e) => handleHRFormFieldChange({ name: e.target.value })}
                    placeholder="ej. Dra. Claudia Navarrete"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Profesión / Título
                  </label>
                  <input
                    type="text"
                    value={hrForm.profession}
                    onChange={(e) => handleHRFormFieldChange({ profession: e.target.value })}
                    placeholder="ej. Médico Cirujano, Kinesiólogo/a"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Cargo y Establecimiento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Cargo / Rol en Programa
                  </label>
                  <input
                    type="text"
                    value={hrForm.role}
                    onChange={(e) => handleHRFormFieldChange({ role: e.target.value })}
                    placeholder="ej. Médico Referente CPU, Terapeuta Ocupacional"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Establecimiento
                  </label>
                  <select
                    value={hrForm.establishmentId}
                    onChange={(e) => handleHRFormFieldChange({ establishmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  >
                    {establishments.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horas, Tipo Contrato y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Horas Asignadas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="44"
                    value={hrForm.programHours}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      handleHRFormFieldChange({ programHours: val, workdayHours: val });
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-indigo-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Tipo Contrato
                  </label>
                  <select
                    value={hrForm.contractType}
                    onChange={(e) => handleHRFormFieldChange({ contractType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  >
                    <option value="Contrata">Contrata</option>
                    <option value="Planta">Planta</option>
                    <option value="Honorarios">Honorarios</option>
                    <option value="Código del Trabajo">Código del Trabajo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Estado
                  </label>
                  <select
                    value={hrForm.status}
                    onChange={(e) => handleHRFormFieldChange({ status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800"
                  >
                    <option value="activo">Activo</option>
                    <option value="en_proceso_seleccion">En Selección</option>
                    <option value="ausencia">Ausencia / Licencia</option>
                    <option value="vacante">Vacante</option>
                  </select>
                </div>
              </div>

              {/* Funciones / Notas */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Funciones / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={hrForm.functions}
                  onChange={(e) => handleHRFormFieldChange({ functions: e.target.value })}
                  placeholder="Funciones clínicas o administrativas asignadas..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setEditingHR(null);
                  setIsCreatingHR(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveHR}
                disabled={!hrForm.name.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {editingHR ? 'Guardar Cambios' : 'Agregar Profesional'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting HR Record with "OK" prompt */}
      {hrToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">¿Eliminar funcionario del equipo?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Estás a punto de eliminar a <span className="font-bold text-slate-800">{hrToDelete.name}</span> ({hrToDelete.role || hrToDelete.profession}).
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900">
                <p className="font-semibold mb-1">Confirmación requerida</p>
                <p className="text-amber-800 leading-relaxed">
                  Para confirmar la eliminación permanente de este profesional, escribe <span className="font-mono font-bold bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950">OK</span> a continuación:
                </p>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Escribe OK para confirmar"
                  className="mt-2.5 w-full px-3 py-2 text-xs font-bold font-mono tracking-wider bg-white border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase text-slate-900"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && deleteConfirmationText.trim().toUpperCase() === 'OK') {
                      handleConfirmDeleteHR();
                    }
                    if (e.key === 'Escape') {
                      setHrToDelete(null);
                      setDeleteConfirmationText('');
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setHrToDelete(null);
                    setDeleteConfirmationText('');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmationText.trim().toUpperCase() !== 'OK'}
                  onClick={handleConfirmDeleteHR}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar Funcionario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Dialog for deleting a Budget Component with OK verification */}
      <ConfirmDialog
        isOpen={!!componentToDelete}
        title="¿Confirmas que deseas eliminar este componente presupuestario?"
        message={`Esta acción eliminará el componente "${componentToDelete?.name || ''}" (${componentToDelete?.category || 'General'}) y su asignación de $${(componentToDelete?.budgetToSpend || 0).toLocaleString('es-CL')} del programa.`}
        confirmLabel="Eliminar Componente"
        cancelLabel="Cancelar"
        isDestructive={true}
        requireOkInput={true}
        onConfirm={() => {
          if (componentToDelete) {
            deleteBudgetComponent(componentToDelete.id);
            setComponentToDelete(null);
          }
        }}
        onCancel={() => setComponentToDelete(null)}
      />

      {/* Confirm Dialog for deleting a Commitment with OK verification */}
      <ConfirmDialog
        isOpen={!!commitmentToDelete}
        title="¿Confirmas que deseas eliminar este compromiso?"
        message={`Esta acción eliminará el compromiso "${commitmentToDelete?.description || ''}" de los registros de la reunión.`}
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
        title="¿Confirmas que deseas archivar/eliminar esta reunión?"
        message={`Esta acción eliminará la sesión "${meetingToDelete?.title || ''}", incluyendo sus acuerdos y compromisos asociados.`}
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
