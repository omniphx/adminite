import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

export interface UserState {
  id?: string;
  username?: string;
  authenticated: boolean;
  disableAutoComplete: boolean;
  disableInlineTabs: boolean;
  tabDisplayType?: string;
  license?: string;
  queryHotkey?: string;
}

interface UserActions {
  setUser: (user: Partial<UserState>) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setDisableAutoComplete: (disabled: boolean) => void;
  setDisableInlineTabs: (disabled: boolean) => void;
  setQueryHotkey: (hotkey: string) => void;
  reset: () => void;
}

const initialState: UserState = {
  authenticated: false,
  disableAutoComplete: false,
  disableInlineTabs: false,
};

export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) => set((state) => ({ ...state, ...user })),

        setAuthenticated: (authenticated) => set({ authenticated }),

        setDisableAutoComplete: (disableAutoComplete) => set({ disableAutoComplete }),

        setDisableInlineTabs: (disableInlineTabs) => set({ disableInlineTabs }),

        setQueryHotkey: (queryHotkey) => set({ queryHotkey }),

        reset: () => set(initialState),
      }),
      {
        name: 'adminite-user-settings',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          disableAutoComplete: state.disableAutoComplete,
          disableInlineTabs: state.disableInlineTabs,
          queryHotkey: state.queryHotkey,
          tabDisplayType: state.tabDisplayType,
        }),
      }
    ),
    { name: 'UserStore' }
  )
);
