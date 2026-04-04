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
      console.log("Iniciando busca do usuário...");
      try {
        // Forçamos o token a ser lido do Storage antes da chamada
        const response = await api.get("/me");
        console.log("Dados recebidos com sucesso:", response.data);
        setUserData(response.data);
      } catch (error) {
        console.error("ERRO CRÍTICO NA SIDEBAR:", error);
        // Se der erro, a gente coloca um nome padrão para não travar o cliente
        setUserData({ nome: "Barbeiro (Offline)" });
      } finally {
        console.log("Finalizando estado de carregamento.");
        setLoading(false); // ISSO AQUI TEM QUE RODAR!
      }
    };

    fetchUser();
  }, []);

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
