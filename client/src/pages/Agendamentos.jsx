import { useState, useEffect } from "react";
import api from "../api";
import toast from "react-hot-toast";
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

function Agendamentos() {
  // =================================================================
  // 1. ESTADOS (STATES)
  // =================================================================
  const [agendamentos, setAgendamentos] = useState([]);
  const [listaServicos, setListaServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

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
      const [resAgendamentos, resServicos] = await Promise.all([
        api.get("/agendamentos"),
        api.get("/servicos"),
      ]);
      setAgendamentos(resAgendamentos.data);
      setListaServicos(resServicos.data);

      if (resServicos.data.length > 0) {
        const servicoPadrao = resServicos.data[0];
        setNovoAgendamento((prev) => ({
          ...prev,
          servico: servicoPadrao.nome,
          preco: `R$ ${servicoPadrao.preco}`,
        }));
      }
      // ... lógica do serviço padrão
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao sincronizar dados com o servidor. 🔄");
    } finally {
      setLoading(false);
    }
  };

  // 1. ATUALIZAR STATUS (Concluir, Cancelar, etc.)
  const atualizarStatus = async (id, novoStatus) => {
    try {
      await api.put(`/agendamentos/${id}`, { status: novoStatus });

      setAgendamentos((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: novoStatus } : item,
        ),
      );

      // BALÃO DE SUCESSO
      toast.success(`Status alterado para ${novoStatus}! ✅`);
    } catch (error) {
      toast.error("Não foi possível atualizar o status.");
    }
  };

  // 2. CRIAR AGENDAMENTO (Via Modal no Dashboard)
  const handleCriar = async (e) => {
    e.preventDefault();

    if (
      !novoAgendamento.nome ||
      !novoAgendamento.data ||
      !novoAgendamento.horario
    ) {
      toast.error("Preencha todos os campos obrigatórios! ⚠️");
      return;
    }

    try {
      const agendamentoComAvatar = {
        ...novoAgendamento,
        avatar: `https://ui-avatars.com/api/?name=${novoAgendamento.nome.replace(" ", "+")}&background=random`,
      };

      const response = await api.post("/agendamentos", agendamentoComAvatar);

      setAgendamentos([...agendamentos, response.data]);
      setShowModal(false);

      // BALÃO DE SUCESSO
      toast.success("Agendamento criado com sucesso! ✂️");

      setNovoAgendamento({
        nome: "",
        servico: listaServicos[0]?.nome || "",
        data: "",
        horario: "",
        preco: listaServicos[0] ? `R$ ${listaServicos[0].preco}` : "",
      });
    } catch (error) {
      toast.error("Erro ao criar agendamento no painel.");
    }
  };

  // 3. DELETAR AGENDAMENTO
  const deletarAgendamento = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await api.delete(`/agendamentos/${id}`);
        setAgendamentos((prev) => prev.filter((item) => item._id !== id));

        // BALÃO DE SUCESSO
        toast.success("Agendamento removido! 🗑️");
      } catch (error) {
        toast.error("Erro ao deletar agendamento.");
      }
    }
  };

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
  const agendamentosFiltrados = agendamentos.filter((item) => {
    const termo = busca.toLowerCase();
    const matchTexto =
      item.nome.toLowerCase().includes(termo) ||
      item.servico.toLowerCase().includes(termo);
    const matchStatus =
      filtroStatus === "Todos" || item.status === filtroStatus;
    return matchTexto && matchStatus;
  });

  const alternarFiltroStatus = () => {
    const opcoes = ["Todos", "Agendado", "Em Andamento", "Concluído"];
    const indexAtual = opcoes.indexOf(filtroStatus);
    const proximoIndex = (indexAtual + 1) % opcoes.length;
    setFiltroStatus(opcoes[proximoIndex]);
  };

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
      <header className="page-header">
        <div>
          <h1>Agendamentos</h1>
          <p className="subtitle">Gerencie sua agenda pessoal</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Novo Agendamento
        </button>
      </header>

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

      <div className="schedule-list">
        <h3 className="section-title">
          {loading
            ? "Carregando..."
            : `Agendamentos (${agendamentosFiltrados.length})`}
        </h3>

        {agendamentosFiltrados.map((item) => (
          <div key={item._id} className="schedule-card">
            <div className="client-section">
              <img
                src={item.avatar || "https://via.placeholder.com/40"}
                alt="Avatar"
              />
              <div>
                <h4>{item.nome}</h4>
                <select
                  className="status-select"
                  value={item.status}
                  style={getStatusStyle(item.status)}
                  onChange={(e) => atualizarStatus(item._id, e.target.value)}
                >
                  <option value="Agendado">Agendado</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>
            </div>

            <div className="info-section">
              <p className="service-name">✂️ {item.servico}</p>
            </div>

            <div className="time-section">
              <div className="time-row">
                <Calendar size={14} /> {item.data}
              </div>
              <div className="time-row highlight-time">
                <Clock size={14} /> {item.horario}
              </div>
            </div>

            <div className="price-section">
              <h3>{item.preco}</h3>
              <button
                onClick={() => deletarAgendamento(item._id)}
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
            Nenhum agendamento encontrado para o seu perfil.
          </p>
        )}
      </div>

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
                  placeholder="Ex: João Silva"
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
                    <option key={servico._id} value={servico.nome}>
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
                <Save size={18} /> Salvar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agendamentos;
