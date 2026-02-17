/* ==========================================================================
   PROJETO: PRIDE BARBERS - BACKEND API
   DESCRIÇÃO: API REST com autenticação JWT
   AUTOR: Pride Barbers
   ========================================================================== */

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

/* --------------------------------------------------------------------------
   CONFIGURAÇÕES
-------------------------------------------------------------------------- */
const PORT = process.env.PORT || 3001;
const SECRET_KEY = "pride_barbers_secret_key";

/* --------------------------------------------------------------------------
   MIDDLEWARES
-------------------------------------------------------------------------- */
app.use(express.json());
app.use(cors());

/* --------------------------------------------------------------------------
   MOCK DATABASE (MEMÓRIA)
-------------------------------------------------------------------------- */
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

/* --------------------------------------------------------------------------
   MIDDLEWARE DE AUTENTICAÇÃO
-------------------------------------------------------------------------- */
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

/* --------------------------------------------------------------------------
   LOGIN
-------------------------------------------------------------------------- */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin" && password === "admin") {
    const token = jwt.sign({ role: "admin" }, SECRET_KEY, {
      expiresIn: "1h",
    });

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

/* --------------------------------------------------------------------------
   ROTAS PROTEGIDAS
-------------------------------------------------------------------------- */
app.get("/config", autenticarToken, (req, res) => {
  res.json(configuracoes);
});

app.put("/config", autenticarToken, (req, res) => {
  const { horarios, dadosBarbearia, perfil } = req.body;
  if (horarios) configuracoes.horarios = horarios;
  if (dadosBarbearia) configuracoes.dadosBarbearia = dadosBarbearia;
  if (perfil) configuracoes.perfil = perfil;

  res.json({ message: "Configurações atualizadas", configuracoes });
});

app.get("/agendamentos", autenticarToken, (req, res) => res.json(agendamentos));

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

app.get("/servicos", autenticarToken, (req, res) => res.json(servicos));

/* --------------------------------------------------------------------------
   START
-------------------------------------------------------------------------- */
app.listen(PORT, () => console.log(`🔥 Backend rodando na porta ${PORT}`));
