import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  KnowledgeItem,
  KnowledgeCategory,
  KnowledgeStatus,
  KnowledgeHistoryEntry,
  KnowledgeAttachment,
  ProgramId,
  isKnowledgeReviewPending,
  getKnowledgeStatusLabel,
  isOfficialKnowledgeSource,
} from '../../types';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { ProgramMultiSelect } from '../common/ProgramMultiSelect';
import { DrawerEntityType } from '../common/EntityDrawer';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  Star,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  Copy,
  Trash2,
  Edit,
  History,
  Tag,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Paperclip,
  Check,
  X,
  Layers,
  HelpCircle,
  Users,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
  Bookmark,
  Share2,
  Building,
  Globe,
  Archive,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeft,
} from 'lucide-react';

interface ConocimientoViewProps {
  programId?: ProgramId; // If provided, scoped to this program
  onOpenEntity?: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate?: (tab?: string) => void;
}

export const ConocimientoView: React.FC<ConocimientoViewProps> = ({
  programId,
  onOpenEntity,
}) => {
  const {
    knowledge,
    knowledgeCategories,
    knowledgeSources,
    programs,
    currentUser,
    addKnowledge,
    updateKnowledge,
    togglePinKnowledge,
    deleteKnowledge,
    restoreKnowledge,
    permanentlyDeleteKnowledge,
    addKnowledgeCategory,
    addKnowledgeSource,
    showToast,
    setSelectedProgramId,
    setActiveView,
  } = useApp();

  const todayStr = '2026-08-15';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<
    'all' | 'destacados' | 'criterios' | 'procedimientos' | 'administrativos' | 'revision' | 'obsoletos' | 'papelera'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>(programId || 'all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Modals state
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [historyItem, setHistoryItem] = useState<KnowledgeItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<KnowledgeItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Form State for Create / Edit Modal
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('Criterio técnico');
  const [formStatus, setFormStatus] = useState<KnowledgeStatus>('vigente');
  const [formSource, setFormSource] = useState('Experiencia operativa');
  const [formSourceRef, setFormSourceRef] = useState('');
  const [formReviewDate, setFormReviewDate] = useState('');
  const [formProgramIds, setFormProgramIds] = useState<(ProgramId | string)[]>(programId ? [programId] : []);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formAttachments, setFormAttachments] = useState<KnowledgeAttachment[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Category creation inline
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewSourceInput, setShowNewSourceInput] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
    setFormCategory(knowledgeCategories[0] || 'Criterio técnico');
    setFormStatus('vigente');
    setFormSource(knowledgeSources[0] || 'Experiencia operativa');
    setFormSourceRef('');
    setFormReviewDate('');
    setFormProgramIds(programId ? [programId] : []);
    setFormTags([]);
    setTagInput('');
    setFormIsPinned(false);
    setFormAttachments([]);
    setEditingItem(null);
    setIsCreatingNew(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSummary(item.summary || '');
    setFormContent(item.content);
    setFormCategory(item.category || 'Criterio técnico');
    setFormStatus(item.status || 'vigente');
    setFormSource(item.source || 'Experiencia operativa');
    setFormSourceRef(item.sourceReference || '');
    setFormReviewDate(item.reviewBeforeDate || '');
    setFormProgramIds(
      item.programIds && item.programIds.length > 0
        ? item.programIds
        : item.programId
        ? [item.programId]
        : []
    );
    setFormTags(item.tags || []);
    setTagInput('');
    setFormIsPinned(Boolean(item.isPinned || item.isFeatured));
    setFormAttachments(item.attachments || []);
    setIsCreatingNew(true);
  };

  // Save (Create or Update)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Por favor ingrese un título y el contenido del conocimiento', 'error');
      return;
    }

    if (editingItem) {
      updateKnowledge(editingItem.id, {
        title: formTitle.trim(),
        summary: formSummary.trim() || undefined,
        content: formContent.trim(),
        category: formCategory,
        status: formStatus,
        source: formSource,
        sourceReference: formSourceRef.trim() || undefined,
        reviewBeforeDate: formReviewDate || undefined,
        programIds: formProgramIds,
        tags: formTags,
        isPinned: formIsPinned,
        isFeatured: formIsPinned,
        attachments: formAttachments,
      });
    } else {
      addKnowledge({
        title: formTitle.trim(),
        summary: formSummary.trim() || undefined,
        content: formContent.trim(),
        category: formCategory,
        status: formStatus,
        source: formSource,
        sourceReference: formSourceRef.trim() || undefined,
        reviewBeforeDate: formReviewDate || undefined,
        programIds: formProgramIds,
        tags: formTags,
        isPinned: formIsPinned,
        isFeatured: formIsPinned,
        author: currentUser.name,
        attachments: formAttachments,
      });
    }

    setIsCreatingNew(false);
    setEditingItem(null);
  };

  // Add Tag
  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !formTags.includes(clean)) {
      setFormTags([...formTags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  // Add Attachment
  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) return;
    const newAtt: KnowledgeAttachment = {
      id: `katt_${Date.now()}`,
      name: newAttachmentName.trim(),
      size: '1.2 MB',
      type: 'documento',
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.name,
    };
    setFormAttachments([...formAttachments, newAtt]);
    setNewAttachmentName('');
  };

  const handleRemoveAttachment = (attId: string) => {
    setFormAttachments(formAttachments.filter((a) => a.id !== attId));
  };

  // Copy Knowledge Content
  const handleCopyContent = (item: KnowledgeItem) => {
    const textToCopy = `[${item.category.toUpperCase()}] ${item.title}\n\n${item.summary ? `Resumen: ${item.summary}\n\n` : ''}${item.content}\n\nFuente: ${item.source}${item.sourceReference ? ` (${item.sourceReference})` : ''}\nEstado: ${item.status.toUpperCase()}`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Contenido copiado al portapapeles', 'info');
  };

  // Delete Confirmation with "OK"
  const handleConfirmDelete = () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'OK') {
      showToast('Debe escribir OK para confirmar la eliminación', 'error');
      return;
    }
    if (deletingItem) {
      deleteKnowledge(deletingItem.id);
      setDeletingItem(null);
      setDeleteConfirmText('');
    }
  };

  // Filtered Knowledge calculation
  const filteredKnowledge = useMemo(() => {
    return knowledge.filter((item) => {
      const isArchived = Boolean(item.archived);

      // Trash quick filter check
      if (quickFilter === 'papelera') {
        return isArchived;
      }

      // Normal filters ignore archived items
      if (isArchived) return false;

      // Program filter (scope or selector)
      const targetProg = programId || (selectedProgramFilter !== 'all' ? selectedProgramFilter : null);
      if (targetProg) {
        const itemPrograms = item.programIds || (item.programId ? [item.programId] : []);
        const isTransversal = itemPrograms.length === 0 || itemPrograms.includes('all');
        const matchesProgram = isTransversal || itemPrograms.includes(targetProg);
        if (!matchesProgram) return false;
      }

      // Quick filter
      if (quickFilter === 'destacados' && !(item.isPinned || item.isFeatured)) return false;
      if (quickFilter === 'criterios' && item.category !== 'Criterio técnico') return false;
      if (quickFilter === 'procedimientos' && item.category !== 'Procedimiento / Flujo') return false;
      if (quickFilter === 'administrativos' && item.category !== 'Requisito administrativo') return false;
      if (quickFilter === 'revision' && !isKnowledgeReviewPending(item, todayStr)) return false;
      if (quickFilter === 'obsoletos' && item.status !== 'obsoleto') return false;

      // Secondary dropdown filters
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedSource !== 'all' && item.source !== selectedSource) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (selectedTagFilter && !(item.tags || []).includes(selectedTagFilter)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSummary = (item.summary || '').toLowerCase().includes(q);
        const inContent = item.content.toLowerCase().includes(q);
        const inCategory = (item.category || '').toLowerCase().includes(q);
        const inSource = (item.source || '').toLowerCase().includes(q);
        const inRef = (item.sourceReference || '').toLowerCase().includes(q);
        const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inContent && !inCategory && !inSource && !inRef && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [
    knowledge,
    programId,
    quickFilter,
    selectedCategory,
    selectedSource,
    selectedStatus,
    selectedProgramFilter,
    selectedTagFilter,
    searchQuery,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const active = knowledge.filter((k) => !k.archived);
    const pendingReview = active.filter((k) => isKnowledgeReviewPending(k, todayStr)).length;
    const featured = active.filter((k) => k.isPinned || k.isFeatured).length;
    const archived = knowledge.filter((k) => k.archived).length;
    const obsolete = active.filter((k) => k.status === 'obsoleto').length;
    return {
      total: active.length,
      featured,
      pendingReview,
      obsolete,
      archived,
    };
  }, [knowledge]);

  const currentProgramObj = programId ? programs.find((p) => p.id === programId) : null;

  return (
    <div className="space-y-4">
      {/* 1. TOP ACTION / HERO */}
      {programId ? (
        <div className="flex items-center justify-end pb-1">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo Conocimiento
          </button>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-40 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5" />
                  Base de Conocimiento
                </span>
                {currentProgramObj && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-semibold">
                    Programa: {currentProgramObj.shortName || currentProgramObj.name}
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Base de Conocimiento y Criterios Operativos
              </h1>

              <p className="text-xs md:text-sm text-indigo-100/90 font-medium italic leading-relaxed">
                &ldquo;¿Qué necesito recordar o consultar para gestionar correctamente este programa?&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSelectedProgramId(null);
                  setActiveView('dashboard');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
                title="Volver al Dashboard"
              >
                <ArrowLeft className="h-4 w-4 text-indigo-200" />
                <span>Volver</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Nuevo Conocimiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATS & QUICK FILTER PILLS (Image 4 style) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setQuickFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            quickFilter === 'all'
              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Total Vigentes ({stats.total})</span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter('destacados')}
          className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            quickFilter === 'destacados'
              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${quickFilter === 'destacados' ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'}`} />
          <span>Destacados ({stats.featured})</span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter('revision')}
          className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            quickFilter === 'revision'
              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
              : stats.pendingReview > 0
              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-medium hover:bg-rose-100'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
          }`}
        >
          <AlertTriangle className={`h-3.5 w-3.5 ${quickFilter === 'revision' ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
          <span>Revisión Pendiente ({stats.pendingReview})</span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter('papelera')}
          className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            quickFilter === 'papelera'
              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          <span>Papelera / Archivados ({stats.archived})</span>
        </button>
      </div>

      {/* 3. SEARCH & FILTERS SECTION */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
        {/* Row 1: Search input and quick tag filters */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, indicación, norma, etiqueta (#), fuente..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setQuickFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                quickFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('criterios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                quickFilter === 'criterios'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Criterios Técnicos
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('procedimientos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                quickFilter === 'procedimientos'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Procedimientos
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('administrativos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                quickFilter === 'administrativos'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Administrativos
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('obsoletos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                quickFilter === 'obsoletos'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Obsoletos
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-semibold shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
            <span>Filtros:</span>
          </div>

          {/* Program filter (if not scoped to one program) */}
          {!programId && (
            <select
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Todos los programas</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.shortName || p.name}
                </option>
              ))}
            </select>
          )}

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {knowledgeCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Source Dropdown */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Todas las fuentes</option>
            {knowledgeSources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Cualquier estado</option>
            <option value="vigente">Vigente</option>
            <option value="en_revision">En Revisión</option>
            <option value="obsoleto">Obsoleto</option>
          </select>

          {/* Active Tag indicator */}
          {selectedTagFilter && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-semibold">
              <Tag className="h-3 w-3" />
              <span>#{selectedTagFilter}</span>
              <button
                type="button"
                onClick={() => setSelectedTagFilter(null)}
                className="hover:text-indigo-950 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Reset Filters button */}
          {(searchQuery ||
            quickFilter !== 'all' ||
            selectedCategory !== 'all' ||
            selectedSource !== 'all' ||
            selectedStatus !== 'all' ||
            (!programId && selectedProgramFilter !== 'all') ||
            selectedTagFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setQuickFilter('all');
                setSelectedCategory('all');
                setSelectedSource('all');
                setSelectedStatus('all');
                setSelectedProgramFilter(programId || 'all');
                setSelectedTagFilter(null);
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline ml-auto cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* 4. KNOWLEDGE CARDS LIST / GRID */}
      {filteredKnowledge.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {quickFilter === 'papelera'
              ? 'No hay registros archivados en la papelera'
              : 'No se encontraron conocimientos con los filtros aplicados'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {quickFilter === 'papelera'
              ? 'Los elementos eliminados se guardan aquí para trazabilidad y pueden ser restaurados.'
              : 'Intente buscar con otros términos o agregue un nuevo criterio técnico u operativo para este programa.'}
          </p>
          {quickFilter !== 'papelera' && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer mt-2"
            >
              <Plus className="h-4 w-4" />
              Crear Nuevo Conocimiento
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKnowledge.map((item) => {
            const isReviewPending = isKnowledgeReviewPending(item, todayStr);
            const statusConf = getKnowledgeStatusLabel(item.status);
            const isOfficial = isOfficialKnowledgeSource(item.source);
            const itemPrograms = item.programIds || (item.programId ? [item.programId] : []);
            const isTransversal = itemPrograms.length === 0 || itemPrograms.includes('all');

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative ${
                  item.archived
                    ? 'bg-slate-50/80 border-slate-300 opacity-80'
                    : item.status === 'obsoleto'
                    ? 'bg-slate-50/90 border-slate-200'
                    : item.isPinned || item.isFeatured
                    ? 'bg-amber-50/20 border-amber-300 shadow-sm ring-1 ring-amber-200/50'
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                {/* Review Pending Highlight Banner */}
                {isReviewPending && (
                  <div className="p-2.5 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-950 text-xs font-bold flex items-center justify-between gap-2 animate-pulse">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                      ⚠ REVISIÓN PENDIENTE (Fecha límite: {formatDate(item.reviewBeforeDate!)})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                    >
                      Actualizar
                    </button>
                  </div>
                )}

                {/* Card Top Section: Badges and Pin button */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Status badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                      >
                        {statusConf.label}
                      </span>

                      {/* Category Badge */}
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.category}
                      </span>

                      {/* Source badge (Official vs Operational) */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                          isOfficial
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                        title={item.sourceReference || item.source}
                      >
                        {isOfficial ? <ShieldCheck className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                        <span>{item.source}</span>
                      </span>
                    </div>

                    {/* Star Pin Button */}
                    {!item.archived && (
                      <button
                        type="button"
                        onClick={() => togglePinKnowledge(item.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          item.isPinned || item.isFeatured
                            ? 'bg-amber-100 border-amber-300 text-amber-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                        }`}
                        title={item.isPinned ? 'Desmarcar destacado' : 'Marcar como destacado'}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            item.isPinned || item.isFeatured ? 'fill-amber-500 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => handleOpenEdit(item)}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors leading-snug"
                  >
                    {item.title}
                  </h3>

                  {/* Summary / Brief */}
                  {item.summary && (
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      {item.summary}
                    </p>
                  )}

                  {/* Main Content / Indications */}
                  <div className="text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-line pl-0.5">
                    {item.content}
                  </div>

                  {/* Source Reference Note */}
                  {item.sourceReference && (
                    <div className="text-[11px] text-slate-500 italic flex items-center gap-1.5 pt-1">
                      <Bookmark className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>Ref: {item.sourceReference}</span>
                    </div>
                  )}

                  {/* Origin Links (Bridge to Question or Meeting) */}
                  {(item.originQuestionId || item.originMeetingId) && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                      {item.originQuestionId && onOpenEntity && (
                        <button
                          type="button"
                          onClick={() => onOpenEntity('question', item.originQuestionId!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 text-[11px] transition-colors cursor-pointer"
                        >
                          <HelpCircle className="h-3 w-3" />
                          <span>Ver consulta de origen</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}

                      {item.originMeetingId && onOpenEntity && (
                        <button
                          type="button"
                          onClick={() => onOpenEntity('meeting', item.originMeetingId!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 text-[11px] transition-colors cursor-pointer"
                        >
                          <Users className="h-3 w-3" />
                          <span>Ver reunión de origen</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Attachments Section */}
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        <span>Adjuntos ({item.attachments.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors"
                          >
                            <FileText className="h-3 w-3 text-indigo-600" />
                            <span className="truncate max-w-[180px]">{att.name}</span>
                            {att.size && <span className="text-slate-400">({att.size})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags Chips */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                      {item.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTagFilter(tag)}
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                            selectedTagFilter === tag
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`}
                        >
                          <span>#{tag}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom Meta & Actions Bar */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                  {/* Meta: Program tags and Author/Date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-600">Aplica a:</span>
                      {isTransversal ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          🌐 Transversal
                        </span>
                      ) : (
                        itemPrograms.map((progId) => {
                          const p = programs.find((pr) => pr.id === progId);
                          return (
                            <span
                              key={progId}
                              className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold text-[10px]"
                            >
                              {p?.shortName || progId}
                            </span>
                          );
                        })
                      )}
                    </div>

                    <div className="text-slate-400">
                      Por {item.author || 'Equipo'} • {formatDate(item.createdAt)}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyContent(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Copiar contenido al portapapeles"
                      >
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        <span>Copiar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHistoryItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Ver bitácora de cambios y auditoría"
                      >
                        <History className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Historial</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.archived ? (
                        <>
                          <button
                            type="button"
                            onClick={() => restoreKnowledge(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 text-xs transition-colors cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Restaurar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => permanentlyDeleteKnowledge(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 text-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Purgar</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingItem(item);
                              setDeleteConfirmText('');
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Archivar / Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. CREATE / EDIT MODAL */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Editar Conocimiento / Criterio' : 'Nuevo Criterio Operativo / Conocimiento'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registre pautas técnicas, flujos, recordatorios o aprendizajes clave.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingItem(null);
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveForm} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Título */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Título del Conocimiento *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="ej. Flujograma para Notificación y Titulación de Opioides Mayores"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              {/* Resumen Breve */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Resumen Breve (1-2 líneas)
                </label>
                <input
                  type="text"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="ej. Pasos obligatorios para la prescripción y seguimiento domiciliario de opioides..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Contenido / Indicaciones */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Contenido / Indicaciones Operativas Detalladas *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Escriba los criterios, pasos secuenciales, excepciones o indicaciones técnicas..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Grid: Categoría, Estado, Fuente, Fecha de Revisión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {/* Categoría */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold">Categoría *</label>
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput(!showNewCatInput)}
                      className="text-[11px] text-indigo-600 font-semibold hover:underline"
                    >
                      + Crear categoría
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800"
                  >
                    {knowledgeCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Inline Add Category */}
                  {showNewCatInput && (
                    <div className="flex gap-1.5 mt-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nombre nueva categoría..."
                        className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addKnowledgeCategory(newCategoryName);
                          setFormCategory(newCategoryName.trim());
                          setNewCategoryName('');
                          setShowNewCatInput(false);
                        }}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded text-xs font-bold"
                      >
                        Crear
                      </button>
                    </div>
                  )}
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Estado de Vigencia *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as KnowledgeStatus)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="vigente">✅ Vigente</option>
                    <option value="en_revision">⏳ En Revisión</option>
                    <option value="obsoleto">🗄️ Obsoleto</option>
                  </select>
                </div>

                {/* Fuente */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold">Fuente del Conocimiento *</label>
                    <button
                      type="button"
                      onClick={() => setShowNewSourceInput(!showNewSourceInput)}
                      className="text-[11px] text-indigo-600 font-semibold hover:underline"
                    >
                      + Crear fuente
                    </button>
                  </div>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800"
                  >
                    {knowledgeSources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {/* Inline Add Source */}
                  {showNewSourceInput && (
                    <div className="flex gap-1.5 mt-2">
                      <input
                        type="text"
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        placeholder="Nombre nueva fuente..."
                        className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addKnowledgeSource(newSourceName);
                          setFormSource(newSourceName.trim());
                          setNewSourceName('');
                          setShowNewSourceInput(false);
                        }}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded text-xs font-bold"
                      >
                        Crear
                      </button>
                    </div>
                  )}
                </div>

                {/* Fecha de Revisión Límite */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Revisar antes de (Vigencia recomendada)
                  </label>
                  <input
                    type="date"
                    value={formReviewDate}
                    onChange={(e) => setFormReviewDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                  />
                </div>

                {/* Referencia de respaldo */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Referencia / Documento / Enlace de Respaldo
                  </label>
                  <input
                    type="text"
                    value={formSourceRef}
                    onChange={(e) => setFormSourceRef(e.target.value)}
                    placeholder="ej. Orientación Técnica MINSAL 2026 / Oficio Circular N° 142..."
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Aplica a (Programas) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Aplica a (Programas de Salud):
                </label>
                <ProgramMultiSelect
                  selectedProgramIds={formProgramIds}
                  onChange={setFormProgramIds}
                  allowAllOption={true}
                />
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Etiquetas (#Tags)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Agregar tag (ej. Opioides, Rendición)..."
                    className="flex-1 rounded-lg border border-slate-300 p-2 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
                  >
                    Agregar Tag
                  </button>
                </div>

                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 text-xs"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-600 ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-slate-700 font-bold">
                  Documentos y Archivos Adjuntos ({formAttachments.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    placeholder="Nombre del archivo adjunto (ej. Pauta_Criterio_Tecnico.pdf)..."
                    className="flex-1 rounded-lg border border-slate-300 p-2 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    disabled={!newAttachmentName.trim()}
                    className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 disabled:opacity-50"
                  >
                    Adjuntar
                  </button>
                </div>

                {formAttachments.length > 0 && (
                  <div className="space-y-1">
                    {formAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                          <span className="text-[10px] text-slate-400">({att.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destacado Toggle */}
              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    Marcar como Conocimiento Destacado (Fijar en el tope)
                  </span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {editingItem ? 'Guardar Cambios' : 'Crear Conocimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. HISTORY / BITÁCORA MODAL */}
      {historyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden my-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Historial y Auditoría de Cambios</h3>
                  <p className="text-xs text-slate-500 truncate max-w-sm">{historyItem.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryItem(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              {historyItem.history && historyItem.history.length > 0 ? (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                  {historyItem.history.map((hist) => (
                    <div key={hist.id} className="relative flex items-start gap-3 pl-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 z-10 shadow-xs">
                        ✓
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800">{hist.action}</span>
                          <span className="text-[10px] text-slate-400">{formatDateTime(hist.date)}</span>
                        </div>
                        <p className="text-slate-600">{hist.details || 'Sin detalles adicionales'}</p>
                        <div className="text-[10px] text-slate-400">
                          Usuario: <strong className="text-slate-600">{hist.user}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-6 italic">
                  Sin registros previos en la bitácora de este conocimiento.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryItem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SOFT DELETE CONFIRMATION MODAL WITH "OK" */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-md p-6 space-y-4 my-auto">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirmar Eliminación Lógica</h3>
                <p className="text-xs text-slate-500">Trazabilidad y seguridad de la información</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Está a punto de archivar el conocimiento{' '}
              <strong className="text-slate-900">&ldquo;{deletingItem.title}&rdquo;</strong>. Para evitar
              borrados accidentales y garantizar la trazabilidad, escriba{' '}
              <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                OK
              </span>{' '}
              a continuación:
            </p>

            <div>
              <input
                type="text"
                autoFocus
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && deleteConfirmText.trim().toUpperCase() === 'OK') {
                    e.preventDefault();
                    handleConfirmDelete();
                  }
                }}
                placeholder="Escriba OK para confirmar..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-rose-500 uppercase tracking-widest text-center"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingItem(null);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText.trim().toUpperCase() !== 'OK'}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                Archivar Conocimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
