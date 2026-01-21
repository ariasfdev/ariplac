import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  withCredentials: true, // incluye cookies para auth
});

// Asegura que las instancias globales de axios también envíen cookies y usen la misma base
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
