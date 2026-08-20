import React from 'react';
import { formatDate } from '../../utils/dateUtils';
import { 
  TrafficLightStatus, 
  PriorityLevel, 
  TaskStatus, 
  PurchaseStatus, 
  PurchaseMacroState,
  PurchaseReceptionStatus,
  PurchaseInvoiceStatus,
  AlertSeverity,
  normalizeTaskStatus,
  isTaskCompleted,
  CommunicationType,
  CommunicationStatus,
  normalizeCommunicationStatus,
  getEmailDueInfo,
} from '../../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Calendar,
  XCircle,
  HelpCircle,
  PackageCheck,
  Package,
  Receipt,
  PlayCircle,
  CheckCircle,
  Hourglass,
  ChevronDown,
  Mail,
  Send,
  Inbox,
  FileCheck,
  FileQuestion,
  Layers,
  Paperclip,
} from 'lucide-react';

export const TrafficLightBadge: React.FC<{ status: TrafficLightStatus; showLabel?: boolean; size?: 'sm' | 'md' | 'lg' }> = ({
  status,
  showLabel = true,
  size = 'md',
}) => {
  const configs = {
    green: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Normal / En regla',
      icon: CheckCircle2,
    },
    yellow: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Atención / En riesgo',
      icon: AlertTriangle,
    },
    red: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Crítico / Urgente',
      icon: ShieldAlert,
    },
    gray: {
      bg: 'bg-slate-50 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      label: 'Sin información',
      icon: HelpCircle,
    },
  };

  const c = configs[status] || configs.gray;
  const Icon = c.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3.5 py-1.5 text-sm font-medium',
  };

  return (
    <span
      id={`traffic-badge-${status}`}
      className={`inline-flex items-center gap-1.5 rounded-full border ${c.bg} ${sizeClasses[size]} tracking-tight whitespace-nowrap`}
    >
      <span className={`h-2 w-2 rounded-full ${c.dot} animate-pulse`} />
      {showLabel && <span>{c.label}</span>}
    </span>
  );
};

