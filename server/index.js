/* ==========================================================================
   PROJETO: PRIDE BARBERS - BACKEND API
   DESCRIÇÃO: API REST com autenticação JWT
   ========================================================================== */

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

/* --- CONFIGURAÇÕES E MIDDLEWARES --- */
const PORT = process.env.PORT || 3001;
const SECRET_KEY = "pride_barbers_secret_key";

app.use(express.json());
app.use(cors());

/* --- MOCK DATABASE (DADOS EM MEMÓRIA) --- */
let configuracoes = {
  horarios: { abertura: "09:00", fechamento: "20:00" },
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

let agendamentos = [
  {
    id: 1,
    nome: "João Silva",
    servico: "Corte + Barba",
    status: "Agendado",
    horario: "09:00",
    data: "2025-07-30",
    preco: "R$ 55,00",
    avatar:
      "https://ui-avatars.com/api/?name=Joao+Silva&background=0D8ABC&color=fff",
  },
];

let servicos = [
  { id: 1, nome: "Corte Masculino", preco: "35,00" },
  { id: 2, nome: "Barba", preco: "25,00" },
  { id: 3, nome: "Corte + Barba", preco: "60,00" },
  { id: 4, nome: "Platinado", preco: "80,00" },
];

/* --- MIDDLEWARE DE AUTENTICAÇÃO --- */
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Token não informado" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Token inválido ou expirado" });
    req.user = decoded;
    next();
  });
}

/* --- ROTA PÚBLICA: LOGIN --- */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin" && password === "admin") {
    const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({
      auth: true,
      token,
      user: {
        nome: configuracoes.perfil.nome,
        email: configuracoes.perfil.email,
      },
    });
  }
  res.status(401).json({ auth: false, message: "Credenciais inválidas" });
});

/* --- CRUD: CONFIGURAÇÕES (Protegidas) --- */
app.get("/config", autenticarToken, (req, res) => res.json(configuracoes));

app.put("/config", autenticarToken, (req, res) => {
  const { horarios, dadosBarbearia, perfil } = req.body;
  if (horarios) configuracoes.horarios = horarios;
  if (dadosBarbearia) configuracoes.dadosBarbearia = dadosBarbearia;
  if (perfil) configuracoes.perfil = perfil;
  res.json({ message: "Configurações atualizadas", configuracoes });
});

// LISTAR TODOS
app.get("/agendamentos", autenticarToken, (req, res) => {
  res.json(agendamentos);
});

// BUSCAR POR ID
app.get("/agendamentos/:id", autenticarToken, (req, res) => {
  const { id } = req.params;
  const agendamento = agendamentos.find((a) => a.id == id);

  if (!agendamento)
    return res.status(404).json({ message: "Agendamento não encontrado" });

  res.json(agendamento);
});

// CRIAR
app.post("/agendamentos", autenticarToken, (req, res) => {
  const novo = {
    id: Date.now(),
    status: "Agendado",
    ...req.body,
    avatar: `https://ui-avatars.com/api/?name=${req.body.nome.replace(
      " ",
      "+",
    )}&background=random`,
  };

  agendamentos.push(novo);
  res.status(201).json(novo);
});

// ATUALIZAR
app.put("/agendamentos/:id", autenticarToken, (req, res) => {
  const { id } = req.params;
  const index = agendamentos.findIndex((a) => a.id == id);

  if (index === -1)
    return res.status(404).json({ message: "Agendamento não encontrado" });

  agendamentos[index] = { ...agendamentos[index], ...req.body };

  res.json(agendamentos[index]);
});

// DELETAR
app.delete("/agendamentos/:id", autenticarToken, (req, res) => {
  const { id } = req.params;

  const existe = agendamentos.some((a) => a.id == id);

  if (!existe)
    return res.status(404).json({ message: "Agendamento não encontrado" });

  agendamentos = agendamentos.filter((a) => a.id != id);

  res.json({ message: "Agendamento removido com sucesso" });
});

// LISTAR
app.get("/servicos", autenticarToken, (req, res) => {
  res.json(servicos);
});

// BUSCAR POR ID
app.get("/servicos/:id", autenticarToken, (req, res) => {
  const { id } = req.params;
  const servico = servicos.find((s) => s.id == id);

  if (!servico)
    return res.status(404).json({ message: "Serviço não encontrado" });

  res.json(servico);
});

// CRIAR
app.post("/servicos", autenticarToken, (req, res) => {
  const novoServico = {
    id: Date.now(),
    ...req.body,
  };

  servicos.push(novoServico);
  res.status(201).json(novoServico);
});

// ATUALIZAR
app.put("/servicos/:id", autenticarToken, (req, res) => {
  const { id } = req.params;
  const index = servicos.findIndex((s) => s.id == id);

  if (index === -1)
    return res.status(404).json({ message: "Serviço não encontrado" });

  servicos[index] = { ...servicos[index], ...req.body };

  res.json(servicos[index]);
});

// DELETAR
app.delete("/servicos/:id", autenticarToken, (req, res) => {
  const { id } = req.params;

  const existe = servicos.some((s) => s.id == id);

  if (!existe)
    return res.status(404).json({ message: "Serviço não encontrado" });

  servicos = servicos.filter((s) => s.id != id);

  res.json({ message: "Serviço removido com sucesso" });
});

app.listen(PORT, () => console.log(`🔥 Backend rodando na porta ${PORT}`));
