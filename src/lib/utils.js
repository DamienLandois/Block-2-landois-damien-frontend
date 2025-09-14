import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function saveUser(user) {
  console.log(user);
  localStorage.setItem("user", JSON.stringify(user));
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function disconnect() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}
