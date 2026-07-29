import { UserAccount } from "../types";

const USERS_KEY = "aylaentrevista_users_v1";
const SESSION_KEY = "aylaentrevista_current_session_v1";

const DEFAULT_USERS: UserAccount[] = [
  {
    id: "usr_default_1",
    nome: "Dr. Manuel Silva",
    email: "manuel.silva@recrutamento.co.ao",
    cargoRole: "Recrutador Sénior / Presidente da Banca",
    pin: "1234",
    dataCriacao: Date.now() - 86400000 * 30,
  },
  {
    id: "usr_default_2",
    nome: "Dra. Isabel Kiala",
    email: "isabel.kiala@rh.co.ao",
    cargoRole: "Gestora de Recursos Humanos",
    pin: "2026",
    dataCriacao: Date.now() - 86400000 * 15,
  },
];

export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading users from storage:", err);
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Error saving users to storage:", err);
  }
}

export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      // Auto login default first user if no session exists yet
      const users = getUsers();
      if (users.length > 0) {
        setCurrentUser(users[0]);
        return users[0];
      }
      return null;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading current user session:", err);
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error("Error saving session:", err);
  }
}

export function registerUser(nome: string, email: string, cargoRole: string, pin: string): UserAccount {
  const users = getUsers();
  const newUser: UserAccount = {
    id: "usr_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    nome,
    email,
    cargoRole: cargoRole || "Recrutador",
    pin: pin || "1234",
    dataCriacao: Date.now(),
  };
  const updated = [newUser, ...users];
  saveUsers(updated);
  setCurrentUser(newUser);
  return newUser;
}

export function logoutUser(): void {
  setCurrentUser(null);
}
