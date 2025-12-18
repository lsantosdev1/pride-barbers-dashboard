import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Trash2,
  X,
  Save,
} from "lucide-react";

// Constante para facilitar manutenção da URL da API
const API_BASE_URL = "https://pride-barbers-api.onrender.com";

function Agendamentos() {
  // =================================================================
  // 1. ESTADOS (STATES)
  // =================================================================

  // Dados e Controle de UI
  const [agendamentos, setAgendamentos] = useState([]);
  const [listaServicos, setListaServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  // Formulário (Novo Agendamento)
  const [novoAgendamento, setNovoAgendamento] = useState({
    nome: "",
    servico: "",
    data: "",
    horario: "",
    preco: "",
  });

  // =================================================================
  // 2. EFEITOS (USEEFFECT) E CARREGAMENTO
  // =================================================================

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      // Promise.all executa as requisições em paralelo para maior performance
      const [resAgendamentos, resServicos] = await Promise.all([
        axios.get(`${API_BASE_URL}/agendamentos`),
        axios.get(`${API_BASE_URL}/servicos`),
      ]);

      setAgendamentos(resAgendamentos.data);
      setListaServicos(resServicos.data);

      // Define um valor padrão para o formulário se houver serviços
      if (resServicos.data.length > 0) {
        const servicoPadrao = resServicos.data[0];
        setNovoAgendamento((prev) => ({
          ...prev,
          servico: servicoPadrao.nome,
          preco: `R$ ${servicoPadrao.preco}`,
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // =================================================================
  // 3. HANDLERS (AÇÕES DO USUÁRIO)
  // =================================================================

  // Atualiza o status do agendamento (Ex: Agendado -> Concluído)
  const atualizarStatus = async (id, novoStatus) => {
    try {
      // 1. Atualiza no Backend
      await axios.put(`${API_BASE_URL}/agendamentos/${id}`, {
        status: novoStatus,
      });

      // 2. Atualiza o estado local para refletir na UI imediatamente
      setAgendamentos((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: novoStatus } : item
        )
      );
    } catch (error) {
      alert("Erro ao atualizar status. Tente novamente.");
    }
  };

  // Cria um novo agendamento
  const handleCriar = async (e) => {
    e.preventDefault();

    // Validação simples
    if (
      !novoAgendamento.nome ||
      !novoAgendamento.data ||
      !novoAgendamento.horario
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/agendamentos`,
        novoAgendamento
      );

      // Adiciona o novo item à lista e fecha o modal
      setAgendamentos([...agendamentos, response.data]);
      setShowModal(false);
    } catch (error) {
      alert("Erro ao criar agendamento.");
    }
  };

  // Remove um agendamento
  const deletarAgendamento = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await axios.delete(`${API_BASE_URL}/agendamentos/${id}`);
        setAgendamentos((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        alert("Erro ao deletar agendamento.");
      }
    }
  };

  // Atualiza o formulário quando o usuário troca o serviço no Select
  const mudarServico = (e) => {
    const nomeServico = e.target.value;
    const servicoEncontrado = listaServicos.find((s) => s.nome === nomeServico);

    setNovoAgendamento((prev) => ({
      ...prev,
      servico: nomeServico,
      preco: servicoEncontrado ? `R$ ${servicoEncontrado.preco}` : "",
    }));
  };

  // =================================================================
  // 4. LÓGICA DE FILTROS E HELPERS
  // =================================================================

  // Filtra a lista baseado na busca (texto) e no status selecionado
  const agendamentosFiltrados = agendamentos.filter((item) => {
    const termo = busca.toLowerCase();

    const matchTexto =
      item.nome.toLowerCase().includes(termo) ||
      item.servico.toLowerCase().includes(termo);

    const matchStatus =
      filtroStatus === "Todos" || item.status === filtroStatus;

    return matchTexto && matchStatus;
  });

  // Alterna ciclicamente entre os status disponíveis para filtro
  const alternarFiltroStatus = () => {
    const opcoes = ["Todos", "Agendado", "Em Andamento", "Concluído"];
    const indexAtual = opcoes.indexOf(filtroStatus);
    const proximoIndex = (indexAtual + 1) % opcoes.length;
    setFiltroStatus(opcoes[proximoIndex]);
  };

  // Retorna estilos dinâmicos baseados no status
  const getStatusStyle = (status) => {
    switch (status) {
      case "Agendado":
        return { borderColor: "#7380ec", color: "#7380ec" };
      case "Em Andamento":
        return { borderColor: "#ffbb55", color: "#ffbb55" };
      case "Concluído":
        return { borderColor: "#41f1b6", color: "#41f1b6" };
      default:
        return {};
    }
  };

  // =================================================================
  // 5. RENDERIZAÇÃO (JSX)
  // =================================================================
  return (
    <div className="page-content fade-in">
      {/* --- HEADER --- */}
      <header className="page-header">
        <div>
          <h1>Agendamentos</h1>
          <p className="subtitle">Gerencie todos os agendamentos</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Novo Agendamento
        </button>
      </header>

      {/* --- BARRA DE FILTROS --- */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} color="#a0a0a0" />
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button
          className="btn-secondary"
          onClick={alternarFiltroStatus}
          style={{
            minWidth: "160px",
            justifyContent: "center",
            borderColor: filtroStatus !== "Todos" ? "#c0c0c0" : "",
          }}
        >
          <Filter size={18} />
          {filtroStatus === "Todos"
            ? "Todos os Status"
            : `Filtro: ${filtroStatus}`}
        </button>
      </div>

      {/* --- LISTAGEM DE AGENDAMENTOS --- */}
      <div className="schedule-list">
        <h3 className="section-title">
          {loading
            ? "Carregando..."
            : `Agendamentos (${agendamentosFiltrados.length})`}
        </h3>

        {agendamentosFiltrados.map((item) => (
          <div key={item.id} className="schedule-card">
            {/* Coluna 1: Cliente e Status */}
            <div className="client-section">
              <img src={item.avatar} alt="Avatar do Cliente" />
              <div>
                <h4>{item.nome}</h4>
                <select
                  className="status-select"
                  value={item.status}
                  style={getStatusStyle(item.status)}
                  onChange={(e) => atualizarStatus(item.id, e.target.value)}
                >
                  <option value="Agendado">Agendado</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>
            </div>

            {/* Coluna 2: Serviço */}
            <div className="info-section">
              <p className="service-name">✂️ {item.servico}</p>
            </div>

            {/* Coluna 3: Data e Hora */}
            <div className="time-section">
              <div className="time-row">
                <Calendar size={14} /> {item.data}
              </div>
              <div className="time-row highlight-time">
                <Clock size={14} /> {item.horario}
              </div>
            </div>

            {/* Coluna 4: Preço e Ações */}
            <div className="price-section">
              <h3>{item.preco}</h3>
              <button
                onClick={() => deletarAgendamento(item.id)}
                title="Excluir Agendamento"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#ff4444",
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {!loading && agendamentosFiltrados.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "2rem", color: "#888" }}>
            Nenhum agendamento encontrado.
          </p>
        )}
      </div>

      {/* --- MODAL DE NOVO AGENDAMENTO --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Novo Agendamento</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCriar}>
              <div className="form-group">
                <label>Nome do Cliente</label>
                <input
                  type="text"
                  className="dark-input"
                  value={novoAgendamento.nome}
                  onChange={(e) =>
                    setNovoAgendamento({
                      ...novoAgendamento,
                      nome: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    className="dark-input"
                    value={novoAgendamento.data}
                    onChange={(e) =>
                      setNovoAgendamento({
                        ...novoAgendamento,
                        data: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Horário</label>
                  <input
                    type="time"
                    className="dark-input"
                    value={novoAgendamento.horario}
                    onChange={(e) =>
                      setNovoAgendamento({
                        ...novoAgendamento,
                        horario: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Serviço</label>
                <select
                  className="dark-input"
                  value={novoAgendamento.servico}
                  onChange={mudarServico}
                >
                  {listaServicos.map((servico) => (
                    <option key={servico.id} value={servico.nome}>
                      {servico.nome} - R$ {servico.preco}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "1rem",
                }}
              >
                <Save size={18} /> Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agendamentos;
