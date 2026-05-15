import { useState, useCallback, createContext, useContext } from 'react';

/* ------------------------------------------------------------------ */
/*  User & Auth Types                                                  */
/* ------------------------------------------------------------------ */
export interface User {
  id: string;
  username: string;
  displayName: string;
  password: string; // simple hash
  createdAt: string;
  totalScore: number;
  wordsLearned: number;
  streakDays: number;
}

export interface AuthState {
  currentUser: User | null;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  register: (username: string, displayName: string, password: string) => boolean;
  logout: () => void;
  updateUserScore: (score: number) => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | null>(null);

/* ------------------------------------------------------------------ */
/*  localStorage Helpers                                               */
/* ------------------------------------------------------------------ */
const USERS_KEY = 'starwords_users';
const CURRENT_USER_KEY = 'starwords_current_user';

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

/* ------------------------------------------------------------------ */
/*  Auth Hook                                                          */
/* ------------------------------------------------------------------ */
export function useAuth(): AuthContextType {
  const [currentUser, setCurrentUser] = useState<User | null>(loadCurrentUser);

  const login = useCallback((username: string, password: string): boolean => {
    const users = loadUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      saveCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const register = useCallback(
    (username: string, displayName: string, password: string): boolean => {
      const users = loadUsers();
      if (users.find((u) => u.username === username)) {
        return false; // username exists
      }
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        displayName: displayName || username,
        password,
        createdAt: new Date().toISOString(),
        totalScore: 0,
        wordsLearned: 0,
        streakDays: 0,
      };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      saveCurrentUser(newUser);
      return true;
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    saveCurrentUser(null);
  }, []);

  const updateUserScore = useCallback((score: number) => {
    const users = loadUsers();
    const updated = users.map((u) => {
      if (u.id === currentUser?.id) {
        return {
          ...u,
          totalScore: u.totalScore + score,
          wordsLearned: u.wordsLearned + 1,
        };
      }
      return u;
    });
    saveUsers(updated);
    const updatedUser = updated.find((u) => u.id === currentUser?.id);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      saveCurrentUser(updatedUser);
    }
  }, [currentUser]);

  const getAllUsers = useCallback((): User[] => {
    return loadUsers().sort((a, b) => b.totalScore - a.totalScore);
  }, []);

  return {
    user: currentUser,
    isLoggedIn: !!currentUser,
    login,
    register,
    logout,
    updateUserScore,
    getAllUsers,
  };
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export const AuthProvider = AuthContext.Provider;
