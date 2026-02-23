// api.js
import axios from "axios";

const api = axios.create({
  // Já deixamos a URL base aqui para não precisar repetir
  baseURL: "https://pride-barbers-api.onrender.com",
});

// Interceptor: Executa antes de QUALQUER requisição sair
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Busca o token salvo

    if (token) {
      // Adiciona o cabeçalho de autorização automaticamente
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
