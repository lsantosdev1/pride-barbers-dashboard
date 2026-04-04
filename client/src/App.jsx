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
import Configuracoes from "./pages/Configuracoes";

import "./App.css";

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
  // Inicialização síncrona do token
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
  const carregarUsuario = async () => {
    const tokenExistente = localStorage.getItem("token");
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
    }
  };

  useEffect(() => {
    if (token) carregarUsuario();
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. ROTA RAIZ INTELIGENTE */}
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" /> : <Agendar />}
        />

        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/register" element={<Register />} />

        {/* 2. LOGIN COM REDIRECIONAMENTO REVERSO */}
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
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        {/* 4. CATCH-ALL MELHORADO */}
        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
