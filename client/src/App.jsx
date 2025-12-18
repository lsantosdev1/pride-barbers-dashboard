/* ==========================================================================
   PROJETO: PRIDE BARBERS DASHBOARD
   ARQUIVO: App.jsx
   DESCRIÇÃO: Componente raiz. Gerencia rotas, autenticação e estado global.
   ========================================================================== */

// 1. Hooks e Bibliotecas React
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// 2. Requisições HTTP
import axios from "axios";

// 3. Biblioteca de Gráficos (Chart.js)
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

// 4. Componentes Globais
import Sidebar from "./components/Sidebar";
import HaircutTimer from "./components/HaircutTimer";
import Login from "./Login";

// 5. Páginas
import Agendamentos from "./pages/Agendamentos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";

// 6. Estilos
import "./App.css";

// --- CONFIGURAÇÕES GERAIS ---
const API_BASE_URL = "https://pride-barbers-api.onrender.com";

// Registro dos módulos do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/* ==========================================================================
   COMPONENTE: DASHBOARD HOME
   Nota: Em projetos maiores, este componente ficaria em /pages/Dashboard.jsx
   ========================================================================== */
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
      // Busca dados em paralelo (Performance)
      const [resAgendamentos, resConfig] = await Promise.all([
        axios.get(`${API_BASE_URL}/agendamentos`),
        axios.get(`${API_BASE_URL}/config`),
      ]);

      const lista = resAgendamentos.data;
      const config = resConfig.data;

      // 1. Calcula Faturamento Total
      const totalFaturamento = lista.reduce((acc, item) => {
        const apenasNumeros = item.preco
          ? item.preco.toString().replace(/[^\d,]/g, "")
          : "0";
        const valorNumerico = parseFloat(apenasNumeros.replace(",", "."));
        return acc + (isNaN(valorNumerico) ? 0 : valorNumerico);
      }, 0);

      // 2. Lógica do Gráfico (Horários Dinâmicos)
      let inicio = 8;
      let fim = 20;

      if (config.horarios) {
        inicio = parseInt(config.horarios.abertura.split(":")[0]);
        fim = parseInt(config.horarios.fechamento.split(":")[0]);
      }
      if (fim < inicio) fim = 23; // Segurança contra horários inválidos

      // Gera as colunas do gráfico (Eixo X)
      const novasLabels = [];
      const totalHoras = fim - inicio + 1;
      const contagemHorarios = Array(totalHoras).fill(0);

      for (let i = inicio; i <= fim; i++) {
        novasLabels.push(i < 10 ? `0${i}h` : `${i}h`);
      }

      // Preenche os dados (Eixo Y)
      lista.forEach((item) => {
        if (!item.horario) return;
        const horaAgendamento = parseInt(item.horario.split(":")[0]);

        // Verifica se está dentro do expediente
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

  // --- CONFIGURAÇÃO VISUAL DO GRÁFICO ---
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

  // --- RENDERIZAÇÃO ---
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
        {/* Coluna Esquerda: KPIs */}
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

        {/* Coluna Direita: Cronômetro */}
        <HaircutTimer />

        {/* Área Inferior: Gráfico */}
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

/* ==========================================================================
   COMPONENTE: LAYOUT PRINCIPAL
   Estrutura fixa (Sidebar + Conteúdo) para usuários logados.
   ========================================================================== */
function MainLayout({ handleLogout, user, atualizarUsuario }) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar recebe dados do usuário dinâmico */}
      <Sidebar handleLogout={handleLogout} user={user} />
      <main>
        {/* Outlet passa a função de atualizar perfil para as páginas filhas */}
        <Outlet context={{ atualizarUsuario }} />
      </main>
    </div>
  );
}

/* ==========================================================================
   COMPONENTE: APP (ROOT)
   Gerencia Rotas, Autenticação e Estado Global do Usuário.
   ========================================================================== */
function App() {
  // Estado de Autenticação (Persistência via LocalStorage)
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Estado Global do Usuário (Nome/Email/Avatar)
  const [user, setUser] = useState({
    nome: "Carregando...",
    email: "...",
    avatar: "https://ui-avatars.com/api/?name=User",
  });

  // --- BUSCA DADOS DO USUÁRIO ---
  const carregarUsuario = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/config`);
      if (res.data.perfil) {
        setUser({
          nome: res.data.perfil.nome,
          email: res.data.perfil.email,
          avatar: `https://ui-avatars.com/api/?name=${res.data.perfil.nome.replace(
            " ",
            "+"
          )}&background=random`,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar usuário sidebar", error);
    }
  };

  // Carrega usuário ao iniciar o App (se houver token)
  useEffect(() => {
    if (token) carregarUsuario();
  }, [token]);

  // Função de Logout
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  // --- RENDERIZAÇÃO DAS ROTAS ---
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública: Login */}
        <Route
          path="/"
          element={
            !token ? (
              <Login setToken={setToken} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* Rotas Protegidas (Requer Token) */}
        {token && (
          <Route
            element={
              <MainLayout
                handleLogout={handleLogout}
                user={user}
                atualizarUsuario={carregarUsuario}
              />
            }
          >
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
        )}

        {/* Rota Fallback (404 redireciona para Login) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
