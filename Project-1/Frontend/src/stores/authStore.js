import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),

  login: (data) => {
    const { user, accessToken, refreshToken } = data;

    localStorage.setItem("accessToken", accessToken);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    set({
      user,
      accessToken,
      refreshToken,
    });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  setUser: (user) => {
    set({ user });
  },
}));

export default useAuthStore;