export const PriorityChip: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  const configs = {
    critica: { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Crítica' },
    alta: { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Alta' },
    media: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Media' },
    baja: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Baja' },
  };
  const c = configs[priority] || configs.media;
  return (
    <span id={`priority-chip-${priority}`} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${c.bg}`}>
      {c.label}
    </span>
  );
};

export const TaskUrgencyChip: React.FC<{
  isUrgent?: boolean;
  onChange?: (isUrgent: boolean) => void;
  className?: string;
}> = ({ isUrgent = false, onChange, className = '' }) => {
  if (onChange) {
    return (
      <div className={`relative inline-flex items-center ${className}`} onClick={(e) => e.stopPropagation()}>
        <select
          id={`task-urgency-select-${isUrgent ? 'urgent' : 'normal'}`}
          value={isUrgent ? 'urgente' : 'no_urgente'}
          onChange={(e) => onChange(e.target.value === 'urgente')}
          className={`appearance-none font-semibold rounded-lg border text-xs pr-6 pl-2.5 py-1 transition-all cursor-pointer shadow-2xs hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${
            isUrgent
              ? 'bg-rose-50 text-rose-700 border-rose-300'
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
          title="Cambiar urgencia: Urgente o No urgente"
        >
          <option value="urgente">Urgente</option>
          <option value="no_urgente">No urgente</option>
        </select>
        <ChevronDown className={`h-3 w-3 absolute right-1.5 pointer-events-none ${isUrgent ? 'text-rose-700' : 'text-slate-700'} opacity-70`} />
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
      isUrgent
        ? 'bg-rose-50 text-rose-700 border-rose-300'
        : 'bg-slate-100 text-slate-700 border-slate-300'
    } ${className}`}>
      {isUrgent ? 'Urgente' : 'No urgente'}
    </span>
  );
};

export type TaskOperationalCategory = 'pendiente' | 'en_ejecucion' | 'completado' | 'vence_hoy' | 'vencido';

export const TaskStatusChip: React.FC<{ 
  status: TaskStatus | string;
  dueDate?: string;
  category?: TaskOperationalCategory;
  onChange?: (newStatus: any) => void;
  className?: string;
}> = ({ status, dueDate, category, onChange, className = '' }) => {
  const todayStr = '2026-08-15';

  const currentCategory: TaskOperationalCategory = (() => {
    if (category) return category;
    const isDone = isTaskCompleted(status as TaskStatus);
    if (isDone) return 'completado';
    if (dueDate) {
      if (dueDate < todayStr) return 'vencido';
      if (dueDate === todayStr) return 'vence_hoy';
    }
    const normalized = normalizeTaskStatus(status as TaskStatus);
    if (normalized === 'en_ejecucion') return 'en_ejecucion';
    return 'pendiente';
  })();

  const configs: Record<TaskOperationalCategory, { bg: string; text: string; border: string; label: string }> = {
    pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', label: 'Pendiente' },
    en_ejecucion: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', label: 'En ejecución' },
    completado: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300 font-semibold', label: 'Cerrado' },
    vence_hoy: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300 font-semibold', label: 'Vence hoy' },
    vencido: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300 font-semibold', label: 'Vencido' },
  };

  const c = configs[currentCategory] || configs.pendiente;

  if (onChange) {
    return (
      <div className={`relative inline-flex items-center ${className}`} onClick={(e) => e.stopPropagation()}>
        <select
          id={`task-status-select-${currentCategory}`}
          value={currentCategory}
          onChange={(e) => onChange(e.target.value)}
          className={`appearance-none font-semibold rounded-lg border text-xs pr-6 pl-2.5 py-1 transition-all cursor-pointer shadow-2xs hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${c.bg} ${c.text} ${c.border}`}
          title="Cambiar estado: Pendiente, En ejecución, Cerrado, Vence hoy, Vencido"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_ejecucion">En ejecución</option>
          <option value="completado">Cerrado</option>
          <option value="vence_hoy">Vence hoy</option>
          <option value="vencido">Vencido</option>
        </select>
        <ChevronDown className={`h-3 w-3 absolute right-1.5 pointer-events-none ${c.text} opacity-70`} />
      </div>
    );
  }

  return (
    <span id={`task-status-${currentCategory}`} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}>
      {c.label}
    </span>
  );
};

export type PurchaseOperationalCategory = 'pendiente' | 'en_ejecucion' | 'completado';

export const PurchaseStatusChip: React.FC<{
  status?: PurchaseStatus | string;
  macroState?: PurchaseMacroState;
  category?: PurchaseOperationalCategory;
  onChange?: (newCategory: PurchaseOperationalCategory) => void;
  className?: string;
}> = ({ status, macroState, category, onChange, className = '' }) => {
  const currentCategory: PurchaseOperationalCategory = (() => {
    if (category) return category;
    if (macroState === 'completado' || status === 'recepcionado' || status === 'cerrado' || macroState === 'realizado') {
      return 'completado';
    }
    if (macroState === 'en_ejecucion' || status === 'en_compra') {
      return 'en_ejecucion';
    }
    return 'pendiente';
  })();

  const configs: Record<PurchaseOperationalCategory, { bg: string; text: string; border: string; label: string }> = {
    pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', label: 'Pendiente' },
    en_ejecucion: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', label: 'En ejecución' },
    completado: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300 font-semibold', label: 'Cerrado' },
  };

  const c = configs[currentCategory] || configs.pendiente;

  if (onChange) {
    return (
      <div className={`relative inline-flex items-center ${className}`} onClick={(e) => e.stopPropagation()}>
        <select
          id={`purchase-status-select-${currentCategory}`}
          value={currentCategory}
          onChange={(e) => onChange(e.target.value as PurchaseOperationalCategory)}
          className={`appearance-none font-semibold rounded-lg border text-xs pr-6 pl-2.5 py-1 transition-all cursor-pointer shadow-2xs hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${c.bg} ${c.text} ${c.border}`}
          title="Cambiar estado: Pendiente, En ejecución, Cerrado"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_ejecucion">En ejecución</option>
          <option value="completado">Cerrado</option>
        </select>
        <ChevronDown className={`h-3 w-3 absolute right-1.5 pointer-events-none ${c.text} opacity-70`} />
      </div>
    );
  }

  return (
    <span id={`purchase-status-${currentCategory}`} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}>
      {c.label}
    </span>
  );
};

export const PurchaseMacroBadge: React.FC<{ macroState: PurchaseMacroState; size?: 'sm' | 'md' }> = ({
  macroState,
  size = 'md',
}) => {
  const configs: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
    pendiente: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Pendiente',
      icon: Clock,
    },
    por_hacer: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Pendiente',
      icon: Clock,
    },
    en_ejecucion: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      label: 'En ejecución',
      icon: Hourglass,
    },
    completado: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      label: 'Completado',
      icon: CheckCircle2,
    },
    realizado: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      label: 'Completado',
      icon: CheckCircle2,
    },
  };

  const c = configs[macroState] || configs.pendiente;
  const Icon = c.icon;

  return (
    <span
      id={`purchase-macro-${macroState}`}
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border ${c.bg} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      <span>{c.label}</span>
    </span>
  );
};

export const PurchaseReceptionBadge: React.FC<{ 
  status?: PurchaseReceptionStatus; 
  date?: string; 
  showDate?: boolean;
  size?: 'sm' | 'md';
}> = ({
  status = 'pendiente',
  date,
  showDate = false,
  size = 'md',
}) => {
  const configs: Record<PurchaseReceptionStatus, { bg: string; dot: string; label: string; icon: React.ElementType }> = {
    pendiente: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      label: 'Recepción: Pendiente',
      icon: Clock,
    },
    conforme: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Recepción: Conforme',
      icon: PackageCheck,
    },
    rechazada: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Recepción: Rechazada',
      icon: XCircle,
    },
    con_observaciones: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Recepción: Con Obs.',
      icon: AlertTriangle,
    },
  };

  const c = configs[status] || configs.pendiente;
  const Icon = c.icon;

  return (
    <span
      id={`reception-status-${status}`}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border ${c.bg} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      title={`Estado de Recepción: ${c.label}${date ? ` (${formatDate(date)})` : ''}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      <span>{c.label}</span>
      {showDate && date && <span className="font-normal opacity-80">({formatDate(date)})</span>}
    </span>
  );
};

export const PurchaseInvoiceBadge: React.FC<{ 
  status?: PurchaseInvoiceStatus; 
  invoiceNumber?: string; 
  showNumber?: boolean;
  size?: 'sm' | 'md';
}> = ({
  status = 'sin_factura',
  invoiceNumber,
  showNumber = false,
  size = 'md',
}) => {
  const configs: Record<PurchaseInvoiceStatus, { bg: string; dot: string; label: string; icon: React.ElementType }> = {
    sin_factura: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      label: 'Factura: Sin factura',
      icon: Clock,
    },
    recibida: {
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      dot: 'bg-sky-500',
      label: 'Factura: Recibida',
      icon: Receipt,
    },
    en_revision: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Factura: En revisión',
      icon: AlertCircle,
    },
    pagada: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Factura: Pagada',
      icon: CheckCircle,
    },
  };

  const c = configs[status] || configs.sin_factura;
  const Icon = c.icon;

  return (
    <span
      id={`invoice-status-${status}`}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border ${c.bg} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      title={`Estado de Facturación: ${c.label}${invoiceNumber ? ` (${invoiceNumber})` : ''}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      <span>{c.label}</span>
      {showNumber && invoiceNumber && <span className="font-mono text-[10px] opacity-90 font-bold">#{invoiceNumber}</span>}
    </span>
  );
};

export const AlertSeverityBadge: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  const configs = {
    critica: { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Crítica' },
    alta: { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Alta' },
    media: { bg: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Media' },
    informativa: { bg: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Informativa' },
  };
  const c = configs[severity] || configs.media;
  return (
    <span id={`severity-badge-${severity}`} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${c.bg}`}>
      {c.label}
    </span>
  );
};

