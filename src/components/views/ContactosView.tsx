import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Contact, ProgramId } from '../../types';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  Briefcase,
  Star,
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
  XCircle,
  Clock,
  X,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ContactosViewProps {
  scopedProgramId?: ProgramId | null;
  onOpenEntity?: (type: any, id: string) => void;
}

// Helper to normalize legacy category names
const normalizeContactCategory = (cat?: string): string => {
  if (!cat) return 'Otro';
  if (cat === 'Establecimiento APS') return 'APS';
  if (cat === 'Municipalidad / DISAM' || cat === 'Municipalidad / DESAM') return 'DESAM';
  return cat;
};

export const ContactosView: React.FC<ContactosViewProps> = ({
  scopedProgramId = null,
}) => {
  const {
    contacts,
    contactCategories,
    programs,
    addContact,
    updateContact,
    deleteContact,
    toggleContactFrequent,
    addContactCategory,
    exportTableCSV,
    showToast,
    setSelectedProgramId,
    setActiveView,
  } = useApp();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>(
    scopedProgramId || 'all'
  );
  const [onlyFrequent, setOnlyFrequent] = useState(false);
  const [onlyActive, setOnlyActive] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // New Category inline & modal
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [modalNewCatInput, setModalNewCatInput] = useState('');

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    role: '',
    institution: '',
    category: contactCategories[0] || 'APS',
    email: '',
    phone: '',
    secondaryPhone: '',
    programIds: scopedProgramId ? [scopedProgramId] : ([] as ProgramId[]),
    isFrequent: false,
    isActive: true,
    notes: '',
  });

  const handleOpenCreate = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      lastName: '',
      role: '',
      institution: '',
      category: contactCategories[0] || 'APS',
      email: '',
      phone: '',
      secondaryPhone: '',
      programIds: scopedProgramId ? [scopedProgramId] : [],
      isFrequent: false,
      isActive: true,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setEditingContact(c);
    setFormData({
      name: c.name,
      lastName: c.lastName,
      role: c.role,
      institution: c.institution,
      category: normalizeContactCategory(c.category || c.contactType),
      email: c.email || '',
      phone: c.phone || '',
      secondaryPhone: c.secondaryPhone || '',
      programIds: c.programIds || [],
      isFrequent: !!c.isFrequent,
      isActive: c.isActive !== false,
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim() || !formData.institution.trim()) {
      showToast('Por favor ingrese el nombre, cargo e institución', 'error');
      return;
    }

    if (editingContact) {
      updateContact(editingContact.id, {
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role.trim(),
        institution: formData.institution.trim(),
        category: formData.category,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        secondaryPhone: formData.secondaryPhone.trim() || undefined,
        programIds: formData.programIds,
        isFrequent: formData.isFrequent,
        isActive: formData.isActive,
        notes: formData.notes.trim() || undefined,
      });
    } else {
      addContact({
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role.trim(),
        institution: formData.institution.trim(),
        category: formData.category,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        secondaryPhone: formData.secondaryPhone.trim() || undefined,
        programIds: formData.programIds,
        isFrequent: formData.isFrequent,
        isActive: formData.isActive,
        notes: formData.notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleAddCategoryInline = () => {
    if (!newCatInput.trim()) return;
    addContactCategory(newCatInput.trim());
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
    addContactCategory(trimmed);
    setSelectedCategory(trimmed);
    setModalNewCatInput('');
    setIsAddCatModalOpen(false);
  };

  const handleCopyContact = (c: Contact) => {
    const lines = [
      `👤 ${c.name} ${c.lastName}`,
      `📌 ${c.role} — ${c.institution}`,
      `🏷️ Categoría: ${c.category}`,
      c.email ? `✉️ Email: ${c.email}` : '',
      c.phone ? `📞 Tel: ${c.phone}` : '',
      c.secondaryPhone ? `📱 Tel 2: ${c.secondaryPhone}` : '',
      c.notes ? `📝 Notas: ${c.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(lines);
    showToast(`Datos de ${c.name} copiados al portapapeles`, 'success');
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

  // Base contacts for currently selected program (to compute category chip counts)
  const baseContactsForProgram = useMemo(() => {
    return contacts.filter((c) => {
      if (c.archived) return false;
      if (onlyActive && !c.isActive) return false;
      if (onlyFrequent && !c.isFrequent) return false;

      if (scopedProgramId) {
        if (c.programIds.length > 0 && !c.programIds.includes(scopedProgramId)) return false;
      } else if (selectedProgramFilter !== 'all') {
        if (selectedProgramFilter === 'transversal') {
          if (c.programIds.length > 0) return false;
        } else if (!c.programIds.includes(selectedProgramFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [contacts, onlyActive, onlyFrequent, scopedProgramId, selectedProgramFilter]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return baseContactsForProgram.filter((c) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = normalizeContactCategory(c.category || c.contactType);
        if (cat !== selectedCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullTxt = `${c.name} ${c.lastName} ${c.role} ${c.institution} ${c.category || ''} ${c.contactType || ''} ${c.email || ''} ${c.phone || ''} ${c.notes || ''}`.toLowerCase();
        const matchedPrograms = c.programIds.some((pId) => {
          const prog = programs.find((p) => p.id === pId);
          return prog ? (prog.shortName.toLowerCase().includes(q) || prog.name.toLowerCase().includes(q)) : false;
        });
        if (!fullTxt.includes(q) && !matchedPrograms) {
          return false;
        }
      }

      return true;
    });
  }, [baseContactsForProgram, selectedCategory, searchQuery, programs]);

  return (
    <div id="view-contactos" className="space-y-4 text-left animate-in fade-in duration-150">
      {/* Search & Action Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 justify-between">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="input-search-contacts"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, cargo, institución, email, teléfono, programa..."
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
                id="select-filter-program"
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
              id="select-filter-category"
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
                Todas las categorías ({baseContactsForProgram.length})
              </option>
              {contactCategories.map((cat) => {
                const count = baseContactsForProgram.filter(
                  (c) => normalizeContactCategory(c.category || c.contactType) === cat
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

            {/* Volver Button (when viewing global contacts) */}
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

            {/* Frequent Toggle Pill */}
            <button
              type="button"
              onClick={() => setOnlyFrequent((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                onlyFrequent
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${onlyFrequent ? 'fill-white text-white' : 'text-amber-500'}`} />
              <span>Frecuentes</span>
            </button>

            {/* Export CSV Button */}
            <button
              id="btn-export-contacts-csv"
              type="button"
              onClick={() => exportTableCSV('contacts', scopedProgramId)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer border border-slate-200 shadow-2xs"
              title="Exportar listado a CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {/* Add Contact Button */}
            <button
              id="btn-new-contact"
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/25"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Contacto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area: Grid or Table */}
      {filteredContacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No se encontraron contactos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' || onlyFrequent
              ? 'Prueba modificando tus filtros o término de búsqueda para ver más resultados.'
              : 'Aún no hay contactos registrados. Comienza agregando referentes técnicos, directivos o proveedores.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Primer Contacto</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((c) => {
            const initials = `${c.name[0] || ''}${c.lastName[0] || ''}`.toUpperCase();
            // Resolve program badges
            const associatedProgs = c.programIds
              .map((pId) => programs.find((p) => p.id === pId))
              .filter(Boolean);

            return (
              <div
                key={c.id}
                id={`contact-card-${c.id}`}
                className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                {/* Card Top: Avatar + Name + Frequent Toggle */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold text-sm shadow-2xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {c.name} {c.lastName}
                          </h3>
                        </div>
                        <p className="text-xs text-indigo-700 font-semibold truncate flex items-center gap-1">
                          <Briefcase className="h-3 w-3 shrink-0" />
                          {c.role}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                          <Building className="h-3 w-3 shrink-0" />
                          {c.institution}
                        </p>
                      </div>
                    </div>

                    {/* Star Favorite Button */}
                    <button
                      type="button"
                      onClick={() => toggleContactFrequent(c.id)}
                      title={c.isFrequent ? 'Quitar de frecuentes' : 'Marcar como frecuente'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors shrink-0 cursor-pointer"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          c.isFrequent ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Category Pill + Active status */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                      <Tag className="h-2.5 w-2.5 text-slate-400" />
                      {normalizeContactCategory(c.category || c.contactType)}
                    </span>
                    {!c.isActive && (
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                        Inactivo
                      </span>
                    )}
                  </div>

                  {/* Direct Contact Links */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    {c.email && (
                      <div className="flex items-center justify-between gap-1 group/item">
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1.5 truncate text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                          title="Enviar correo"
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{c.email}</span>
                        </a>
                      </div>
                    )}

                    {c.phone && (
                      <div className="flex items-center justify-between gap-1">
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1.5 font-mono text-slate-700 hover:text-slate-900 hover:underline font-medium"
                          title="Llamar"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>{c.phone}</span>
                        </a>
                        {c.secondaryPhone && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            / {c.secondaryPhone}
                          </span>
                        )}
                      </div>
                    )}

                    {c.notes && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 pt-1 border-t border-slate-200/60">
                        "{c.notes}"
                      </p>
                    )}
                  </div>

                  {/* Program Badges (Multi-program association) */}
                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Programas Relacionados:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {associatedProgs.length === 0 ? (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                          🌟 Transversal / Todos
                        </span>
                      ) : (
                        associatedProgs.map((p) => p && (
                          <span
                            key={p.id}
                            style={{
                              backgroundColor: `${p.color}15`,
                              borderColor: `${p.color}40`,
                              color: p.color,
                            }}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border"
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                            {p.shortName}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Toolbar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyContact(c)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 text-[11px] font-semibold transition-all cursor-pointer"
                    title="Copiar ficha de contacto"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copiar</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Editar contacto"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar contacto"
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
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Cargo / Institución</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Canales</th>
                  <th className="py-3 px-4">Programas Relacionados</th>
                  <th className="py-3 px-4 text-center">Frecuente</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => {
                  const associatedProgs = c.programIds
                    .map((pId) => programs.find((p) => p.id === pId))
                    .filter(Boolean);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {c.name} {c.lastName}
                        </div>
                        {!c.isActive && (
                          <span className="text-[10px] text-rose-600 font-bold">Inactivo</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{c.role}</div>
                        <div className="text-[11px] text-slate-400">{c.institution}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                          {normalizeContactCategory(c.category || c.contactType)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="text-indigo-600 hover:underline block truncate max-w-[200px]"
                            >
                              {c.email}
                            </a>
                          )}
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="font-mono text-slate-600 block">
                              {c.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
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
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleContactFrequent(c.id)}
                          className="p-1 rounded-lg text-slate-300 hover:text-amber-500"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              c.isFrequent ? 'fill-amber-500 text-amber-500' : ''
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyContact(c)}
                            title="Copiar datos"
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            title="Editar"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(c.id)}
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

      {/* ================= MODAL: CREAR / EDITAR CONTACTO ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Directorio único centralizado para toda la red Quilicura
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

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Dra. Valeria"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Apellido / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Ej: Miranda Contreras"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Role & Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Cargo / Rol *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Ej: Referente Técnico PRAPS"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Institución / Área *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Ej: Servicio de Salud Metropolitano Norte"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category with inline addition */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Categoría
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
                      placeholder="Nombre de la nueva categoría..."
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
                    {contactCategories.map((cat) => (
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

              {/* Email & Phones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contacto@minsal.cl"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Teléfono Principal
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Multi-Program Association */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Programas Relacionados
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, programIds: programs.map((p) => p.id) })}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      Seleccionar Todos
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, programIds: [] })}
                      className="text-[10px] font-bold text-slate-500 hover:underline"
                    >
                      Transversal (Ninguno)
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Si no seleccionas ninguno, el contacto se considerará transversal para toda la red.
                </p>

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

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Horarios de atención, temas que gestiona, etc."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isFrequent}
                    onChange={(e) => setFormData({ ...formData, isFrequent: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                  />
                  <span>Marcar como Frecuente ⭐</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>Contacto Activo</span>
                </label>
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
                  {editingContact ? 'Guardar Cambios' : 'Crear Contacto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="¿Eliminar contacto?"
        message="El contacto se archivará y ya no aparecerá en el directorio activo. Podrá ser recuperado mediante auditoría."
        confirmText="Sí, archivar contacto"
        type="danger"
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteContact(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Modal para Agregar Nueva Categoría de Contactos */}
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
                    Nueva Categoría de Contacto
                  </h3>
                  <p className="text-xs text-slate-500">
                    Agrega un nuevo tipo o clasificación de contacto
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
                  placeholder="Ej: SEREMI de Salud, Auditoría, Referente Minsal..."
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
