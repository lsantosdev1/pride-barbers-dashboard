import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import api from "../api"; // Certifique-se que o caminho da sua api.js está correto
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

import logo from "../assets/imgsalao3.png";

function Sidebar({ handleLogout, user: initialUser }) {
  // Criamos um estado interno para o usuário.
  // Ele começa com o que veio por prop (se houver) ou null.
  const [userData, setUserData] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Se não temos o nome do usuário, buscamos na rota de identidade
        if (!userData || !userData.nome) {
          const response = await api.get("/me");
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil na sidebar:", error);
        // Fallback caso o servidor falhe
        setUserData({ nome: "Barbeiro", email: "" });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [initialUser]); // Monitora se o user mudar via props

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="brand">
        <img src={logo} alt="Pride Barbers" />
        <h3>Pride Barbers</h3>
      </div>

      {/* NAVEGAÇÃO PRINCIPAL */}
      <nav>
        <NavLink to="/dashboard" end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/agendamentos">
          <Calendar size={20} />
          <span>Agendamentos</span>
        </NavLink>

        <NavLink to="/relatorios">
          <FileText size={20} />
          <span>Relatórios</span>
        </NavLink>

        <NavLink to="/configuracoes">
          <Settings size={20} />
          <span>Configurações</span>
        </NavLink>
      </nav>

      {/* PERFIL DO USUÁRIO */}
      <div className="user-profile">
        {/* Avatar dinâmico: Se não tiver imagem, gera uma com as iniciais do nome */}
        <img
          src={
            userData?.avatar ||
            `https://ui-avatars.com/api/?name=${userData?.nome || "User"}&background=random`
          }
          alt="Avatar do usuário"
          className="avatar"
        />

        <div className="user-info">
          {/* Lógica do nome ou carregando */}
          {loading ? (
            <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>Carregando...</p>
          ) : (
            <p>{userData?.nome || "Barbeiro"}</p>
          )}

          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
