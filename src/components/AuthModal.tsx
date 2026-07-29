import React, { useState, useEffect } from "react";
import { UserAccount } from "../types";
import { getUsers, setCurrentUser, registerUser, logoutUser } from "../utils/authStorage";
import { Lock, ShieldCheck, UserCheck, UserPlus, KeyRound, Check, X, ShieldAlert, UserX } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChanged: (user: UserAccount | null) => void;
}

export function AuthModal({ isOpen, onClose, currentUser, onUserChanged }: AuthModalProps) {
  const [mode, setMode] = useState<"switch" | "register">("switch");
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Register Form
  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCargo, setRegCargo] = useState("");
  const [regPin, setRegPin] = useState("");

  useEffect(() => {
    if (isOpen) {
      const uList = getUsers();
      setUsers(uList);
      if (currentUser) {
        setSelectedUserId(currentUser.id);
      } else if (uList.length > 0) {
        setSelectedUserId(uList[0].id);
      }
      setPinInput("");
      setErrorMsg(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.id === selectedUserId);
    if (!targetUser) {
      setErrorMsg("Selecione um utilizador válido.");
      return;
    }

    if (targetUser.pin && targetUser.pin !== pinInput.trim()) {
      setErrorMsg("PIN de acesso incorreto. Tente novamente.");
      return;
    }

    setCurrentUser(targetUser);
    onUserChanged(targetUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNome.trim() || !regEmail.trim()) {
      setErrorMsg("Nome e E-mail são obrigatórios.");
      return;
    }
    if (regPin.trim().length < 4) {
      setErrorMsg("O PIN deve conter pelo menos 4 dígitos/caracteres.");
      return;
    }

    const newUser = registerUser(
      regNome.trim(),
      regEmail.trim(),
      regCargo.trim() || "Recrutador",
      regPin.trim()
    );

    onUserChanged(newUser);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--panel)] border border-[var(--gold-dim)] rounded-[var(--radius)] w-full max-w-md shadow-2xl my-auto flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[var(--line)] bg-[var(--bg)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--gold)]" />
            <h3 className="font-serif font-bold text-base text-[var(--paper)]">
              Autenticação de Recrutador
            </h3>
          </div>
          {currentUser && (
            <button
              onClick={onClose}
              className="text-[var(--paper-dim)] hover:text-[var(--paper)] p-1 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Security Alert Badge */}
        <div className="mx-4 mt-4 p-3 border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs rounded flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold font-mono uppercase tracking-wider text-[11px]">
              Proteção de Código & Algoritmo Server-Side
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Os algoritmos de avaliação e credenciais da banca estão protegidos em servidor seguro. O código-fonte não é exposto a clientes.
            </p>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-[var(--line)] mt-3">
          <button
            type="button"
            onClick={() => {
              setMode("switch");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "switch"
                ? "border-b-2 border-[var(--gold)] text-[var(--gold)] bg-[rgba(200,162,77,0.05)]"
                : "text-[var(--paper-dim)] hover:text-[var(--paper)]"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Iniciar Sessão
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "register"
                ? "border-b-2 border-[var(--gold)] text-[var(--gold)] bg-[rgba(200,162,77,0.05)]"
                : "text-[var(--paper-dim)] hover:text-[var(--paper)]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Criar Utilizador
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === "switch" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                  Selecione o Recrutador / Utilizador
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} ({u.cargoRole})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                  PIN de Acesso Pessoal (Senha)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--paper-dim)]" />
                  <input
                    type="password"
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Introduza o seu PIN (ex: 1234)"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] pl-10 pr-3 py-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <p className="text-[10px] text-[var(--paper-dim)] font-mono mt-1">
                  Dica padrão para contas de teste: 1234 ou 2026.
                </p>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-center gap-2 hover:bg-[#dab364] transition cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                Entrar no Sistema AYLAENTREVISTA
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  placeholder="Ex: Dra. Teresa Gomes"
                  className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                  E-mail Profissional *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="teresa.gomes@empresa.co.ao"
                  className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    value={regCargo}
                    onChange={(e) => setRegCargo(e.target.value)}
                    placeholder="Ex: Recrutador RH"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                    Criar PIN (4+ dígitos) *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="Ex: 5678"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-center gap-2 hover:bg-[#dab364] transition cursor-pointer shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                Registar Conta e Aceder
              </button>
            </form>
          )}

          {/* Guest Access Option */}
          <div className="mt-5 pt-4 border-t border-[var(--line)] text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                logoutUser();
                onUserChanged(null);
                onClose();
              }}
              className="w-full py-2.5 border border-[var(--line)] bg-[var(--bg)] text-[var(--paper)] font-mono text-xs uppercase tracking-wider hover:border-[var(--gold)] transition rounded flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              <UserX className="w-4 h-4 text-[var(--paper-dim)]" />
              Entrar sem Login (Modo Convidado)
            </button>
            <p className="text-[10px] text-[var(--paper-dim)]">
              Permite realizar simulações de entrevista sem necessidade de registar ou selecionar uma conta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
