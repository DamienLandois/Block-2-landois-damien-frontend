import { create } from "zustand";
import axios from "axios";
import {getToken} from "@/lib/utils.js";

const URL = "http://localhost:3001";

export const massageStore = create((set) => ({
    massages: [],
    currentMassage: null,

    getMassages: async () => {
        const {data} = await axios.get(`${URL}/massages`, {});
        set({ massages: data });
    },

    getMassage: async (id) => {
        const {data} = await axios.get(`${URL}/massages/${id}`, {});
        set({ currentMassage: data });
    },

    createMassage: async (massage) => {
        const {data} = await axios.post(`${URL}/massages`, massage, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        set((state) => ({
            massages: [...state.massages, data],
        }));

    },

    updateMassage: async (id, massage) => {
        const {data} = await axios.put(`${URL}/massages/${id}`, massage, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        set((state) => ({
            massages: state.massages.map((massage) =>
                massage.id === id ? { ...massage, ...data } : massage
            ),
        }));

    },

    deleteMassage: async (id) => {
        const {data} = await axios.delete(`${URL}/massages/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        set((state) => ({
            massages: state.massages.filter((m) => m.id !== data.id),
        }));
    },

    getMassageImageFilename: async (filename) => {
        return axios.get(`${URL}/massages/images/${filename}`, {});
    }
}))