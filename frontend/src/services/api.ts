import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar Token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('parqueadero_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejo amigable de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      'Ocurrió un error inesperado al comunicarse con el servidor.';

    // Enviar mensaje legible de error
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);
