/* ==========================================================================
   PROJETO: PRIDE BARBERS DASHBOARD
   ARQUIVO: App.jsx
   DESCRIÇÃO: Componente raiz revisado e limpo.
   ========================================================================== */

import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// 2. Requisições HTTP
import api from "./api";

// 4. Componentes Globais
import Login from "./Login";
import Sidebar from "./components/Sidebar"; // ADICIONADO: Importação da Sidebar

// 5. Páginas
import RecuperarSenha from "./pages/RecuperarSenha";
import Register from "./pages/Register"; // ADICIONADO: Página de Registro
import DashboardHome from "./pages/DashboardHome";
import Agendar from "./pages/Agendar";
import Agendamentos from "./pages/Agendamentos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";

// 6. Estilos
import "./App.css";

/* ==========================================================================
   COMPONENTE: LAYOUT PRINCIPAL
   ========================================================================== */
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

/* ==========================================================================
   COMPONENTE: APP (ROOT)
   ========================================================================== */
function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState({
    nome: "Carregando...",
    email: "...",
    avatar: "https://ui-avatars.com/api/?name=User",
  });

  const carregarUsuario = async () => {
    const tokenExistente = localStorage.getItem("token");

    // Se não houver token, nem tenta fazer a chamada para evitar o erro 401
    if (!tokenExistente) return;
    try {
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
        <Route path="/" element={<Agendar />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />

        <Route path="/register" element={<Register />} />
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

        {token && (
          <Route
            element={
              <MainLayout
                handleLogout={handleLogout}
                user={user}
                atualizarUsuario={carregarUsuario}
              />
            }
          >
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
