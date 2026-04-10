import toast from "react-hot-toast";
// Hooks do React
import { useState, useEffect } from "react";

// Biblioteca para requisições HTTP
import api from "../api";

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
  const [activeTab, setActiveTab] = useState("horarios");

  /* ===============================
      ESTADOS DE CONFIGURAÇÃO
  =============================== */
  const [dadosBarbearia, setDadosBarbearia] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
  });

  const [horarios, setHorarios] = useState({
    abertura: "09:00",
    fechamento: "20:00",
    mesAberto: "4", // Ex: 4 para Abril, 5 para Maio...
  });

  const [perfil, setPerfil] = useState({
    nome: "Mestre Barbeiro",
    email: "admin@admin.com",
  });

  const [notificacoes, setNotificacoes] = useState({
    emailAgendamento: true,
    lembreteDiario: true,
    sons: false,
  });

  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
      CARREGAMENTO INICIAL
  =============================== */
  useEffect(() => {
    carregarConfiguracoes();
    carregarServicos();
  }, []);

  /* ===============================
      BUSCA DE DADOS
  =============================== */
  const carregarConfiguracoes = async () => {
    try {
      const res = await api.get("/config");
      if (res.data.horarios) setHorarios(res.data.horarios);
      if (res.data.dadosBarbearia) setDadosBarbearia(res.data.dadosBarbearia);
      if (res.data.perfil) setPerfil(res.data.perfil);
      if (res.data.notificacoes) setNotificacoes(res.data.notificacoes);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const carregarServicos = async () => {
    try {
      const res = await api.get("/servicos");
      setServicos(res.data);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    }
  };

  /* ===============================
      SALVAR CONFIGURAÇÕES
  =============================== */

  const handleSalvarGeral = async () => {
    try {
      const payload = {
        horarios,
        dadosBarbearia,
        perfil,
        notificacoes,
      };

      await api.put("/config", payload);

      // TROCADO ALERT POR TOAST SUCESSO
      toast.success("Configurações salvas com sucesso! 💾");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);

      // TROCADO ALERT POR TOAST ERRO
      toast.error("Erro ao salvar configurações. Verifique os dados.");
    }
  };

  /* ===============================
    CRUD DE SERVIÇOS
=============================== */
  const addServico = async () => {
    try {
      const novoServico = { nome: "Novo Serviço", preco: "0,00" };
      const res = await api.post("/servicos", novoServico);
      setServicos([...servicos, res.data]);

      // ADICIONADO TOAST PARA FEEDBACK
      toast.success("Novo serviço adicionado! Edite o nome e o preço. ✂️");
    } catch (error) {
      // TROCADO ALERT POR TOAST ERRO
      toast.error("Erro ao adicionar serviço.");
    }
  };

  const deleteServico = async (id) => {
    if (window.confirm("Remover este serviço do seu catálogo?")) {
      try {
        await api.delete(`/servicos/${id}`);
        setServicos(servicos.filter((s) => s._id !== id));

        // ADICIONADO TOAST SUCESSO
        toast.success("Serviço removido! 🗑️");
      } catch (error) {
        // TROCADO ALERT POR TOAST ERRO
        toast.error("Erro ao deletar serviço.");
      }
    }
  };

  const salvarEdicaoServico = async (servico) => {
    if (!servico.nome || servico.nome === "Novo Serviço") return;
    try {
      await api.put(`/servicos/${servico._id}`, servico);

      // TROCADO CONSOLE.LOG POR TOAST SUCESSO
      toast.success("Serviço atualizado! ✅");
    } catch (error) {
      console.error("Erro ao salvar edição");

      // ADICIONADO TOAST ERRO
      toast.error("Erro ao salvar alteração do serviço.");
    }
  };
  /* ===============================
      RENDERIZAÇÃO DINÂMICA
  =============================== */
  const renderContent = () => {
    switch (activeTab) {
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
                    setHorarios({ ...horarios, abertura: e.target.value })
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
                    setHorarios({ ...horarios, fechamento: e.target.value })
                  }
                />
              </div>
            </div>

            {/* SELETOR DE MÊS INTEGRADO AO RETURN */}
            <div className="form-group-settings" style={{ marginTop: "2rem" }}>
              <label>Liberar Agenda para o Mês:</label>
              <select
                className="dark-input"
                value={horarios.mesAberto}
                onChange={(e) =>
                  setHorarios({ ...horarios, mesAberto: e.target.value })
                }
                style={{ width: "100%", marginTop: "8px" }}
              >
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
              <p
                className="subtitle"
                style={{ fontSize: "12px", marginTop: "8px" }}
              >
                * Os clientes só conseguirão agendar horários dentro do mês
                selecionado.
              </p>
            </div>
          </div>
        );

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
                  setDadosBarbearia({ ...dadosBarbearia, nome: e.target.value })
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
                <div key={servico._id} className="service-item-row">
                  <input
                    type="text"
                    className="dark-input small"
                    value={servico.nome}
                    onChange={(e) =>
                      handleEditChange(servico._id, "nome", e.target.value)
                    }
                    onBlur={() => salvarEdicaoServico(servico)}
                  />
                  <input
                    type="text"
                    className="dark-input small"
                    value={servico.preco}
                    onChange={(e) =>
                      handleEditChange(servico._id, "preco", e.target.value)
                    }
                    onBlur={() => salvarEdicaoServico(servico)}
                  />
                  <button
                    className="delete-btn-icon"
                    onClick={() => deleteServico(servico._id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

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
            className={`settings-item ${activeTab === "horarios" ? "active" : ""}`}
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
            className={`settings-item ${activeTab === "servicos" ? "active" : ""}`}
            onClick={() => setActiveTab("servicos")}
          >
            <Scissors size={18} /> Serviços
          </div>
          <div
            className={`settings-item ${activeTab === "perfil" ? "active" : ""}`}
            onClick={() => setActiveTab("perfil")}
          >
            <User size={18} /> Perfil
          </div>
          <div
            className={`settings-item ${activeTab === "notificacoes" ? "active" : ""}`}
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