export const ProgramBadge: React.FC<{ programId: string; shortName?: string; color?: string }> = ({
  programId,
  shortName,
  color = '#0284c7',
}) => {
  const labels: Record<string, string> = {
    praps_cpu: 'CPU Paliativos',
    praps_rehab: 'Rehabilitación',
    praps_imagenes: 'Imágenes Diag.',
    praps_mas_ama: 'MAS AMA',
    praps_respiratoria: 'Salud Respiratoria',
    prog_personas_mayores: 'Personas Mayores',
  };

  const label = shortName || labels[programId] || programId;

  return (
    <span
      id={`program-badge-${programId}`}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="truncate max-w-[140px]">{label}</span>
    </span>
  );
};

export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  showText?: boolean;
  colorScheme?: 'auto' | 'emerald' | 'amber' | 'rose' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
}> = ({ value, max = 100, showText = false, colorScheme = 'auto', size = 'md' }) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  let barColor = 'bg-indigo-600';
  if (colorScheme === 'auto') {
    if (percentage >= 85) barColor = 'bg-emerald-500';
    else if (percentage >= 70) barColor = 'bg-amber-500';
    else barColor = 'bg-rose-500';
  } else if (colorScheme === 'emerald') barColor = 'bg-emerald-500';
  else if (colorScheme === 'amber') barColor = 'bg-amber-500';
  else if (colorScheme === 'rose') barColor = 'bg-rose-500';
  else if (colorScheme === 'indigo') barColor = 'bg-indigo-600';

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full flex items-center gap-2">
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <span className="text-xs font-semibold text-slate-700 min-w-[40px] text-right">
          {percentage.toFixed(1)}%
        </span>
      )}
    </div>
  );
};

