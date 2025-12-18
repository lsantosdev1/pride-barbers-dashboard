import { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  DollarSign,
  Users,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { Bar } from "react-chartjs-2";

// Constante para centralizar a URL da API
const API_BASE_URL = "https://pride-barbers-api.onrender.com";

function Relatorios() {
  // =================================================================
  // 1. ESTADOS (STATES)
  // =================================================================

  // Dados Brutos
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [horariosLoja, setHorariosLoja] = useState({
    abertura: "08:00",
    fechamento: "20:00",
  });

  // Controle de Interface
  const [filtro, setFiltro] = useState("total"); // Opções: 'hoje', 'semana', 'total'

  // Dados Processados (KPIs)
  const [metricas, setMetricas] = useState({
    faturamento: "0,00",
    totalClientes: 0,
    ticketMedio: "0,00",
    totalServicos: 0,
  });

  // Dados do Gráfico (Chart.js)
  const [graficoData, setGraficoData] = useState({
    labels: [],
    datasets: [],
  });

  // =================================================================
  // 2. EFEITOS (USEEFFECT)
  // =================================================================

  // Carrega os dados iniciais ao montar o componente
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Recalcula métricas sempre que os dados brutos ou filtros mudam
  useEffect(() => {
    calcularMetricasEGrafico();
  }, [todosAgendamentos, filtro, horariosLoja]);

  // =================================================================
  // 3. API E CARREGAMENTO DE DADOS
  // =================================================================

  const carregarDadosIniciais = async () => {
    try {
      // Busca agendamentos e configurações em paralelo para otimizar tempo
      const [resAgendamentos, resConfig] = await Promise.all([
        axios.get(`${API_BASE_URL}/agendamentos`),
        axios.get(`${API_BASE_URL}/config`),
      ]);

      setTodosAgendamentos(resAgendamentos.data);

      // Atualiza horário de funcionamento se vier do backend
      if (resConfig.data.horarios) {
        setHorariosLoja(resConfig.data.horarios);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do relatório:", error);
    }
  };

  // =================================================================
  // 4. LÓGICA DE NEGÓCIO (FILTROS E CÁLCULOS)
  // =================================================================

  const calcularMetricasEGrafico = () => {
    const hoje = new Date();

    // --- A. FILTRAGEM DE DATA ---
    const listaFiltrada = todosAgendamentos.filter((item) => {
      if (!item.data) return false;

      // Adiciona hora zerada para evitar problemas de fuso na conversão
      const dataItem = new Date(item.data + "T00:00:00");

      if (filtro === "hoje") {
        return dataItem.toDateString() === hoje.toDateString();
      }

      if (filtro === "semana") {
        // Calcula o intervalo da semana atual (Domingo a Sábado)
        const primeiroDia = new Date(hoje);
        primeiroDia.setDate(hoje.getDate() - hoje.getDay());
        primeiroDia.setHours(0, 0, 0, 0);

        const ultimoDia = new Date(primeiroDia);
        ultimoDia.setDate(primeiroDia.getDate() + 6);
        ultimoDia.setHours(23, 59, 59, 999);

        return dataItem >= primeiroDia && dataItem <= ultimoDia;
      }

      return true; // Retorna tudo se filtro for 'total'
    });

    // --- B. CÁLCULO DOS CARDS (KPIs) ---
    const totalFaturamento = listaFiltrada.reduce((acc, item) => {
      // Limpeza da string de preço (remove R$ e converte vírgula para ponto)
      const limpo = item.preco
        ? item.preco.toString().replace(/[^\d,]/g, "")
        : "0";
      const valor = parseFloat(limpo.replace(",", "."));

      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

    const ticketMedio =
      listaFiltrada.length > 0 ? totalFaturamento / listaFiltrada.length : 0;

    setMetricas({
      faturamento: totalFaturamento.toFixed(2).replace(".", ","),
      totalClientes: listaFiltrada.length,
      ticketMedio: ticketMedio.toFixed(2).replace(".", ","),
      totalServicos: listaFiltrada.length,
    });

    // --- C. GERAÇÃO DO GRÁFICO DINÂMICO ---

    // 1. Define intervalo de horas baseado na configuração da loja
    const inicio = parseInt(horariosLoja.abertura.split(":")[0]);
    let fim = parseInt(horariosLoja.fechamento.split(":")[0]);
    if (fim < inicio) fim = 23; // Fallback de segurança

    // 2. Gera as labels (eixo X) e zera o contador
    const labelsDinamicas = [];
    const totalHoras = fim - inicio + 1;
    const contagemHorarios = Array(totalHoras).fill(0);

    for (let i = inicio; i <= fim; i++) {
      const horaFormatada = i < 10 ? `0${i}h` : `${i}h`;
      labelsDinamicas.push(horaFormatada);
    }

    // 3. Popula o gráfico com os dados filtrados
    listaFiltrada.forEach((item) => {
      if (item.horario) {
        const hora = parseInt(item.horario.split(":")[0]);

        // Só conta se estiver dentro do expediente configurado
        if (hora >= inicio && hora <= fim) {
          const indice = hora - inicio;
          if (contagemHorarios[indice] !== undefined) {
            contagemHorarios[indice] += 1;
          }
        }
      }
    });

    setGraficoData({
      labels: labelsDinamicas,
      datasets: [
        {
          label: "Clientes",
          data: contagemHorarios,
          backgroundColor: "#7380ec",
          borderRadius: 4,
          barThickness: 30,
        },
      ],
    });
  };

  const handleExportar = () => {
    window.print();
  };

  // Configurações visuais do Chart.js
  const optionsGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        ticks: { color: "#a0a0a0", stepSize: 1 },
        grid: { color: "#333" },
        beginAtZero: true,
      },
      x: { ticks: { color: "#a0a0a0" }, grid: { display: false } },
    },
  };

  // =================================================================
  // 5. RENDERIZAÇÃO (JSX)
  // =================================================================
  return (
    <div className="page-content fade-in">
      {/* --- HEADER --- */}
      <header className="page-header">
        <div>
          <h1>Relatórios</h1>
          <p className="subtitle">
            Análises e métricas de performance em tempo real
          </p>
        </div>
        <button className="btn-secondary" onClick={handleExportar}>
          <Download size={18} /> Exportar PDF
        </button>
      </header>

      {/* --- FILTROS DE DATA --- */}
      <div className="date-tabs">
        <button
          className={filtro === "hoje" ? "active" : ""}
          onClick={() => setFiltro("hoje")}
        >
          Hoje
        </button>
        <button
          className={filtro === "semana" ? "active" : ""}
          onClick={() => setFiltro("semana")}
        >
          Esta Semana
        </button>
        <button
          className={filtro === "total" ? "active" : ""}
          onClick={() => setFiltro("total")}
        >
          Total Geral
        </button>
      </div>

      {/* --- GRID DE KPIs --- */}
      <div className="analytics-grid" style={{ marginTop: "1.5rem" }}>
        {/* Card: Faturamento */}
        <div className="card kpi-card">
          <div className="kpi-info">
            <span>Faturamento</span>
            <h2>R$ {metricas.faturamento}</h2>
            <small className="positive">
              Período: {filtro === "total" ? "Geral" : filtro}
            </small>
          </div>
          <div className="kpi-icon">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Card: Clientes */}
        <div className="card kpi-card">
          <div className="kpi-info">
            <span>Clientes Atendidos</span>
            <h2>{metricas.totalClientes}</h2>
            <small className="positive">Agendamentos ativos</small>
          </div>
          <div className="kpi-icon">
            <Users size={24} />
          </div>
        </div>

        {/* Card: Ticket Médio */}
        <div className="card kpi-card">
          <div className="kpi-info">
            <span>Ticket Médio</span>
            <h2>R$ {metricas.ticketMedio}</h2>
            <small className="positive">Média por cliente</small>
          </div>
          <div className="kpi-icon">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Card: Volume de Serviços */}
        <div className="card kpi-card">
          <div className="kpi-info">
            <span>Serviços Realizados</span>
            <h2>{metricas.totalServicos}</h2>
            <small className="positive">Volume total</small>
          </div>
          <div className="kpi-icon">
            <BarChart2 size={24} />
          </div>
        </div>
      </div>

      {/* --- ÁREA DO GRÁFICO --- */}
      <div
        className="card"
        style={{ marginTop: "1.5rem", padding: "1.5rem", height: "300px" }}
      >
        <h3>
          Horários de Pico ({filtro === "total" ? "Histórico Geral" : filtro})
        </h3>
        <div style={{ width: "100%", height: "100%", paddingBottom: "20px" }}>
          {graficoData.labels.length > 0 ? (
            <Bar data={graficoData} options={optionsGrafico} />
          ) : (
            <p
              style={{ color: "#666", textAlign: "center", marginTop: "50px" }}
            >
              Carregando dados...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
