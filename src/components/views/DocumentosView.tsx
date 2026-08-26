import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord, DocumentVersion, ProgramId, getDocumentEffectiveStatus } from '../../types';
import {
  FileText,
  Search,
  Plus,
  Download,
  Filter,
  Check,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Tag,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  LayoutGrid,
  Table as TableIcon,
  Upload,
  History,
  ShieldCheck,
  FileSpreadsheet,
  FileCheck,
  Calendar,
  Eye,
  Paperclip,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface DocumentosViewProps {
  scopedProgramId?: ProgramId | null;
  onOpenEntity?: (type: any, id: string) => void;
}

export const DocumentosView: React.FC<DocumentosViewProps> = ({
  scopedProgramId = null,
}) => {
  const {
    documents,
    documentCategories,
    programs,
    currentUser,
    addDocument,
    updateDocument,
    deleteDocument,
    addDocumentVersion,
    addDocumentCategory,
    exportTableCSV,
    showToast,
    setSelectedProgramId,
    setActiveView,
  } = useApp();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedValidityFilter, setSelectedValidityFilter] = useState<string>('all');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>(
    scopedProgramId || 'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State: Create / Edit Document
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);

  // Modal State: New Version Upload
  const [versionModalDoc, setVersionModalDoc] = useState<DocumentRecord | null>(null);
  const [newVersionData, setNewVersionData] = useState({
    versionNumber: '',
    fileName: '',
    fileSize: '1.8 MB',
    notes: '',
  });

  // Drawer State: View Version History
  const [historyDoc, setHistoryDoc] = useState<DocumentRecord | null>(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Inline Category creation & modal
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [modalNewCatInput, setModalNewCatInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: documentCategories[0] || 'Convenios y Resoluciones',
    description: '',
    programIds: scopedProgramId ? [scopedProgramId] : ([] as ProgramId[]),
    version: 'v1.0',
    documentDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    documentType: 'PDF' as 'PDF' | 'EXCEL' | 'WORD' | 'OTRO',
    confidentiality: 'Público' as 'Público' | 'Interno' | 'Confidencial',
    fileName: '',
    fileSize: '1.4 MB',
    tags: [] as string[],
    tagInput: '',
  });

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      category: documentCategories[0] || 'Convenios y Resoluciones',
      description: '',
      programIds: scopedProgramId ? [scopedProgramId] : [],
      version: 'v1.0',
      documentDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      documentType: 'PDF',
      confidentiality: 'Público',
      fileName: 'documento_oficial.pdf',
      fileSize: '1.4 MB',
      tags: [],
      tagInput: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: DocumentRecord) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      category: doc.category,
      description: doc.description || '',
      programIds: doc.programIds || [],
      version: doc.version || 'v1.0',
      documentDate: doc.documentDate || doc.uploadDate,
      expiryDate: doc.expiryDate || '',
      documentType: (doc.documentType as any) || 'PDF',
      confidentiality: (doc.confidentiality as any) || 'Público',
      fileName: doc.fileName,
      fileSize: doc.fileSize || '1.4 MB',
      tags: doc.tags || [],
      tagInput: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Por favor ingrese el título del documento', 'error');
      return;
    }

    if (editingDoc) {
      updateDocument(editingDoc.id, {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim() || undefined,
        programIds: formData.programIds,
        version: formData.version.trim() || 'v1.0',
        documentDate: formData.documentDate,
        expiryDate: formData.expiryDate.trim() || undefined,
        documentType: formData.documentType,
        confidentiality: formData.confidentiality,
        fileName: formData.fileName.trim() || 'documento.pdf',
        fileSize: formData.fileSize,
        tags: formData.tags,
      });
    } else {
      addDocument({
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim() || undefined,
        programIds: formData.programIds,
        version: formData.version.trim() || 'v1.0',
        documentDate: formData.documentDate,
        expiryDate: formData.expiryDate.trim() || undefined,
        documentType: formData.documentType,
        confidentiality: formData.confidentiality,
        fileName: formData.fileName.trim() || 'documento.pdf',
        fileSize: formData.fileSize,
        tags: formData.tags,
      });
    }

    setIsModalOpen(false);
  };

  const handleAddTag = () => {
    const trimmed = formData.tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
        tagInput: '',
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleOpenVersionModal = (doc: DocumentRecord) => {
    setVersionModalDoc(doc);
    // Suggest next minor version (e.g., v1.0 -> v1.1)
    const curVer = doc.version || 'v1.0';
    const match = curVer.match(/v?(\d+)\.?(\d+)?/i);
    let nextVer = 'v2.0';
    if (match) {
      const major = parseInt(match[1] || '1', 10);
      const minor = parseInt(match[2] || '0', 10);
      nextVer = `v${major}.${minor + 1}`;
    }

    setNewVersionData({
      versionNumber: nextVer,
      fileName: `actualizado_${doc.fileName}`,
      fileSize: '1.9 MB',
      notes: '',
    });
  };

  const handleSaveNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionModalDoc) return;
    if (!newVersionData.versionNumber.trim()) {
      showToast('Ingrese el número de versión', 'error');
      return;
    }

    addDocumentVersion(versionModalDoc.id, {
      versionNumber: newVersionData.versionNumber.trim(),
      fileName: newVersionData.fileName.trim() || versionModalDoc.fileName,
      fileSize: newVersionData.fileSize,
      notes: newVersionData.notes.trim() || undefined,
      uploadedBy: currentUser.name,
    });

    setVersionModalDoc(null);
  };

  const handleAddCategoryInline = () => {
    if (!newCatInput.trim()) return;
    addDocumentCategory(newCatInput.trim());
    setFormData((prev) => ({ ...prev, category: newCatInput.trim() }));
    setNewCatInput('');
    setShowNewCatInput(false);
  };

  const handleCreateCategoryFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = modalNewCatInput.trim();
    if (!trimmed) {
      showToast('Por favor ingrese el nombre de la categoría', 'warning');
      return;
    }
    addDocumentCategory(trimmed);
    setSelectedCategory(trimmed);
    setModalNewCatInput('');
    setIsAddCatModalOpen(false);
  };

  const toggleProgramInForm = (pId: ProgramId) => {
    setFormData((prev) => {
      const exists = prev.programIds.includes(pId);
      return {
        ...prev,
        programIds: exists
          ? prev.programIds.filter((id) => id !== pId)
          : [...prev.programIds, pId],
      };
    });
  };

  const handleDownload = (doc: DocumentRecord) => {
    showToast(`Descargando "${doc.fileName}" (${doc.version || 'v1.0'})...`, 'success');
  };

  // Base documents for currently selected program & validity (to compute category chip counts)
  const baseDocsForProgram = useMemo(() => {
    return documents.filter((doc) => {
      if (doc.archived) return false;

      // Program filter
      if (scopedProgramId) {
        if (doc.programIds.length > 0 && !doc.programIds.includes(scopedProgramId)) {
          return false;
        }
      } else if (selectedProgramFilter !== 'all') {
        if (selectedProgramFilter === 'transversal') {
          if (doc.programIds.length > 0) return false;
        } else if (!doc.programIds.includes(selectedProgramFilter)) {
          return false;
        }
      }

      // Validity status filter
      const effStatus = getDocumentEffectiveStatus(doc);
      if (selectedValidityFilter !== 'all' && effStatus.status !== selectedValidityFilter) {
        return false;
      }

      return true;
    });
  }, [
    documents,
    scopedProgramId,
    selectedProgramFilter,
    selectedValidityFilter,
  ]);

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return baseDocsForProgram.filter((doc) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if ((doc.category || doc.documentType) !== selectedCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullTxt = `${doc.title} ${doc.description || ''} ${doc.category || ''} ${doc.documentType || ''} ${doc.fileName} ${doc.version || ''} ${doc.tags?.join(' ') || ''}`.toLowerCase();
        const matchedPrograms = doc.programIds.some((pId) => {
          const prog = programs.find((p) => p.id === pId);
          return prog ? (prog.shortName.toLowerCase().includes(q) || prog.name.toLowerCase().includes(q)) : false;
        });
        if (!fullTxt.includes(q) && !matchedPrograms) {
          return false;
        }
      }

      return true;
    });
  }, [
    baseDocsForProgram,
    selectedCategory,
    searchQuery,
    programs,
  ]);

  // Validity Counts
  const activeDocs = documents.filter((d) => !d.archived);
  const totalCount = activeDocs.length;
  const getDocInitials = (doc: DocumentRecord) => {
    const words = (doc.title || '')
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0 && !['de', 'del', 'la', 'el', 'los', 'las', 'en', 'y', 'a', 'para', 'por', 'un', 'una'].includes(w.toLowerCase()));
    
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    if (words.length === 1 && words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    }
    if (doc.category) {
      const catWords = doc.category.split(/\s+/).filter(Boolean);
      if (catWords.length >= 2) return `${catWords[0][0]}${catWords[1][0]}`.toUpperCase();
      if (catWords[0]?.length >= 2) return catWords[0].substring(0, 2).toUpperCase();
    }
    return (doc.documentType || 'DC').substring(0, 2).toUpperCase();
  };

  const countVigente = activeDocs.filter((d) => getDocumentEffectiveStatus(d).status === 'vigente').length;
  const countPorRevisar = activeDocs.filter((d) => getDocumentEffectiveStatus(d).status === 'por_revisar').length;
  const countVencido = activeDocs.filter((d) => getDocumentEffectiveStatus(d).status === 'vencido').length;

  return (
    <div id="view-documentos" className="space-y-4 text-left animate-in fade-in duration-150">
      {/* Search & Action Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 justify-between">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="input-search-docs"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, categoría, tags, versión, archivo..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Controls & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Program Dropdown (if not scoped) */}
            {!scopedProgramId && (
              <select
                id="select-filter-docs-program"
                value={selectedProgramFilter}
                onChange={(e) => {
                  setSelectedProgramFilter(e.target.value);
                  setSelectedCategory('all');
                }}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">Todos los programas</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.shortName}
                  </option>
                ))}
              </select>
            )}

            {/* Category Dropdown */}
            <select
              id="select-filter-docs-category"
              value={selectedCategory}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setModalNewCatInput('');
                  setIsAddCatModalOpen(true);
                } else {
                  setSelectedCategory(e.target.value);
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">
                Todas las categorías ({baseDocsForProgram.length})
              </option>
              {documentCategories.map((cat) => {
                const count = baseDocsForProgram.filter(
                  (d) => (d.category || d.documentType) === cat
                ).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
              <option value="__add_new__" className="text-indigo-600 font-bold bg-indigo-50">
                + Agregar categoría...
              </option>
            </select>

            {/* Validity Dropdown */}
            <select
              id="select-filter-docs-validity"
              value={selectedValidityFilter}
              onChange={(e) => setSelectedValidityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Todos los estados ({activeDocs.length})</option>
              <option value="vigente">🟢 Vigentes ({countVigente})</option>
              <option value="por_revisar">🟡 Por vencer (≤30d) ({countPorRevisar})</option>
              <option value="vencido">🔴 Vencidos ({countVencido})</option>
              <option value="historico">⚪ Histórico</option>
            </select>

            {/* Volver Button (when viewing global docs) */}
            {!scopedProgramId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProgramId(null);
                  setActiveView('dashboard');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer border border-slate-300 shadow-2xs active:scale-95 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                title="Volver al Dashboard"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Volver</span>
              </button>
            )}

            {/* Export CSV Button */}
            <button
              id="btn-export-docs-csv"
              type="button"
              onClick={() => exportTableCSV('documents', scopedProgramId)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer border border-slate-200 shadow-2xs"
              title="Exportar listado a CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {/* Add Document Button */}
            <button
              id="btn-new-document"
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/25"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No se encontraron documentos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' || selectedValidityFilter !== 'all'
              ? 'Prueba modificando tus filtros o término de búsqueda.'
              : 'Aún no hay documentos en el repositorio. Comienza registrando los convenios y resoluciones de tu programa.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Primer Documento</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const effStatus = getDocumentEffectiveStatus(doc);
            const associatedProgs = doc.programIds
              .map((pId) => programs.find((p) => p.id === pId))
              .filter(Boolean);

            const statusBadges = {
              vigente: {
                label: 'Vigente',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: CheckCircle2,
              },
              por_revisar: {
                label: 'Por Vencer',
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Clock,
              },
              vencido: {
                label: 'Vencido',
                color: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
                icon: AlertTriangle,
              },
              historico: {
                label: 'Histórico',
                color: 'bg-slate-100 text-slate-600 border-slate-200',
                icon: History,
              },
            };

            const currentBadge = statusBadges[effStatus.status] || statusBadges.vigente;
            const StatusIcon = currentBadge.icon;

            return (
              <div
                key={doc.id}
                id={`doc-card-${doc.id}`}
                className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Top: Avatar + Title + Validity Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold text-sm shadow-2xs">
                        {getDocInitials(doc)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-indigo-700 font-semibold truncate flex items-center gap-1">
                          <FileText className="h-3 w-3 shrink-0" />
                          <span className="truncate">{doc.fileName}</span>
                          <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-100 shrink-0">
                            {doc.version || 'v1.0'}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{doc.documentDate || doc.uploadDate}</span>
                          {doc.fileSize && <span>• {doc.fileSize}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Validity Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border shrink-0 ${currentBadge.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      <span>{currentBadge.label}</span>
                    </span>
                  </div>

                  {/* Category Pill + Confidentiality */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                      <Tag className="h-2.5 w-2.5 text-slate-400" />
                      {doc.category || doc.documentType}
                    </span>
                    {doc.confidentiality && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                        {doc.confidentiality}
                      </span>
                    )}
                  </div>

                  {/* Description if present */}
                  {doc.description && (
                    <div className="text-xs text-slate-600 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 mb-3 italic">
                      "{doc.description}"
                    </div>
                  )}

                  {/* Program Badges */}
                  <div className="mb-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Programas relacionados:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {associatedProgs.length === 0 ? (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                          🌟 Transversal / Todos
                        </span>
                      ) : (
                        associatedProgs.map(
                          (p) =>
                            p && (
                              <span
                                key={p.id}
                                style={{
                                  backgroundColor: `${p.color}15`,
                                  borderColor: `${p.color}40`,
                                  color: p.color,
                                }}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border"
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: p.color }}
                                />
                                {p.shortName}
                              </span>
                            )
                        )
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-600"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
                      title="Descargar archivo actual"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Descargar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryDoc(doc)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                      title="Ver historial de versiones"
                    >
                      <History className="h-3.5 w-3.5" />
                      <span>{doc.versions?.length || 1} v.</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenVersionModal(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Subir nueva versión"
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Editar metadatos"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Archivar documento"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Versión / Archivo</th>
                  <th className="py-3 px-4">Vigencia</th>
                  <th className="py-3 px-4">Programas Relacionados</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const effStatus = getDocumentEffectiveStatus(doc);
                  const associatedProgs = doc.programIds
                    .map((pId) => programs.find((p) => p.id === pId))
                    .filter(Boolean);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        {doc.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {doc.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                          {doc.category || doc.documentType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 font-bold">
                          {doc.version || 'v1.0'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{doc.fileName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              effStatus.status === 'vigente'
                                ? 'bg-emerald-500'
                                : effStatus.status === 'por_revisar'
                                ? 'bg-amber-500'
                                : effStatus.status === 'vencido'
                                ? 'bg-rose-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span className="font-semibold text-slate-700 capitalize">
                            {effStatus.status.replace('_', ' ')}
                          </span>
                        </div>
                        {(doc.expiryDate || doc.expirationDate) && (
                          <div className="text-[10px] text-slate-400">Vence: {doc.expiryDate || doc.expirationDate}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {associatedProgs.length === 0 ? (
                            <span className="text-[10px] font-bold text-emerald-700">
                              Transversal
                            </span>
                          ) : (
                            associatedProgs.map((p) => p && (
                              <span
                                key={p.id}
                                className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                                style={{
                                  backgroundColor: `${p.color}15`,
                                  color: p.color,
                                }}
                              >
                                {p.shortName}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            title="Descargar"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenVersionModal(doc)}
                            title="Subir versión"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                          >
                            <Upload className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(doc)}
                            title="Editar"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(doc.id)}
                            title="Eliminar"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
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
        </div>
      )}

      {/* ================= MODAL: CREAR / EDITAR DOCUMENTO ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingDoc ? 'Editar Documento' : 'Nuevo Documento'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Repositorio oficial centralizado de programas Quilicura
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Título del Documento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Convenio Marco PRAPS 2026 y Resolución Exenta N° 412"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Category with inline add */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Categoría *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput((prev) => !prev)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {showNewCatInput ? 'Cancelar' : '+ Nueva Categoría'}
                  </button>
                </div>

                {showNewCatInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      placeholder="Nombre de la categoría..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-indigo-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategoryInline}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setShowNewCatInput(true);
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {documentCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__add_new__" className="text-indigo-600 font-bold bg-indigo-50">
                      + Agregar nueva categoría...
                    </option>
                  </select>
                )}
              </div>

              {/* Version, Type & Confidentiality */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Versión
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="v1.0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Formato
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel (XLSX)</option>
                    <option value="WORD">Word (DOCX)</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Confidencialidad
                  </label>
                  <select
                    value={formData.confidentiality}
                    onChange={(e) => setFormData({ ...formData, confidentiality: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Público">Público</option>
                    <option value="Interno">Uso Interno</option>
                    <option value="Confidencial">Confidencial</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Fecha del Documento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.documentDate}
                    onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Fecha de Vencimiento (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Multi-Program Association */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Programas Asociados
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, programIds: programs.map((p) => p.id) })}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      Todos
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, programIds: [] })}
                      className="text-[10px] font-bold text-slate-500 hover:underline"
                    >
                      Transversal
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {programs.map((p) => {
                    const isChecked = formData.programIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProgramInForm(p.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isChecked
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded flex items-center justify-center text-white shrink-0 ${
                            isChecked ? 'bg-indigo-600' : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                        <span className="truncate">{p.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Attachment Upload Simulation */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Archivo Adjunto
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  <Paperclip className="h-5 w-5 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={formData.fileName}
                      onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                      placeholder="nombre_del_archivo.pdf"
                      className="w-full bg-transparent text-xs font-mono text-slate-800 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formData.fileSize}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Descripción / Resumen de Contenido
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre resolución, vigencia o requisitos técnicos..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Etiquetas (Tags)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.tagInput}
                    onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ej: 2026, SSMN, presupuesto..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                  >
                    + Añadir
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {formData.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-800 border border-indigo-100"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-indigo-400 hover:text-indigo-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {editingDoc ? 'Guardar Cambios' : 'Registrar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUBIR NUEVA VERSIÓN ================= */}
      {versionModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Subir Nueva Versión</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">
                    {versionModalDoc.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVersionModalDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewVersion} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Número de Versión *
                </label>
                <input
                  type="text"
                  required
                  value={newVersionData.versionNumber}
                  onChange={(e) =>
                    setNewVersionData({ ...newVersionData, versionNumber: e.target.value })
                  }
                  placeholder="Ej: v1.1 ó v2.0"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Nombre del Archivo
                </label>
                <input
                  type="text"
                  required
                  value={newVersionData.fileName}
                  onChange={(e) =>
                    setNewVersionData({ ...newVersionData, fileName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Notas de la Versión / Cambios
                </label>
                <textarea
                  rows={2}
                  value={newVersionData.notes}
                  onChange={(e) =>
                    setNewVersionData({ ...newVersionData, notes: e.target.value })
                  }
                  placeholder="Ej: Se incorpora adenda con aumento presupuestario..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVersionModalDoc(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Confirmar Versión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DRAWER: HISTORIAL DE VERSIONES ================= */}
      {historyDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Historial de Versiones</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[280px]">
                    {historyDoc.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(historyDoc.versions || []).map((ver, idx) => (
                <div
                  key={ver.id || idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    ver.isCurrent
                      ? 'bg-indigo-50/50 border-indigo-200'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                        {ver.versionNumber}
                      </span>
                      {ver.isCurrent && (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">
                          Actual
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{ver.uploadDate}</span>
                  </div>

                  <div className="font-mono text-slate-700 truncate">{ver.fileName}</div>
                  {ver.notes && <p className="text-slate-600 italic">"{ver.notes}"</p>}
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Subido por: {ver.uploadedBy || 'Sistema'}</span>
                    <button
                      type="button"
                      onClick={() => showToast(`Descargando versión ${ver.versionNumber}...`, 'success')}
                      className="text-indigo-600 hover:underline font-bold"
                    >
                      Descargar esta versión
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="¿Archivar documento?"
        message="El documento se moverá a históricos y ya no estará visible en la lista principal activa."
        confirmText="Sí, archivar documento"
        type="danger"
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteDocument(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Modal para Agregar Nueva Categoría de Documentos */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Nueva Categoría de Documento
                  </h3>
                  <p className="text-xs text-slate-500">
                    Crea una nueva clasificación para organizar tus documentos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCatModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategoryFromModal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={modalNewCatInput}
                  onChange={(e) => setModalNewCatInput(e.target.value)}
                  placeholder="Ej: Auditoría, Convenio Específico, Manual de Procedimientos..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Agregar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
