import { Contacto } from "../types";

const CONTACTS_KEY = "aylaentrevista_contacts_v1";

const INITIAL_CONTACTS: Contacto[] = [
  {
    id: "cnt_1",
    nome: "Mateus Pedro",
    email: "mateus.pedro@sonangol.co.ao",
    telefone: "+244 923 111 222",
    cargoArea: "Engenharia de Software",
    empresa: "Sonangol E.P.",
    notas: "Candidato sênior com foco em arquitetura de dados e Cloud.",
    dataCriacao: Date.now() - 86400000 * 5,
  },
  {
    id: "cnt_2",
    nome: "Ana Beatriz Silva",
    email: "ana.silva@bfa.ao",
    telefone: "+244 912 333 444",
    cargoArea: "Análise Financeira & Risco",
    empresa: "Banco de Fomento Angola (BFA)",
    notas: "Especialista em conformidade bancária e relatórios de auditoria.",
    dataCriacao: Date.now() - 86400000 * 2,
  },
  {
    id: "cnt_3",
    nome: "Dr. Domingos Kiala",
    email: "domingos.kiala@unitel.ao",
    telefone: "+244 934 555 666",
    cargoArea: "Recrutador / Gestão de RH",
    empresa: "Unitel S.A.",
    notas: "Contacto direto do Departamento de Gestão de Talentos.",
    dataCriacao: Date.now() - 86400000,
  },
];

export function getContacts(): Contacto[] {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    if (!raw) {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(INITIAL_CONTACTS));
      return INITIAL_CONTACTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading contacts from storage:", err);
    return INITIAL_CONTACTS;
  }
}

export function saveContacts(contacts: Contacto[]): void {
  try {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error("Error saving contacts to storage:", err);
  }
}

export function addContact(data: Omit<Contacto, "id" | "dataCriacao">): Contacto {
  const contacts = getContacts();
  const newContact: Contacto = {
    ...data,
    id: "cnt_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    dataCriacao: Date.now(),
  };
  const updated = [newContact, ...contacts];
  saveContacts(updated);
  return newContact;
}

export function updateContact(updatedContact: Contacto): void {
  const contacts = getContacts();
  const updated = contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c));
  saveContacts(updated);
}

export function deleteContact(id: string): void {
  const contacts = getContacts();
  const updated = contacts.filter((c) => c.id !== id);
  saveContacts(updated);
}
