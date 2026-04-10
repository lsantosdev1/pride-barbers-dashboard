/* ==========================================================================
   PROJETO: PRIDE BARBERS DASHBOARD - REVISADO (F5 FIXED)
   ========================================================================== */
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import api from "./api";
import Login from "./Login";
import Sidebar from "./components/Sidebar";

import RecuperarSenha from "./pages/RecuperarSenha";
import Register from "./pages/Register";
import DashboardHome from "./pages/DashboardHome";
import Agendar from "./pages/Agendar";
import Agendamentos from "./pages/Agendamentos";
import Relatorios from "./pages/Relatorios";
import Gastos from "./pages/Gastos";
import Configuracoes from "./pages/Configuracoes";

import "./App.css";
import { Toaster } from "react-hot-toast"; // 1. Importe o componente

function MainLayout({ handleLogout, user, atualizarUsuario }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className={`dashboard-layout ${isMenuOpen ? "menu-open" : ""}`}>
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        {isMenuOpen ? "✕" : "☰"}
      </button>

      {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}

      <Sidebar handleLogout={handleLogout} user={user} />

      <main onClick={() => isMenuOpen && setIsMenuOpen(false)}>
        <Outlet context={{ atualizarUsuario }} />
      </main>
    </div>
  );
}

function App() {
  // 1. Inicialização inteligente: Checa as duas "gavetas" no primeiro frame
  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || null
    );
  });

  const [user, setUser] = useState({
    nome: "Carregando...",
    email: "...",
    avatar: "https://ui-avatars.com/api/?name=User",
  });

  // 2. Carregamento de usuário adaptado para busca dupla
  const carregarUsuario = async () => {
    const tokenExistente =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!tokenExistente) return;

    try {
      // Usando a rota /config para pegar o perfil
      const res = await api.get("/config");
      if (res.data.perfil) {
        setUser({
          nome: res.data.perfil.nome,
          email: res.data.perfil.email,
          avatar: `https://ui-avatars.com/api/?name=${res.data.perfil.nome.replace(" ", "+")}&background=random`,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar usuário sidebar", error);
      // Se o erro for 401 (token expirado), desloga por segurança
      if (error.response?.status === 401) handleLogout();
    }
  };

  useEffect(() => {
    if (token) carregarUsuario();
  }, [token]);

  // 3. Logout limpa tudo para não sobrar rastros
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a1a", // Fundo escuro igual ao seu sistema
            color: "#fff",
            border: "1px solid #ff0000", // Um detalhe em vermelho (opcional)
          },
        }}
      />
      <Routes>
        {/* 1. ROTA RAIZ (PÁGINA DO CLIENTE) */}
        {/* Agora ela é neutra: sempre mostra o Agendar, com ou sem token */}
        <Route path="/" element={<Agendar />} />

        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/register" element={<Register />} />

        {/* 2. LOGIN COM REDIRECIONAMENTO REVERSO */}
        {/* Aqui mantemos: se o barbeiro tentar "logar de novo", ele volta pro trampo */}
        <Route
          path="/login"
          element={
            !token ? (
              <Login setToken={setToken} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* 3. ROTAS PROTEGIDAS (DASHBOARD) */}
        <Route
          element={
            token ? (
              <MainLayout
                handleLogout={handleLogout}
                user={user}
                atualizarUsuario={carregarUsuario}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        {/* 4. CATCH-ALL MELHORADO */}
        {/* Se digitar uma URL que não existe: */}
        {/* Logado? Vai pro painel. Deslogado? Vai pra tela de agendar. */}
        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
