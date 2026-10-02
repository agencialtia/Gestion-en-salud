import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, PendingEmail, PriorityLevel, TaskStatus } from '../../types';
import { DrawerEntityType } from './EntityDrawer';
import {
  X,
  CheckSquare,
  Square,
  Mail,
  Calendar,
  Clock,
  User as UserIcon,
  Tag,
  AlertCircle,
  Flame,
  ArrowRight,
  Trash2,
  ExternalLink,
  MessageSquare,
  ListTodo,
  Check,
  Plus,
  Send,
  Building2,
  FileText,
  Link2,
  Sparkles
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface TrelloCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string | null;
  cardType: 'task' | 'email' | null;
  onNavigateToProgram?: (programId: string) => void;
  onOpenEntity?: (type: DrawerEntityType, id: string) => void;
}

export const TrelloCardModal: React.FC<TrelloCardModalProps> = ({
  isOpen,
  onClose,
  cardId,
  cardType,
  onNavigateToProgram,
  onOpenEntity,
}) => {
  const {
    tasks,
    emails,
    programs,
    currentUser,
    updateTask,
    updateEmail,
    deleteTask,
    deleteEmail,
    convertEmailToTask,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    setSelectedProgramId,
    setActiveView,
  } = useApp();

  // Find the active task or email with string equality
  const task = useMemo(() => {
    if (cardType !== 'task' || !cardId) return null;
    return tasks.find((t) => String(t.id) === String(cardId)) || null;
  }, [tasks, cardId, cardType]);

  const email = useMemo(() => {
    if (cardType !== 'email' || !cardId) return null;
    return emails.find((e) => String(e.id) === String(cardId)) || null;
  }, [emails, cardId, cardType]);

  const currentProgram = useMemo(() => {
    const pId = task?.programId || email?.programId;
    if (!pId) return null;
    return programs.find((p) => p.id === pId) || null;
  }, [programs, task?.programId, email?.programId]);

  // Determine canonical column: 'pendiente' | 'en_ejecucion' | 'resuelto'
  const currentColumn = useMemo(() => {
    if (task) {
      const s = task.status;
      if (s === 'completada' || s === 'terminada') return 'resuelto';
      if (s === 'en_ejecucion' || s === 'en_progreso' || s === 'en_curso') return 'en_ejecucion';
      return 'pendiente';
    }
    if (email) {
      const s = email.status;
      if (s === 'respondido' || s === 'cerrado' || s === 'archivado') return 'resuelto';
      if (s === 'en_gestion' || s === 'en_curso' || s === 'en_seguimiento') return 'en_ejecucion';
      return 'pendiente';
    }
    return 'pendiente';
  }, [task, email]);

  // Checklist items mapping (must be declared at top level)
  const checklistItems = useMemo(() => {
    if (task) {
      return (task.checklist || []).map((item: any, idx: number) => ({
        id: item.id || `chk-${idx}`,
        text: item.description || item.text || '',
        completed: Boolean(item.isCompleted || item.completed),
      }));
    }
    if (email) {
      return (email.checklist || []).map((item: any, idx: number) => ({
        id: item.id || `chk-em-${idx}`,
        text: item.description || item.text || '',
        completed: Boolean(item.isCompleted || item.completed),
      }));
    }
    return [];
  }, [task, email]);

  // Comments / Audit timeline (must be declared at top level)
  const comments = useMemo(() => {
    const list: any[] = [];
    if (task) {
      if (Array.isArray(task.comments)) {
        list.push(...task.comments);
      }
      if (Array.isArray(task.history)) {
        task.history.forEach((h: any) => {
          list.push({
            id: h.id || `hist-${h.date}`,
            author: h.user || 'Klaus Bauer',
            text: `${h.action ? `[${h.action.toUpperCase()}]: ` : ''}${h.details || ''}`,
            date: h.date || '',
            isAudit: true,
          });
        });
      } else if (Array.isArray(task.auditTrail)) {
        task.auditTrail.forEach((aud: any) => {
          list.push({
            id: aud.id || `aud-${aud.date}`,
            author: aud.user || 'Sistema',
            text: `${aud.action ? aud.action + ': ' : ''}${aud.details || ''}`,
            date: aud.date || '',
            isAudit: true,
          });
        });
      }
    }
    if (email) {
      if (Array.isArray(email.comments)) {
        list.push(...email.comments);
      }
      if (Array.isArray(email.followUps)) {
        email.followUps.forEach((fu: any) => {
          list.push({
            id: fu.id || `fu-${fu.date}`,
            author: fu.user || 'Sistema',
            text: `[${fu.type?.toUpperCase() || 'SEGUIMIENTO'}]: ${fu.note || ''}`,
            date: fu.date || '',
            isAudit: true,
          });
        });
      }
    }
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [task, email]);

  // Local editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState('');

  const [newChecklistText, setNewChecklistText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync state when card opens
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title || '');
      setEditedDesc(task.description || '');
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setConfirmDelete(false);
    } else if (email) {
      setEditedTitle(email.subject || '');
      setEditedDesc(email.body || email.requiredAction || '');
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setConfirmDelete(false);
    }
  }, [task, email]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Title save
  const handleSaveTitle = () => {
    if (!editedTitle.trim()) return;
    if (task) {
      updateTask(task.id!, { title: editedTitle.trim() }, true);
    } else if (email) {
      updateEmail(email.id!, { subject: editedTitle.trim() }, true);
    }
    setIsEditingTitle(false);
  };

  // Description save
  const handleSaveDesc = () => {
    if (task) {
      updateTask(task.id!, { description: editedDesc }, true);
    } else if (email) {
      updateEmail(email.id!, { body: editedDesc, requiredAction: editedDesc }, true);
    }
    setIsEditingDesc(false);
  };

  // Change Column / List
  const handleChangeColumn = (newCol: 'pendiente' | 'en_ejecucion' | 'resuelto') => {
    if (task) {
      const newStatus: TaskStatus =
        newCol === 'resuelto' ? 'completada' : newCol === 'en_ejecucion' ? 'en_ejecucion' : 'pendiente';
      updateTask(task.id!, { status: newStatus }, true);
    } else if (email) {
      const newStatus =
        newCol === 'resuelto' ? 'respondido' : newCol === 'en_ejecucion' ? 'en_gestion' : 'pendiente';
      updateEmail(email.id!, { status: newStatus }, true);
    }
  };

  // Change Priority
  const handleChangePriority = (p: PriorityLevel) => {
    if (task) {
      updateTask(task.id!, { priority: p }, true);
    } else if (email) {
      updateEmail(email.id!, { priority: p }, true);
    }
  };

  // Change Program
  const handleChangeProgram = (programId: string) => {
    if (task) {
      updateTask(task.id!, { programId }, true);
    } else if (email) {
      updateEmail(email.id!, { programId }, true);
    }
  };

  // Change Due Date
  const handleChangeDueDate = (dateStr: string) => {
    if (task) {
      updateTask(task.id!, { dueDate: dateStr, endDate: dateStr }, true);
    } else if (email) {
      updateEmail(email.id!, { dueDate: dateStr, deadline: dateStr }, true);
    }
  };

  const checklistTotal = checklistItems.length;
  const checklistCompleted = checklistItems.filter((i) => i.completed).length;
  const checklistProgress = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  const handleToggleCheckItem = (itemId: string, currentVal: boolean) => {
    if (task) {
      if (Array.isArray(task.checklist)) {
        const updated = task.checklist.map((item: any) => {
          if (item.id === itemId) {
            return { ...item, isCompleted: !currentVal, completed: !currentVal };
          }
          return item;
        });
        updateTask(task.id!, { checklist: updated }, true);
      } else {
        toggleChecklistItem(task.id!, itemId);
      }
    } else if (email) {
      const updated = (email.checklist || []).map((item: any) =>
        item.id === itemId ? { ...item, completed: !currentVal, isCompleted: !currentVal } : item
      );
      updateEmail(email.id!, { checklist: updated }, true);
    }
  };

  const handleAddCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    if (task) {
      const newItem = {
        id: `chk_${Date.now()}`,
        description: newChecklistText.trim(),
        text: newChecklistText.trim(),
        isCompleted: false,
        completed: false,
      };
      const existing = Array.isArray(task.checklist) ? task.checklist : [];
      updateTask(task.id!, { checklist: [...existing, newItem] }, true);
    } else if (email) {
      const newItem = {
        id: `chk_${Date.now()}`,
        description: newChecklistText.trim(),
        text: newChecklistText.trim(),
        isCompleted: false,
        completed: false,
      };
      const existing = Array.isArray(email.checklist) ? email.checklist : [];
      updateEmail(email.id!, { checklist: [...existing, newItem] }, true);
    }
    setNewChecklistText('');
  };

  const handleRemoveCheckItem = (itemId: string) => {
    if (task) {
      if (Array.isArray(task.checklist)) {
        const updated = task.checklist.filter((item: any) => item.id !== itemId);
        updateTask(task.id!, { checklist: updated }, true);
      } else {
        removeChecklistItem(task.id!, itemId);
      }
    } else if (email) {
      const updated = (email.checklist || []).filter((item: any) => item.id !== itemId);
      updateEmail(email.id!, { checklist: updated }, true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newEntry = {
      id: `comm_${Date.now()}`,
      author: currentUser?.name || 'Klaus Bauer',
      text: newCommentText.trim(),
      date: new Date().toISOString(),
    };

    if (task) {
      const currentComments = Array.isArray(task.comments) ? task.comments : [];
      updateTask(task.id!, { comments: [newEntry, ...currentComments] }, true);
    } else if (email) {
      const currentComments = Array.isArray(email.comments) ? email.comments : [];
      updateEmail(email.id!, { comments: [newEntry, ...currentComments] }, true);
    }
    setNewCommentText('');
  };

  // Convert email to task
  const handleConvertToTask = () => {
    if (email && email.id) {
      const created = convertEmailToTask(email.id);
      if (created) {
        onClose();
      }
    }
  };

  // Delete card
  const handleDeleteCard = () => {
    if (task && task.id) {
      deleteTask(task.id);
      onClose();
    } else if (email && email.id) {
      deleteEmail(email.id);
      onClose();
    }
  };

  // Navigate to program view
  const handleGoToProgram = () => {
    const pId = task?.programId || email?.programId;
    if (pId) {
      setSelectedProgramId(pId);
      setActiveView('program_detail');
      if (onNavigateToProgram) {
        onNavigateToProgram(pId);
      }
      onClose();
    }
  };

  // Open Full Entity Drawer
  const handleOpenFullEntity = () => {
    if (onOpenEntity && cardType && cardId) {
      onOpenEntity(cardType, cardId);
      onClose();
    }
  };

  // ALL hooks have run unconditionally above. Now early return if not open or no task/email.
  if (!isOpen || (!task && !email)) return null;

  const dueDate = task?.dueDate || task?.endDate || email?.dueDate || email?.deadline;
  const isOverdue = dueDate && dueDate < new Date().toISOString().split('T')[0] && currentColumn !== 'resuelto';
  const priority = (task?.priority || email?.priority || 'media') as PriorityLevel;
  const assignee = task?.responsible || task?.assignedTo || email?.responsible || currentUser.name || 'Referente';
  const category = task?.category || task?.categoryName || email?.type;
  const originLabel = task?.originLabel || task?.origin;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                cardType === 'task'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
              }`}
            >
              {cardType === 'task' ? <CheckSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="w-full text-lg sm:text-xl font-bold bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug"
                  title="Click para editar el título"
                >
                  {cardType === 'task' ? task?.title : email?.subject}
                </h2>
              )}

              {/* Subheader: List, Program tag, Category, Origin */}
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span>en la lista</span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {currentColumn === 'pendiente' && '⏳ 1. Pendiente'}
                  {currentColumn === 'en_ejecucion' && '⚡ 2. En ejecución'}
                  {currentColumn === 'resuelto' && '✅ 3. Resuelto'}
                </span>

                {currentProgram && (
                  <>
                    <span>•</span>
                    <button
                      onClick={handleGoToProgram}
                      className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-xs hover:opacity-85 transition-opacity cursor-pointer text-white shadow-2xs"
                      style={{ backgroundColor: currentProgram.color || '#3b82f6' }}
                      title={`Ver programa ${currentProgram.name}`}
                    >
                      <span>{currentProgram.shortName || currentProgram.code}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </button>
                  </>
                )}

                {category && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                      {category}
                    </span>
                  </>
                )}

                {originLabel && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                      <Link2 className="w-3 h-3" />
                      {originLabel}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenEntity && (
              <button
                onClick={handleOpenFullEntity}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Abrir la ficha lateral completa del registro"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver Ficha Completa</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Content, Description, Checklist, Activity) - 8 cols */}
            <div className="lg:col-span-8 space-y-6">
              {/* Badges / Key Metadata Grid */}
              <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                {/* Miembros / Responsable Sincronizado */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Responsable
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {assignee.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {assignee}
                      </span>
                      {currentProgram?.referente && (
                        <span className="block text-[10px] text-slate-400">
                          {currentProgram.referente}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Programa Asociado */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Programa de Salud
                  </span>
                  <select
                    value={task?.programId || email?.programId || ''}
                    onChange={(e) => handleChangeProgram(e.target.value)}
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.shortName || p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prioridad */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Prioridad
                  </span>
                  <select
                    value={priority}
                    onChange={(e) => handleChangePriority(e.target.value as PriorityLevel)}
                    className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none ${
                      priority === 'critica' || priority === 'urgente'
                        ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-900'
                        : priority === 'alta'
                        ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-900'
                        : priority === 'baja'
                        ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-900'
                    }`}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>

                {/* Fecha de vencimiento */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Vencimiento
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={dueDate || ''}
                      onChange={(e) => handleChangeDueDate(e.target.value)}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none ${
                        isOverdue
                          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-bold'
                          : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {isOverdue && (
                      <span className="text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded-sm">
                        VENCIDA
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Descripción de la actividad
                    </h3>
                  </div>
                  {!isEditingDesc && (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {isEditingDesc ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                      rows={4}
                      placeholder="Escribe detalles, antecedentes o especificaciones sincronizadas..."
                      className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveDesc}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditedDesc(task?.description || email?.body || '');
                          setIsEditingDesc(false);
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    className="min-h-16 p-3.5 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-750 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors whitespace-pre-wrap leading-relaxed"
                  >
                    {editedDesc || (
                      <span className="text-slate-400 italic">
                        Sin descripción aún. Haz click aquí para añadir detalles...
                      </span>
                    )}
                  </div>
                )}

                {/* Additional Program Notes if any */}
                {task?.notes && (
                  <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">
                      📌 Nota técnica del programa:
                    </span>
                    <p className="text-amber-800 dark:text-amber-300">{task.notes}</p>
                  </div>
                )}

                {/* Email specific details if email */}
                {cardType === 'email' && email && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">De / Remitente:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-200 block">
                        {email.sender || email.from || 'Sin remitente'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Para / Destinatario:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-200 block">
                        {email.recipient || email.to || 'Salud Quilicura'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checklist Section */}
              <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Lista de verificación / Subtareas
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {checklistCompleted}/{checklistTotal} ({checklistProgress}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistProgress === 100
                        ? 'bg-emerald-500'
                        : checklistProgress > 50
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>

                {/* Items list */}
                <div className="space-y-1.5 pt-1">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleCheckItem(item.id, item.completed)}
                          className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span
                          className={`text-xs sm:text-sm text-slate-700 dark:text-slate-200 break-words ${
                            item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'
                          }`}
                        >
                          {item.text}
                        </span>
                      </label>
                      <button
                        onClick={() => handleRemoveCheckItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-opacity cursor-pointer"
                        title="Eliminar elemento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add checklist item form */}
                  <form onSubmit={handleAddCheckItem} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="Añadir un elemento a la lista..."
                      className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newChecklistText.trim()}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                    >
                      Añadir
                    </button>
                  </form>
                </div>
              </div>

              {/* Activity & Comments Section */}
              <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Historial de Actividad y Comentarios
                  </h3>
                </div>

                {/* Add comment box */}
                <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {currentUser?.name?.charAt(0) || 'K'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      rows={2}
                      placeholder="Escribe un comentario o actualización..."
                      className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newCommentText.trim()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        Comentar
                      </button>
                    </div>
                  </div>
                </form>

                {/* Comment list */}
                <div className="space-y-3 pt-2">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">
                      Sin comentarios aún. Agrega una nota o registro de avance.
                    </p>
                  ) : (
                    comments.map((c: any) => (
                      <div
                        key={c.id}
                        className={`flex gap-3 text-xs p-3 rounded-xl border ${
                          c.isAudit
                            ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-500'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {c.author?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {c.author}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {c.date ? formatDate(c.date) : ''}
                            </span>
                          </div>
                          <p className="text-xs whitespace-pre-wrap">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar Actions - Trello Style) - 4 cols */}
            <div className="lg:col-span-4 space-y-5">
              {/* Mover a lista */}
              <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Mover a Lista
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => handleChangeColumn('pendiente')}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentColumn === 'pendiente'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 ring-2 ring-amber-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>⏳ 1. Pendiente</span>
                    {currentColumn === 'pendiente' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>

                  <button
                    onClick={() => handleChangeColumn('en_ejecucion')}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentColumn === 'en_ejecucion'
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 ring-2 ring-blue-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>⚡ 2. En ejecución</span>
                    {currentColumn === 'en_ejecucion' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleChangeColumn('resuelto')}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentColumn === 'resuelto'
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 ring-2 ring-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>✅ 3. Resuelto</span>
                    {currentColumn === 'resuelto' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              </div>

              {/* Acciones principales */}
              <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Acciones Rápidas
                </span>

                {cardType === 'email' && (
                  <button
                    onClick={handleConvertToTask}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Convertir en Tarea
                  </button>
                )}

                <button
                  onClick={handleGoToProgram}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver en el Programa
                </button>

                {onOpenEntity && (
                  <button
                    onClick={handleOpenFullEntity}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Abrir Ficha Completa
                  </button>
                )}
              </div>

              {/* Eliminar Tarjeta */}
              <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
                  Zona de peligro
                </span>
                {confirmDelete ? (
                  <div className="space-y-2">
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      ¿Seguro que deseas eliminar esta {cardType === 'task' ? 'tarea' : 'correo'}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteCard}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200 dark:border-rose-900"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar {cardType === 'task' ? 'Tarea' : 'Correo'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
