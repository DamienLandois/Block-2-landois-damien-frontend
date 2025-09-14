import { create } from "zustand";
import axios from "axios";
import { getToken } from "@/lib/utils.js";

const URL = "http://localhost:3001";

export const userStore = create((set) => ({
  users: [],
  currentUser: null,

  updateUser: async (id, credentials) => {
    const { data } = await axios.patch(`${URL}/user/${id}`, credentials, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...data } : user
      ),
    }));
  },

  deleteUser: async (id) => {
    await axios.delete(`${URL}/user/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));
  },

  getUser: async (id) => {
    const { data } = await axios.get(`${URL}/user/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    set({ currentUser: data });
  },

  getUsers: async () => {
    const { data } = await axios.get(`${URL}/user`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    set({ users: data });
  },

  updateUserRole: async (id, role) => {
    await axios.patch(`${URL}/user/${id}/role`, role, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...role } : user
      ),
    }));
  },
}));

export default userStore;
