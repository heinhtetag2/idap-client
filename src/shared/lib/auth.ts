import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type AuthState = {
  email: string | null;
  signedInAt: number | null;
  login: (email: string, remember: boolean) => void;
  logout: () => void;
};

const pickStorage = () => {
  const remember = localStorage.getItem('idap.auth.remember') !== '0';
  return remember ? localStorage : sessionStorage;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      email: null,
      signedInAt: null,
      login: (email, remember) => {
        localStorage.setItem('idap.auth.remember', remember ? '1' : '0');
        if (!remember) {
          localStorage.removeItem('idap.auth.v1');
        } else {
          sessionStorage.removeItem('idap.auth.v1');
        }
        set({ email, signedInAt: Date.now() });
      },
      logout: () => {
        localStorage.removeItem('idap.auth.v1');
        sessionStorage.removeItem('idap.auth.v1');
        set({ email: null, signedInAt: null });
      },
    }),
    {
      name: 'idap.auth.v1',
      storage: createJSONStorage(() => pickStorage()),
      partialize: (s) => ({ email: s.email, signedInAt: s.signedInAt }),
    },
  ),
);
