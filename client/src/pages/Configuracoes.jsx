// Hooks do React
import { useState, useEffect } from "react";

// Biblioteca para requisições HTTP
import axios from "axios";

// Ícones
import {
  Save,
  Clock,
  Store,
  Scissors,
  User,
  Bell,
  Trash2,
  Plus,
} from "lucide-react";

// Componente de Configurações do Sistema
function Configuracoes() {
  /* ===============================
      CONTROLE DE ABAS
  =============================== */

  // Define qual aba está ativa no menu lateral
  const [activeTab, setActiveTab] = useState("horarios");

  /* ===============================
      ESTADOS DE CONFIGURAÇÃO
  =============================== */

  // Dados gerais da barbearia
  const [dadosBarbearia, setDadosBarbearia] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
  });

  // Horários de funcionamento
  const [horarios, setHorarios] = useState({
    abertura: "09:00",
    fechamento: "20:00",
  });

  // Dados do perfil do administrador
  const [perfil, setPerfil] = useState({
    nome: "Mestre Barbeiro",
    email: "admin@admin.com",
  });

  // Preferências de notificações
  const [notificacoes, setNotificacoes] = useState({
    emailAgendamento: true,
    lembreteDiario: true,
    sons: false,
  });

  // Lista de serviços cadastrados
  const [servicos, setServicos] = useState([]);

  /* ===============================
      CARREGAMENTO INICIAL
  =============================== */

  // Executa ao carregar a página
  useEffect(() => {
    carregarConfiguracoes();
    carregarServicos();
  }, []);

  /* ===============================
      BUSCA DE DADOS
  =============================== */

  // Busca configurações gerais (horários, dados e perfil)
  const carregarConfiguracoes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/config`);

      if (res.data.horarios) setHorarios(res.data.horarios);
      if (res.data.dadosBarbearia) setDadosBarbearia(res.data.dadosBarbearia);
      if (res.data.perfil) setPerfil(res.data.perfil);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  // Busca serviços cadastrados
  const carregarServicos = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/servicos`);
      setServicos(res.data);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    }
  };

  /* ===============================
      SALVAR CONFIGURAÇÕES
  =============================== */

  // Salva todas as configurações em uma única requisição
  const handleSalvarGeral = async () => {
    try {
      const payload = {
        horarios,
        dadosBarbearia,
        perfil,
      };

      await axios.put(`${API_BASE_URL}/config`, payload);
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações.");
    }
  };

  /* ===============================
      CRUD DE SERVIÇOS
  =============================== */

  // Adiciona um novo serviço
  const addServico = async () => {
    try {
      const novoServico = { nome: "Novo Serviço", preco: "0,00" };
      const res = await axios.post(`${API_BASE_URL}/servicos`, novoServico);
      setServicos([...servicos, res.data]);
    } catch (error) {
      alert("Erro ao adicionar serviço");
    }
  };

  // Remove um serviço
  const deleteServico = async (id) => {
    if (window.confirm("Remover este serviço?")) {
      try {
        await axios.delete(`${API_BASE_URL}/servicos/${id}`);
        setServicos(servicos.filter((s) => s.id !== id));
      } catch (error) {
        alert("Erro ao deletar serviço");
      }
    }
  };

  // Atualiza estado local ao editar campos
  const handleEditChange = (id, campo, valor) => {
    setServicos(
      servicos.map((s) => (s.id === id ? { ...s, [campo]: valor } : s))
    );
  };

  // Salva edição do serviço ao perder foco
  const salvarEdicaoServico = async (servico) => {
    try {
      // ✅ JEITO CORRETO (Usando a variável)
      await axios.put(`${API_BASE_URL}/servicos/${servico.id}`, servico);
    } catch (error) {
      console.error("Erro ao salvar edição do serviço");
    }
  };

  /* ===============================
      RENDERIZAÇÃO DINÂMICA
  =============================== */

  const renderContent = () => {
    switch (activeTab) {
      /* -------- HORÁRIOS -------- */
      case "horarios":
        return (
          <div className="fade-in">
            <h3>Horários de Funcionamento</h3>
            <p className="subtitle">
              Defina o período de atendimento da barbearia.
            </p>

            <div className="form-row">
              <div className="input-Wrapper">
                <label>Abertura</label>
                <input
                  type="time"
                  className="dark-input"
                  value={horarios.abertura}
                  onChange={(e) =>
                    setHorarios({
                      ...horarios,
                      abertura: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-Wrapper">
                <label>Fechamento</label>
                <input
                  type="time"
                  className="dark-input"
                  value={horarios.fechamento}
                  onChange={(e) =>
                    setHorarios({
                      ...horarios,
                      fechamento: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        );

      /* -------- DADOS -------- */
      case "dados":
        return (
          <div className="fade-in">
            <h3>Dados da Barbearia</h3>

            <div className="form-group-settings">
              <label>Nome do Estabelecimento</label>
              <input
                type="text"
                className="dark-input"
                value={dadosBarbearia.nome}
                onChange={(e) =>
                  setDadosBarbearia({
                    ...dadosBarbearia,
                    nome: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group-settings">
              <label>Endereço</label>
              <input
                type="text"
                className="dark-input"
                value={dadosBarbearia.endereco}
                onChange={(e) =>
                  setDadosBarbearia({
                    ...dadosBarbearia,
                    endereco: e.target.value,
                  })
                }
              />
            </div>
          </div>
        );

      /* -------- SERVIÇOS -------- */
      case "servicos":
        return (
          <div className="fade-in">
            <div className="services-header">
              <div>
                <h3>Catálogo de Serviços</h3>
                <p className="subtitle">Gerencie os serviços oferecidos.</p>
              </div>

              <button className="btn-primary" onClick={addServico}>
                <Plus size={18} /> Novo Serviço
              </button>
            </div>

            <div className="services-list">
              {servicos.map((servico) => (
                <div key={servico.id} className="service-item-row">
                  <input
                    type="text"
                    className="dark-input small"
                    value={servico.nome}
                    onChange={(e) =>
                      handleEditChange(servico.id, "nome", e.target.value)
                    }
                    onBlur={() => salvarEdicaoServico(servico)}
                  />

                  <input
                    type="text"
                    className="dark-input small"
                    value={servico.preco}
                    onChange={(e) =>
                      handleEditChange(servico.id, "preco", e.target.value)
                    }
                    onBlur={() => salvarEdicaoServico(servico)}
                  />

                  <button
                    className="delete-btn-icon"
                    onClick={() => deleteServico(servico.id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      /* -------- PERFIL -------- */
      case "perfil":
        return (
          <div className="fade-in">
            <h3>Perfil</h3>

            <div className="form-group-settings">
              <label>Nome</label>
              <input
                type="text"
                className="dark-input"
                value={perfil.nome}
                onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
              />
            </div>

            <div className="form-group-settings">
              <label>Email</label>
              <input
                type="text"
                className="dark-input"
                value={perfil.email}
                onChange={(e) =>
                  setPerfil({ ...perfil, email: e.target.value })
                }
              />
            </div>
          </div>
        );

      /* -------- NOTIFICAÇÕES -------- */
      case "notificacoes":
        return (
          <div className="fade-in">
            <h3>Notificações</h3>

            <label className="switch-row">
              <span>Receber emails de agendamento</span>
              <input
                type="checkbox"
                checked={notificacoes.emailAgendamento}
                onChange={() =>
                  setNotificacoes({
                    ...notificacoes,
                    emailAgendamento: !notificacoes.emailAgendamento,
                  })
                }
              />
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  /* ===============================
      RENDER FINAL
  =============================== */

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <div>
          <h1>Configurações</h1>
          <p className="subtitle">Gerencie sua barbearia</p>
        </div>

        <button className="btn-primary" onClick={handleSalvarGeral}>
          <Save size={18} /> Salvar Alterações
        </button>
      </header>

      <div className="settings-container">
        <div className="settings-sidebar">
          <div
            className={`settings-item ${
              activeTab === "horarios" ? "active" : ""
            }`}
            onClick={() => setActiveTab("horarios")}
          >
            <Clock size={18} /> Horários
          </div>

          <div
            className={`settings-item ${activeTab === "dados" ? "active" : ""}`}
            onClick={() => setActiveTab("dados")}
          >
            <Store size={18} /> Dados
          </div>

          <div
            className={`settings-item ${
              activeTab === "servicos" ? "active" : ""
            }`}
            onClick={() => setActiveTab("servicos")}
          >
            <Scissors size={18} /> Serviços
          </div>

          <div
            className={`settings-item ${
              activeTab === "perfil" ? "active" : ""
            }`}
            onClick={() => setActiveTab("perfil")}
          >
            <User size={18} /> Perfil
          </div>

          <div
            className={`settings-item ${
              activeTab === "notificacoes" ? "active" : ""
            }`}
            onClick={() => setActiveTab("notificacoes")}
          >
            <Bell size={18} /> Notificações
          </div>
        </div>

        <div className="card settings-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default Configuracoes;
