import { useState, useEffect } from "react";
import api from "../api";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  Scissors,
  User,
  Send,
  CheckCircle,
} from "lucide-react";

function Agendar() {
  const [nomesServicos, setNomesServicos] = useState([]);
  const [barbeirosDisponiveis, setBarbeirosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [dadosAgendamento, setDadosAgendamento] = useState({
    nome: "",
    servico: "",
    barbeiroId: "",
    barbeiroNome: "",
    data: "",
    horario: "",
    preco: "",
  });

  // 1. Busca os serviços disponíveis
  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get("/public/servicos-gerais");
        setNomesServicos(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar serviços");
      }
    };
    carregar();
  }, []);

  // 2. Quando muda o serviço, busca barbeiros
  const handleMudarServico = async (e) => {
    const nomeS = e.target.value;
    setDadosAgendamento({
      ...dadosAgendamento,
      servico: nomeS,
      barbeiroId: "",
      preco: "",
    });

    if (nomeS) {
      try {
        const res = await api.get(
          `/public/barbeiros-por-servico?nomeServico=${encodeURIComponent(nomeS)}`,
        );
        setBarbeirosDisponiveis(res.data || []);
      } catch (err) {
        setBarbeirosDisponiveis([]);
      }
    }
  };

  // 3. Quando muda o barbeiro, define o preço
  const handleMudarBarbeiro = (e) => {
    const id = e.target.value;
    const b = barbeirosDisponiveis.find((x) => x.barbeiroId === id);
    if (b) {
      setDadosAgendamento({
        ...dadosAgendamento,
        barbeiroId: id,
        barbeiroNome: b.barbeiroNome,
        preco: `R$ ${b.preco}`,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/public/agendamentos", dadosAgendamento);

      // --- TOAST DE SUCESSO ---
      toast.success("Horário agendado com sucesso! ✂️", {
        duration: 5000,
      });

      setSucesso(true);
    } catch (error) {
      // Verifica se o servidor enviou uma resposta com erro
      if (error.response && error.response.data) {
        const { message, sugestoes } = error.response.data;

        // Se houver sugestões de horários (conflito de agenda)
        if (sugestoes && sugestoes.length > 0) {
          const livres = sugestoes.join(", ");

          // --- TOAST DE ERRO COM SUGESTÕES ---
          toast.error(`${message} Sugestões: ${livres}`, {
            duration: 6000,
          });
        } else {
          // --- TOAST DE ERRO (Mês bloqueado, data passada, etc) ---
          toast.error(message);
        }
      } else {
        // Caso seja um erro de conexão ou algo desconhecido
        toast.error("Erro ao processar agendamento. Tente novamente.");
      }
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
        <p className="subtitle">Obrigado, {dadosAgendamento.nome}!</p>
        <button
          className="btn-primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: "2rem" }}
        >
          Voltar
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
        style={{ maxWidth: "500px", margin: "0 auto" }}
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
              required
              onChange={(e) =>
                setDadosAgendamento({
                  ...dadosAgendamento,
                  nome: e.target.value,
                })
              }
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
                required
                onChange={(e) =>
                  setDadosAgendamento({
                    ...dadosAgendamento,
                    data: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>
                <Clock size={14} /> Horário
              </label>
              <input
                type="time"
                className="dark-input"
                required
                onChange={(e) =>
                  setDadosAgendamento({
                    ...dadosAgendamento,
                    horario: e.target.value,
                  })
                }
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
              required
            >
              <option value="">Selecione o serviço...</option>
              {nomesServicos.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <User size={14} /> Escolha o Barbeiro
            </label>
            <select
              className="dark-input"
              value={dadosAgendamento.barbeiroId}
              onChange={handleMudarBarbeiro}
              required
              disabled={!dadosAgendamento.servico}
            >
              <option value="">Selecione o barbeiro...</option>
              {barbeirosDisponiveis.map((b) => (
                <option key={b.barbeiroId} value={b.barbeiroId}>
                  {b.barbeiroNome}
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
              {dadosAgendamento.preco || "R$ 0,00"}
            </h2>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !dadosAgendamento.barbeiroId}
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
      {/* --- RODAPÉ ADMINISTRATIVO RESTAURADO --- */}
      <footer
        style={{ marginTop: "2rem", textAlign: "center", padding: "1rem" }}
      >
        <p style={{ fontSize: "0.8rem", color: "#666" }}>
          © 2026 Pride Barbers |
          <a
            href="/login"
            style={{
              color: "#41f1b6",
              marginLeft: "5px",
              textDecoration: "none",
              fontWeight: "500",
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
