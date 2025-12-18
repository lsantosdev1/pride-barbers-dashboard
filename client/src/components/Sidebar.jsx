// Ícones utilizados no menu lateral
import { LayoutDashboard, Calendar, FileText, Settings } from "lucide-react";

// Componente para navegação com controle automático de rota ativa
import { NavLink } from "react-router-dom";

// Logo da aplicação
import logo from "../assets/imgsalao3.png";

// Componente Sidebar (Menu Lateral)
function Sidebar({ handleLogout, user }) {
  return (
    <aside className="sidebar">
      {/* ===============================
          LOGO / IDENTIDADE VISUAL
      =============================== */}
      <div className="brand">
        <img src={logo} alt="Pride Barbers" />
        <h3>Pride Barbers</h3>
      </div>

      {/* ===============================
          NAVEGAÇÃO PRINCIPAL
      =============================== */}
      <nav>
        {/* 
          NavLink aplica automaticamente a classe "active"
          quando a rota corresponde à URL atual 
        */}
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

      {/* ===============================
          PERFIL DO USUÁRIO
      =============================== */}
      <div className="user-profile">
        {/* Avatar do usuário */}
        <img src={user.avatar} alt="Avatar do usuário" className="avatar" />

        <div className="user-info">
          {/* Nome do usuário */}
          <p>{user.nome}</p>

          {/* Botão de logout */}
          <button onClick={handleLogout} className="logout-btn">
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

// Exportação do componente
export default Sidebar;
