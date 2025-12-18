/* ==========================================================================
   PROJETO: PRIDE BARBERS - BACKEND API
   DESCRIÇÃO: Servidor Express simples simulando uma API RESTful.
   AUTOR: [Seu Nome]
   NOTA: Utiliza persistência em memória (dados resetam ao reiniciar).
   ========================================================================== */

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// --- MIDDLEWARES ---
app.use(express.json()); // Habilita leitura de JSON no corpo das requisições
app.use(cors()); // Permite que o Frontend (React) acesse este servidor

// Chave secreta para assinar os Tokens JWT
const SECRET_KEY = "pride_barbers_secret_key";
const PORT = 3001;

/* ==========================================================================
   1. BANCO DE DADOS EM MEMÓRIA (MOCK DATA)
   Estes dados são voláteis e servem para prototipagem rápida.
   ========================================================================== */

// A. Configurações Globais da Loja e Perfil do Admin
let configuracoes = {
  horarios: {
    abertura: "09:00",
    fechamento: "20:00",
  },
  dadosBarbearia: {
    nome: "Pride Barbers",
    endereco: "Rua das Navais, 123 - Centro",
    telefone: "(11) 99999-0000",
    email: "contato@pridebarbers.com",
  },
  perfil: {
    nome: "Mestre Barbeiro",
    email: "admin@admin.com",
  },
};

// B. Lista de Agendamentos (Inicia com um exemplo)
let agendamentos = [
  {
    id: 1,
    nome: "João Silva",
    servico: "Corte + Barba",
    status: "Agendado",
    horario: "09:00",
    data: "2025-07-30", // Formato ISO yyyy-mm-dd
    preco: "R$ 55,00",
    avatar:
      "https://ui-avatars.com/api/?name=Joao+Silva&background=0D8ABC&color=fff",
  },
];

// C. Catálogo de Serviços e Preços
let servicos = [
  { id: 1, nome: "Corte Masculino", preco: "35,00" },
  { id: 2, nome: "Barba", preco: "25,00" },
  { id: 3, nome: "Corte + Barba", preco: "60,00" },
  { id: 4, nome: "Platinado", preco: "80,00" },
];

/* ==========================================================================
   2. AUTENTICAÇÃO E SEGURANÇA
   ========================================================================== */

/**
 * Rota de Login (POST /login)
 * Gera um token JWT.
 * ATUALIZAÇÃO: Permite login vazio (sem senha) para facilitar testes.
 */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // LÓGICA DE LOGIN SEM SENHA
  // Se os campos vierem vazios (ou se o usuário digitar o admin padrão), libera o acesso.
  if (
    (email === "" && password === "") ||
    (email === "admin@admin.com" && password === "123456")
  ) {
    // Criação do Token com validade de 1 hora
    const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "1h" });

    return res.json({
      auth: true,
      token: token,
      user: {
        nome: configuracoes.perfil.nome, // Pega o nome atualizado das configurações
        avatar: `https://ui-avatars.com/api/?name=${configuracoes.perfil.nome.replace(
          " ",
          "+"
        )}`,
      },
    });
  }

  return res.status(401).json({ message: "Login inválido!" });
});

/* ==========================================================================
   3. ROTAS DE CONFIGURAÇÃO (APP STATE)
   ========================================================================== */

// Busca dados iniciais da loja (usado no carregamento do Dashboard)
app.get("/config", (req, res) => {
  res.json(configuracoes);
});

// Atualiza configurações globais (Horários, Dados da Loja e Perfil)
app.put("/config", (req, res) => {
  const { horarios, dadosBarbearia, perfil } = req.body;

  // Atualiza apenas os campos que foram enviados no corpo da requisição
  if (horarios) configuracoes.horarios = horarios;
  if (dadosBarbearia) configuracoes.dadosBarbearia = dadosBarbearia;
  if (perfil) configuracoes.perfil = perfil;

  console.log("✅ Configurações atualizadas com sucesso.");

  res.json({
    message: "Configurações salvas!",
    dados: configuracoes,
  });
});

/* ==========================================================================
   4. ROTAS DE AGENDAMENTOS (CRUD)
   ========================================================================== */

// Listar todos os agendamentos
app.get("/agendamentos", (req, res) => res.json(agendamentos));

// Criar novo agendamento
app.post("/agendamentos", (req, res) => {
  const { nome, servico, horario, data, preco } = req.body;

  const novoAgendamento = {
    id: Date.now(), // Gera um ID único baseado no timestamp
    nome,
    servico,
    status: "Agendado", // Status padrão inicial
    horario,
    data,
    preco,
    // Gera um avatar aleatório baseado no nome do cliente
    avatar: `https://ui-avatars.com/api/?name=${nome.replace(
      " ",
      "+"
    )}&background=random`,
  };

  agendamentos.push(novoAgendamento);
  res.status(201).json(novoAgendamento);
});

// Atualizar status do agendamento (Ex: Agendado -> Concluído)
app.put("/agendamentos/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const index = agendamentos.findIndex((a) => a.id == id);

  if (index !== -1) {
    agendamentos[index].status = status;
    res.json(agendamentos[index]);
  } else {
    res.status(404).json({ message: "Agendamento não encontrado." });
  }
});

// Excluir agendamento
app.delete("/agendamentos/:id", (req, res) => {
  const { id } = req.params;
  agendamentos = agendamentos.filter((a) => a.id != id);
  res.json({ message: "Agendamento removido com sucesso." });
});

/* ==========================================================================
   5. ROTAS DE SERVIÇOS (CATÁLOGO)
   ========================================================================== */

// Listar serviços
app.get("/servicos", (req, res) => {
  res.json(servicos);
});

// Adicionar novo serviço
app.post("/servicos", (req, res) => {
  const { nome, preco } = req.body;
  const novoServico = { id: Date.now(), nome, preco };

  servicos.push(novoServico);
  res.status(201).json(novoServico);
});

// Editar serviço existente
app.put("/servicos/:id", (req, res) => {
  const { id } = req.params;
  const { nome, preco } = req.body;

  servicos = servicos.map((s) => (s.id == id ? { ...s, nome, preco } : s));
  res.json({ message: "Serviço atualizado." });
});

// Remover serviço
app.delete("/servicos/:id", (req, res) => {
  const { id } = req.params;
  servicos = servicos.filter((s) => s.id != id);
  res.json({ message: "Serviço removido." });
});

/* ==========================================================================
   6. INICIALIZAÇÃO DO SERVIDOR
   ========================================================================== */
app.listen(PORT, () => {
  console.log(`🔥 Servidor Backend rodando na porta ${PORT}`);
});
