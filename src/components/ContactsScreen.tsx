import React, { useState, useEffect } from "react";
import { Contacto } from "../types";
import {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
} from "../utils/contactsStorage";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Building,
  FileText,
  Play,
  X,
  Check,
  AlertTriangle,
  Calendar,
  Send,
} from "lucide-react";

interface ContactsScreenProps {
  onBack: () => void;
  onSelectForInterview?: (contact: { nome: string; area: string; empresa: string }) => void;
  onScheduleInterview?: (contact: Contacto) => void;
  onOpenAgendamentos?: () => void;
}

export function ContactsScreen({
  onBack,
  onSelectForInterview,
  onScheduleInterview,
  onOpenAgendamentos,
}: ContactsScreenProps) {
  const [contacts, setContacts] = useState<Contacto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contacto | null>(null);
  const [contactToDelete, setContactToDelete] = useState<{ id: string; nome: string } | null>(null);

  // Form State
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formCargoArea, setFormCargoArea] = useState("");
  const [formEmpresa, setFormEmpresa] = useState("");
  const [formNotas, setFormNotas] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (showModal || contactToDelete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, contactToDelete]);

  const loadContacts = () => {
    setContacts(getContacts());
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormNome("");
    setFormEmail("");
    setFormTelefone("");
    setFormCargoArea("");
    setFormEmpresa("");
    setFormNotas("");
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (contact: Contacto) => {
    setEditingContact(contact);
    setFormNome(contact.nome);
    setFormEmail(contact.email);
    setFormTelefone(contact.telefone);
    setFormCargoArea(contact.cargoArea);
    setFormEmpresa(contact.empresa);
    setFormNotas(contact.notas || "");
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      setFormError("O nome do contacto é obrigatório.");
      return;
    }

    if (editingContact) {
      updateContact({
        ...editingContact,
        nome: formNome.trim(),
        email: formEmail.trim(),
        telefone: formTelefone.trim(),
        cargoArea: formCargoArea.trim(),
        empresa: formEmpresa.trim(),
        notas: formNotas.trim(),
      });
    } else {
      addContact({
        nome: formNome.trim(),
        email: formEmail.trim(),
        telefone: formTelefone.trim(),
        cargoArea: formCargoArea.trim(),
        empresa: formEmpresa.trim(),
        notas: formNotas.trim(),
      });
    }

    setShowModal(false);
    loadContacts();
  };

  const handleDelete = (id: string, nome: string) => {
    setContactToDelete({ id, nome });
  };


  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.nome.toLowerCase().includes(q) ||
      c.cargoArea.toLowerCase().includes(q) ||
      c.empresa.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.telefone.toLowerCase().includes(q)
    );
  });

  return (
    <section className="border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-6 mt-4 rounded-[var(--radius)] shadow-lg space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--paper)] hover:border-[var(--gold)] rounded-[var(--radius)] transition cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[var(--paper)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--gold)]" />
              Gestão de Contactos & Candidatos
            </h2>
            <p className="font-mono text-xs text-[var(--paper-dim)]">
              Registo e manutenção da agenda de recrutadores, empresas e candidatos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAgendamentos && (
            <button
              onClick={onOpenAgendamentos}
              className="px-3.5 py-2.5 border border-[var(--gold-dim)] text-[var(--gold)] font-mono text-xs uppercase tracking-wider font-semibold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:bg-[var(--gold)] hover:text-[#1a1509] transition shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Ver Entrevistas Agendadas
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:bg-[#dab364] transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Contacto
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--paper-dim)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar por nome, empresa, área ou telefone..."
          className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] pl-10 pr-4 py-2.5 text-sm rounded-[var(--radius)] focus:outline-none focus:border-[var(--gold)]"
        />
      </div>

      {/* Contacts Grid / Table */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--line)] rounded-[var(--radius)] text-[var(--paper-dim)] space-y-2">
          <Users className="w-8 h-8 mx-auto text-[var(--paper-dim)] opacity-50" />
          <p className="font-mono text-xs uppercase tracking-wider">
            Nenhum contacto encontrado
          </p>
          <p className="text-xs">Adicione novos contactos ou ajuste o filtro de pesquisa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((c) => (
            <div
              key={c.id}
              className="border border-[var(--line)] bg-[var(--bg)] p-4 rounded-[var(--radius)] flex flex-col justify-between hover:border-[var(--gold-dim)] transition space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[var(--paper)]">
                      {c.nome}
                    </h3>
                    <p className="font-mono text-xs text-[var(--gold)] flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      {c.cargoArea || "Área não especificada"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-[var(--paper-dim)] hover:text-[var(--gold)] hover:bg-[rgba(200,162,77,0.08)] rounded transition cursor-pointer"
                      title="Editar contacto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.nome)}
                      className="p-1.5 text-[var(--paper-dim)] hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                      title="Eliminar contacto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 font-mono text-xs text-[var(--paper-dim)]">
                  {c.empresa && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[var(--gold-dim)] shrink-0" />
                      <span>{c.empresa}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[var(--gold-dim)] shrink-0" />
                      <a href={`mailto:${c.email}`} className="hover:underline text-[var(--paper)]">
                        {c.email}
                      </a>
                    </div>
                  )}
                  {c.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[var(--gold-dim)] shrink-0" />
                      <span>{c.telefone}</span>
                    </div>
                  )}
                </div>

                {c.notas && (
                  <p className="mt-2.5 pt-2 border-t border-[var(--line)] text-xs text-[var(--paper-dim)] italic flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[var(--gold-dim)] shrink-0 mt-0.5" />
                    <span>{c.notas}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--line)] mt-2 flex flex-col sm:flex-row gap-2">
                {onScheduleInterview && (
                  <button
                    onClick={() => onScheduleInterview(c)}
                    className="flex-1 py-1.5 border border-[var(--gold-dim)] text-[var(--gold)] hover:bg-[rgba(200,162,77,0.1)] font-mono text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Agendar & Notificar
                  </button>
                )}

                {onSelectForInterview && (
                  <button
                    onClick={() =>
                      onSelectForInterview({
                        nome: c.nome,
                        area: c.cargoArea,
                        empresa: c.empresa,
                      })
                    }
                    className="flex-1 py-1.5 bg-[var(--gold)] text-[#1a1509] hover:bg-[#dab364] font-mono text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Simular Agora
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form for Add/Edit Contact */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[var(--radius)] w-full max-w-lg shadow-2xl my-auto flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--bg)] shrink-0">
              <h3 className="font-serif font-bold text-base text-[var(--paper)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--gold)]" />
                {editingContact ? "Editar Contacto" : "Adicionar Novo Contacto"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--paper-dim)] hover:text-[var(--paper)] p-1 rounded transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Mateus Pedro"
                  className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                    Área / Cargo
                  </label>
                  <input
                    type="text"
                    value={formCargoArea}
                    onChange={(e) => setFormCargoArea(e.target.value)}
                    placeholder="Ex: Engenharia de Software"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                    Empresa / Instituição
                  </label>
                  <input
                    type="text"
                    value={formEmpresa}
                    onChange={(e) => setFormEmpresa(e.target.value)}
                    placeholder="Ex: Sonangol E.P."
                    className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="exemplo@empresa.co.ao"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    placeholder="+244 923 000 000"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                  Notas / Observações
                </label>
                <textarea
                  value={formNotas}
                  onChange={(e) => setFormNotas(e.target.value)}
                  placeholder="Informações relevantes sobre o candidato ou contacto..."
                  rows={3}
                  className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--paper)] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded flex items-center gap-1.5 hover:bg-[#dab364] transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Contact Deletion */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--panel)] border border-red-500/40 rounded-[var(--radius)] w-full max-w-sm my-auto p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-red-400 font-serif font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Eliminar Contacto
            </div>
            <p className="text-xs text-[var(--paper-dim)] leading-relaxed">
              Tem a certeza que deseja eliminar o contacto <strong className="text-[var(--paper)]">"{contactToDelete.nome}"</strong>? Esta ação é irreversível.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                className="px-3.5 py-1.5 border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--paper)] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteContact(contactToDelete.id);
                  setContactToDelete(null);
                  loadContacts();
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded transition cursor-pointer shadow-sm"
              >
                Confirmar Eliminação
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

