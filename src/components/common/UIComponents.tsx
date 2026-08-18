import React from 'react';
import { 
  TrafficLightStatus, 
  PriorityLevel, 
  TaskStatus, 
  PurchaseStatus, 
  PurchaseMacroState,
  PurchaseReceptionStatus,
  PurchaseInvoiceStatus,
  AlertSeverity 
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
  Hourglass
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

export const TaskStatusChip: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const configs = {
    pendiente: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Pendiente' },
    en_curso: { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'En Curso' },
    bloqueada: { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Bloqueada' },
    completada: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Completada' },
    vencida: { bg: 'bg-red-100 text-red-800 border-red-200 font-semibold', label: 'Vencida' },
  };
  const c = configs[status] || configs.pendiente;
  return (
    <span id={`task-status-${status}`} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${c.bg}`}>
      {c.label}
    </span>
  );
};

export const PurchaseStatusChip: React.FC<{ status?: PurchaseStatus; macroState?: PurchaseMacroState }> = ({ status, macroState }) => {
  if (macroState) {
    return <PurchaseMacroBadge macroState={macroState} />;
  }
  const configs: Record<string, { bg: string; label: string }> = {
    solicitado: { bg: 'bg-slate-100 text-slate-700 border border-slate-200', label: 'Por hacer' },
    en_compra: { bg: 'bg-amber-50 text-amber-800 border border-amber-200', label: 'En ejecución' },
    recepcionado: { bg: 'bg-emerald-50 text-emerald-800 border border-emerald-200', label: 'Realizado' },
    cerrado: { bg: 'bg-emerald-50 text-emerald-800 border border-emerald-200', label: 'Realizado' },
    problema: { bg: 'bg-rose-50 text-rose-800 border border-rose-200 font-semibold', label: 'Con traba' },
  };
  const c = (status && configs[status]) || configs.solicitado;
  return (
    <span id={`purchase-status-${status || 'default'}`} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg}`}>
      {c.label}
    </span>
  );
};

export const PurchaseMacroBadge: React.FC<{ macroState: PurchaseMacroState; size?: 'sm' | 'md' }> = ({
  macroState,
  size = 'md',
}) => {
  const configs = {
    por_hacer: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      label: 'Por hacer',
      icon: Clock,
    },
    en_ejecucion: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'En ejecución',
      icon: Hourglass,
    },
    realizado: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      label: 'Realizado',
      icon: CheckCircle2,
    },
  };

  const c = configs[macroState] || configs.por_hacer;
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
      title={`Estado de Recepción: ${c.label}${date ? ` (${date})` : ''}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      <span>{c.label}</span>
      {showDate && date && <span className="font-normal opacity-80">({date})</span>}
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
