import { create } from "zustand";
import axios from "axios";
import {getToken} from "@/lib/utils.js";

const URL = "http://localhost:3001";

export const planningStore = create((set) => ({
    creneaux: [],
    currentCreneau: null,
    reservations: [],

    getCreneaux: async () => {
        const {data} = await axios.get(`${URL}/planning/creneaux`, {});
        set({ creneaux: data });
    },

    getMesRendezVous: async () => {
        const {data} = await axios.get(`${URL}/planning/mes-rendez-vous`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        set({ creneaux: data });
    },

    createCreneau: async (creneau) => {
        const {data} = await axios.post(`${URL}/planning/creneaux`, creneau, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        set((state) => ({
            creneaux: [...state.creneaux, data],
        }));
    },

    updateCreneau: async (id,creneauLocal) => {
        const {data} = await axios.put(`${URL}/planning/creneaux/${id}`, creneauLocal, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        set((state) => ({
            creneaux: state.creneaux.map((creneau) =>
                creneau.id === id ? { ...creneau, ...data } : creneau
            ),
        }));
    },

    deleteCreneau: async (id) => {
        const {data} = await axios.delete(`${URL}/planning/creneaux/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        set((state) => ({
            creneaux: state.creneaux.filter((c) => c.id !== data.id),
        }));
    },

    getReservations: async () => {
        const {data} = await axios.get(`${URL}/planning/reservations`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        set({ reservations: data });
    },

    createReservation: async (reservation) => {
        const {data} = await axios.post(`${URL}/planning/reservations`, reservation, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        set((state) => ({
            reservations: [...state.reservations, data],
        }));
    },

    deleteReservation: async (id) => {
        const {data} = await axios.delete(`${URL}/planning/reservations/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        set((state) => ({
            reservations: state.reservations.filter((r) => r.id !== data.id),
        }));
    },

    annulerReservation: async (id) => {
        const {data} = await axios.delete(`${URL}/planning/reservations/${id}/annuler`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        set((state) => ({
            reservations: state.reservations.filter((r) => r.id !== data.id),
        }));
    },

    updateReservation: async (id,reservationLocal) => {
        const {data} = await axios.put(`${URL}/planning/reservations/${id}`, reservationLocal, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        set((state) => ({
            reservations: state.reservations.map((reservation) =>
                reservation.id === id ? { ...reservation, ...data } : reservation
            ),
        }));
    },
}))