// api.js
import axios from "axios";

const api = axios.create({
  // Já deixamos a URL base aqui para não precisar repetir
  baseURL: "https://pride-barbers-api.onrender.com",
});

// Interceptor: Executa antes de QUALQUER requisição sair
api.interceptors.request.use(
  (config) => {
    // LÓGICA CORRIGIDA:
    // Tenta pegar do localStorage, se não achar (null), tenta o sessionStorage
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      // Adiciona o cabeçalho de autorização automaticamente no padrão Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
