import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import api from "../api";

// Configurações do Gráfico
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Componentes
import HaircutTimer from "../components/HaircutTimer";

// Registro dos módulos do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function DashboardHome() {
  // --- ESTADOS ---
  const [resumo, setResumo] = useState({
    totalClientes: 0,
    faturamento: "0,00",
    chartData: [],
    chartLabels: [],
  });

  // --- EFEITOS ---
  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  // --- LÓGICA DE DADOS ---
  const carregarDadosDashboard = async () => {
    try {
      const [resAgendamentos, resConfig] = await Promise.all([
        api.get("/agendamentos"),
        api.get("/config"),
      ]);

      const lista = resAgendamentos.data;
      const config = resConfig.data;

      // NOVA LÓGICA: Cálculo de faturamento mais robusto (limpa R$, pontos e vírgulas)
      const totalFaturamento = lista.reduce((acc, item) => {
        if (!item.preco) return acc;
        const apenasNumeros = item.preco.toString().replace(/[^\d,]/g, "");
        const valorNumerico = parseFloat(apenasNumeros.replace(",", "."));
        return acc + (isNaN(valorNumerico) ? 0 : valorNumerico);
      }, 0);

      // NOVA LÓGICA: Gráfico agora respeita os horários DO BARBEIRO logado
      let inicio = 8;
      let fim = 20;

      if (
        config.horarios &&
        config.horarios.abertura &&
        config.horarios.fechamento
      ) {
        inicio = parseInt(config.horarios.abertura.split(":")[0]);
        fim = parseInt(config.horarios.fechamento.split(":")[0]);
      }
      if (fim <= inicio) fim = 23;

      const novasLabels = [];
      const totalHoras = fim - inicio + 1;
      const contagemHorarios = Array(totalHoras).fill(0);

      for (let i = inicio; i <= fim; i++) {
        novasLabels.push(i < 10 ? `0${i}h` : `${i}h`);
      }

      lista.forEach((item) => {
        if (!item.horario) return;
        const horaAgendamento = parseInt(item.horario.split(":")[0]);
        if (horaAgendamento >= inicio && horaAgendamento <= fim) {
          const indice = horaAgendamento - inicio;
          contagemHorarios[indice]++;
        }
      });

      setResumo({
        totalClientes: lista.length,
        faturamento: totalFaturamento.toFixed(2).replace(".", ","),
        chartData: contagemHorarios,
        chartLabels: novasLabels,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    }
  };

  // --- CONFIGURAÇÃO DO GRÁFICO (Mantendo seu visual original) ---
  const dataGrafico = {
    labels: resumo.chartLabels,
    datasets: [
      {
        label: "Clientes",
        data: resumo.chartData,
        backgroundColor: "rgba(192, 192, 192, 0.8)",
        borderRadius: 4,
        barThickness: 25,
      },
    ],
  };

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

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <div>
          <h1>Visão Geral</h1>
          <p className="subtitle">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </header>

      <div className="analytics-grid dashboard-grid">
        <div className="kpi-group">
          <div className="card">
            <h3>Total Agendados</h3>
            <p style={{ fontSize: "2rem", color: "#fff" }}>
              {resumo.totalClientes}
            </p>
          </div>
          <div className="card">
            <h3>Faturamento Total</h3>
            <p style={{ fontSize: "1.8rem", color: "#41f1b6" }}>
              R$ {resumo.faturamento}
            </p>
          </div>
        </div>

        <HaircutTimer />

        <div className="card chart-area">
          {resumo.chartLabels.length > 0 ? (
            <Bar data={dataGrafico} options={optionsGrafico} />
          ) : (
            <p
              style={{ textAlign: "center", color: "#666", marginTop: "50px" }}
            >
              Carregando gráfico...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
