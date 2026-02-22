import { useState, useEffect } from "react";
import api from "../api";
import {
  Calendar,
  Clock,
  Scissors,
  User,
  Send,
  CheckCircle,
} from "lucide-react";

function Agendar() {
  // --- ESTADOS ---
  const [listaServicos, setListaServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [dadosAgendamento, setDadosAgendamento] = useState({
    nome: "",
    servico: "",
    data: "",
    horario: "",
    preco: "",
  });

  // --- CARREGAR SERVIÇOS DISPONÍVEIS ---
  useEffect(() => {
    const buscarServicos = async () => {
      try {
        // Nota: Certifique-se de que criou a rota /public/servicos no backend
        const response = await api.get("/public/servicos");
        setListaServicos(response.data);

        // Define o primeiro serviço como padrão
        if (response.data.length > 0) {
          setDadosAgendamento((prev) => ({
            ...prev,
            servico: response.data[0].nome,
            preco: `R$ ${response.data[0].preco}`,
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      }
    };
    buscarServicos();
  }, []);

  // --- LÓGICA DE SELEÇÃO DE SERVIÇO ---
  const handleMudarServico = (e) => {
    const nomeServico = e.target.value;
    const servico = listaServicos.find((s) => s.nome === nomeServico);
    setDadosAgendamento({
      ...dadosAgendamento,
      servico: nomeServico,
      preco: servico ? `R$ ${servico.preco}` : "",
    });
  };

  // --- ENVIAR AGENDAMENTO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envia para a rota pública que criamos no Passo 1
      await api.post("/public/agendamentos", dadosAgendamento);
      setSucesso(true);
    } catch (error) {
      alert("Desculpe, ocorreu um erro ao agendar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div
        className="page-content fade-in"
        style={{ textAlign: "center", paddingTop: "4rem" }}
      >
        <CheckCircle
          size={80}
          color="#41f1b6"
          style={{ marginBottom: "1rem" }}
        />
        <h1>Agendamento Confirmado!</h1>
        <p className="subtitle">
          Obrigado, {dadosAgendamento.nome}. Esperamos você em breve!
        </p>
        <button
          className="btn-primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: "2rem" }}
        >
          Fazer novo agendamento
        </button>
      </div>
    );
  }

  return (
    <div className="page-content fade-in">
      <header
        className="page-header"
        style={{ justifyContent: "center", textAlign: "center" }}
      >
        <div>
          <h1>Marque seu Horário</h1>
          <p className="subtitle">Pride Barbers - Estilo e Atitude</p>
        </div>
      </header>

      <div
        className="modal-content"
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <User size={14} /> Seu Nome
            </label>
            <input
              type="text"
              className="dark-input"
              placeholder="Digite seu nome completo"
              value={dadosAgendamento.nome}
              onChange={(e) =>
                setDadosAgendamento({
                  ...dadosAgendamento,
                  nome: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Calendar size={14} /> Data
              </label>
              <input
                type="date"
                className="dark-input"
                value={dadosAgendamento.data}
                onChange={(e) =>
                  setDadosAgendamento({
                    ...dadosAgendamento,
                    data: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>
                <Clock size={14} /> Horário
              </label>
              <input
                type="time"
                className="dark-input"
                value={dadosAgendamento.horario}
                onChange={(e) =>
                  setDadosAgendamento({
                    ...dadosAgendamento,
                    horario: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <Scissors size={14} /> Escolha o Serviço
            </label>
            <select
              className="dark-input"
              value={dadosAgendamento.servico}
              onChange={handleMudarServico}
            >
              {listaServicos.map((s) => (
                <option key={s._id} value={s.nome}>
                  {s.nome} - R$ {s.preco}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              textAlign: "center",
              margin: "1.5rem 0",
              padding: "1rem",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
            }}
          >
            <span style={{ color: "#888", fontSize: "0.9rem" }}>
              Valor Estimado:
            </span>
            <h2 style={{ color: "#41f1b6", margin: "5px 0" }}>
              {dadosAgendamento.preco}
            </h2>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? (
              "Processando..."
            ) : (
              <>
                <Send size={18} /> Confirmar Agendamento
              </>
            )}
          </button>
        </form>
      </div>
      {/* Espaçador para empurrar o footer para baixo em telas grandes */}
      <div style={{ flex: 1 }}></div>

      <footer
        style={{
          marginTop: "2rem",
          textAlign: "center",
          padding: "1rem",
          width: "100%",
          zIndex: 10,
        }}
      >
        <p style={{ fontSize: "0.8rem", color: "#666" }}>
          © 2026 Pride Barbers |
          <a
            href="/login"
            style={{
              color: "#41f1b6",
              marginLeft: "5px",
              textDecoration: "none",
            }}
          >
            Acesso Administrativo
          </a>
        </p>
      </footer>
    </div>
  );
}

export default Agendar;