export const MeetingTypeBadge: React.FC<{
  type: 'reunion' | 'comite' | 'capacitacion' | 'consultoria' | 'coordinacion' | string;
  className?: string;
}> = ({ type, className = '' }) => {
  const configs: Record<string, { bg: string; text: string; border: string; label: string }> = {
    reunion: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Reunión' },
    comite: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Comité Técnico' },
    capacitacion: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Capacitación' },
    consultoria: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Consultoría / Asesoría' },
    coordinacion: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Coordinación Red' },
  };

  const c = configs[type] || configs.reunion;

  return (
    <span
      id={`meeting-type-badge-${type}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      {c.label}
    </span>
  );
};

export const MeetingStatusBadge: React.FC<{
  status?: 'programada' | 'en_curso' | 'finalizada' | 'cancelada' | string;
  className?: string;
}> = ({ status = 'programada', className = '' }) => {
  const configs: Record<string, { bg: string; text: string; border: string; label: string }> = {
    programada: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Programada' },
    en_curso: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'En curso' },
    finalizada: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Finalizada' },
    cancelada: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Cancelada' },
  };

  const c = configs[status] || configs.programada;

  return (
    <span
      id={`meeting-status-badge-${status}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      {c.label}
    </span>
  );
};

export type MeetingOperationalCategory = 'pendiente' | 'en_ejecucion' | 'completado';

export const MeetingStatusChip: React.FC<{
  status?: string;
  category?: MeetingOperationalCategory;
  onChange?: (newStatus: MeetingOperationalCategory) => void;
  className?: string;
}> = ({ status = 'pendiente', category, onChange, className = '' }) => {
  const currentCategory: MeetingOperationalCategory = (() => {
    if (category) return category;
    const isDone = status === 'finalizada' || status === 'cumplido' || status === 'completado' || status === 'terminada';
    if (isDone) return 'completado';
    if (status === 'en_curso' || status === 'en_progreso' || status === 'en_ejecucion') return 'en_ejecucion';
    return 'pendiente';
  })();

  const configs: Record<MeetingOperationalCategory, { bg: string; text: string; border: string; label: string }> = {
    pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', label: 'Pendiente' },
    en_ejecucion: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', label: 'En ejecución' },
    completado: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300 font-semibold', label: 'Cerrado' },
  };

  const c = configs[currentCategory] || configs.pendiente;

  if (onChange) {
    return (
      <div className={`relative inline-flex items-center ${className}`} onClick={(e) => e.stopPropagation()}>
        <select
          id={`meeting-status-select-${currentCategory}`}
          value={currentCategory}
          onChange={(e) => onChange(e.target.value as MeetingOperationalCategory)}
          className={`appearance-none font-semibold rounded-lg border text-xs pr-6 pl-2.5 py-1 transition-all cursor-pointer shadow-2xs hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${c.bg} ${c.text} ${c.border}`}
          title="Cambiar estado: Pendiente, En ejecución, Cerrado"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_ejecucion">En ejecución</option>
          <option value="completado">Cerrado</option>
        </select>
        <ChevronDown className={`h-3 w-3 absolute right-1.5 pointer-events-none ${c.text} opacity-70`} />
      </div>
    );
  }

  return (
    <span
      id={`meeting-status-${currentCategory}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      {c.label}
    </span>
  );
};

export const CommitmentStatusChip: React.FC<{
  status: 'pendiente' | 'en_curso' | 'cumplido' | 'cancelado' | 'completado' | string;
  onChange?: (newStatus: 'pendiente' | 'en_curso' | 'cumplido' | 'cancelado') => void;
  className?: string;
}> = ({ status, onChange, className = '' }) => {
  const normalized = status === 'completado' ? 'cumplido' : status;

  const configs: Record<string, { bg: string; text: string; border: string; label: string }> = {
    pendiente: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Pendiente' },
    en_curso: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', label: 'En curso' },
    cumplido: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300 font-semibold', label: 'Cumplido' },
    cancelado: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Cancelado' },
  };

  const c = configs[normalized] || configs.pendiente;

  if (onChange) {
    return (
      <div className={`relative inline-flex items-center ${className}`} onClick={(e) => e.stopPropagation()}>
        <select
          id={`commitment-status-select-${normalized}`}
          value={normalized}
          onChange={(e) => onChange(e.target.value as any)}
          className={`appearance-none font-semibold rounded-lg border text-xs pr-6 pl-2.5 py-1 transition-all cursor-pointer shadow-2xs hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${c.bg} ${c.text} ${c.border}`}
          title="Cambiar estado del compromiso"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_curso">En curso</option>
          <option value="cumplido">Cumplido</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <ChevronDown className={`h-3 w-3 absolute right-1.5 pointer-events-none ${c.text} opacity-70`} />
      </div>
    );
  }

  return (
    <span
      id={`commitment-status-${normalized}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      {c.label}
    </span>
  );
};

export const OverdueBadge: React.FC<{
  days?: number;
  className?: string;
}> = ({ days, className = '' }) => {
  return (
    <span
      id="overdue-condition-badge"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse ${className}`}
      title="Condición de vencimiento calculada: la fecha límite ya expiró"
    >
      <AlertCircle className="w-3 h-3 text-rose-600" />
      {days !== undefined && days > 0 ? `Vencido (${days}d)` : 'Vencido'}
    </span>
  );
};

export const CommunicationTypeBadge: React.FC<{
  type?: CommunicationType | string;
  className?: string;
}> = ({ type = 'correo_recibido', className = '' }) => {
  const configs: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
    correo_recibido: { label: 'Correo Recibido', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Inbox },
    correo_por_enviar: { label: 'Correo por Enviar', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Send },
    oficio: { label: 'Oficio', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: FileCheck },
    solicitud: { label: 'Solicitud', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: FileQuestion },
    requerimiento: { label: 'Requerimiento', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: AlertCircle },
    otro: { label: 'Otro', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: Layers },
  };

  const c = configs[type] || configs.correo_recibido;
  const Icon = c.icon;

  return (
    <span
      id={`comm-type-${type}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{c.label}</span>
    </span>
  );
};

export type CommunicationOperationalCategory = 'pendiente' | 'en_gestion' | 'cerrado' | 'vence_hoy' | 'vencido';

export const CommunicationStatusChip: React.FC<{
  status?: string;
  deadline?: string;
  category?: CommunicationOperationalCategory;
  onChange?: (newCategory: CommunicationOperationalCategory) => void;
  className?: string;
}> = ({ status, deadline, category, onChange, className = '' }) => {
  const currentCategory: CommunicationOperationalCategory = (() => {
    if (category) return category;
    const canonical = normalizeCommunicationStatus(status);
    if (canonical === 'cerrado' || canonical === 'respondido') return 'cerrado';
    if (deadline) {
      const dueInfo = getEmailDueInfo(deadline, status);
      if (dueInfo.type === 'vencido') return 'vencido';
      if (dueInfo.type === 'hoy') return 'vence_hoy';
    }
    if (canonical === 'en_gestion') return 'en_gestion';
    return 'pendiente';
  })();

  const configs: Record<CommunicationOperationalCategory, { bg: string; text: string; border: string; label: string; dot: string }> = {
    pendiente: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-300',
      label: 'Pendiente',
      dot: 'bg-amber-500',
    },
    en_gestion: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300',
      label: 'En ejecución',
      dot: 'bg-blue-500',
    },
    cerrado: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      label: 'Cerrado',
      dot: 'bg-emerald-500',
    },
    vence_hoy: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-300',
      label: 'Vence hoy',
      dot: 'bg-orange-500',
    },
    vencido: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-300',
      label: 'Vencidos',
      dot: 'bg-rose-500',
    },
  };

  const c = configs[currentCategory] || configs.pendiente;

  if (onChange) {
    return (
      <div className={`relative inline-flex items-center ${className}`} onClick={(e) => e.stopPropagation()}>
        <select
          id={`comm-status-select-${currentCategory}`}
          value={currentCategory}
          onChange={(e) => onChange(e.target.value as CommunicationOperationalCategory)}
          className={`appearance-none font-semibold rounded-lg border text-xs pr-6 pl-2.5 py-1 transition-all cursor-pointer shadow-2xs hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${c.bg} ${c.text} ${c.border}`}
          title="Cambiar estado del requerimiento"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_gestion">En ejecución</option>
          <option value="cerrado">Cerrado</option>
          <option value="vence_hoy">Vence hoy</option>
          <option value="vencido">Vencidos</option>
        </select>
        <ChevronDown className={`h-3 w-3 absolute right-1.5 pointer-events-none ${c.text} opacity-70`} />
      </div>
    );
  }

  return (
    <span
      id={`comm-status-${currentCategory}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      <span>{c.label}</span>
    </span>
  );
};

export const CommunicationDeadlineNotice: React.FC<{
  deadline?: string;
  status?: string;
  currentDate?: string;
  className?: string;
}> = ({ deadline, status, currentDate = '2026-08-15', className = '' }) => {
  if (!deadline) {
    return <span className={`text-slate-400 ${className}`}>Sin plazo</span>;
  }

  const dueInfo = getEmailDueInfo(deadline, status, currentDate);
  const formattedDate = formatDate(deadline);

  if (dueInfo.type === 'cerrado') {
    return <span className={`text-slate-400 ${className}`}>Venció: {formattedDate} (cerrado)</span>;
  }

  if (dueInfo.type === 'vencido') {
    return (
      <span className={`text-rose-600 font-bold ${className}`}>
        Vence: {formattedDate} ({dueInfo.label.toLowerCase()})
      </span>
    );
  }

  if (dueInfo.type === 'hoy') {
    return (
      <span className={`text-amber-700 font-bold ${className}`}>
        Vence: {formattedDate} (vence hoy)
      </span>
    );
  }

  if (dueInfo.type === 'manana') {
    return (
      <span className={`text-amber-700 font-semibold ${className}`}>
        Vence: {formattedDate} (vence mañana)
      </span>
    );
  }

  if (dueInfo.type === 'proximo') {
    return (
      <span className={`text-amber-700 font-semibold ${className}`}>
        Vence: {formattedDate} ({dueInfo.label.toLowerCase()})
      </span>
    );
  }

  return (
    <span className={`text-slate-500 ${className}`}>
      Vence: {formattedDate} ({dueInfo.label.toLowerCase()})
    </span>
  );
};

export const CommunicationDueBadge: React.FC<{
  deadline?: string;
  status?: string;
  currentDate?: string;
  className?: string;
}> = ({ deadline, status, currentDate = '2026-08-15', className = '' }) => {
  const info = getEmailDueInfo(deadline, status, currentDate);

  if (info.type === 'cerrado') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
        <CheckCircle2 className="w-3 h-3" />
        <span>Resuelto</span>
      </span>
    );
  }

  if (info.type === 'vencido') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse ${className}`}
        title="Plazo vencido"
      >
        <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
        <span>🔴 {info.label.toUpperCase()}</span>
      </span>
    );
  }

  if (info.type === 'hoy') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 ${className}`}
        title="Vence hoy"
      >
        <Clock className="w-3 h-3 text-amber-700 shrink-0" />
        <span>🟡 VENCE HOY</span>
      </span>
    );
  }

  if (info.type === 'manana') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        title="Vence mañana"
      >
        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
        <span>🟡 VENCE MAÑANA</span>
      </span>
    );
  }

  if (info.type === 'proximo') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 ${className}`}
        title="Próximo a vencer"
      >
        <Clock className="w-3 h-3 text-sky-600 shrink-0" />
        <span>{info.label}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 ${className}`}
    >
      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
      <span>{info.label}</span>
    </span>
  );
};

