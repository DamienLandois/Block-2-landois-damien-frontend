import { create } from "zustand";
import axios from "axios";
import {getToken, saveToken, saveUser} from "@/lib/utils.js";

const URL = "http://localhost:3001";

export const authStore = create(() => ({
    register: async (credentials) => {
        await axios.post(`${URL}/user`, credentials);
    },

    registerAdmin: async (credentials) => {
        await axios.post(`${URL}/user/admin`, credentials, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
    },

    login: async (credentials) => {
        const {data} = await axios.post(`${URL}/auth/login`, credentials);
        saveUser(data.user);
        saveToken(data.access_token);
    }
}))