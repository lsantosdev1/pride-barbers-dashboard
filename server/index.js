/* ==========================================================================
   PROJETO: PRIDE BARBERS - BACKEND API
   DESCRIÇÃO: API REST com MongoDB Atlas e Autenticação JWT
   ========================================================================== */

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();

/* --- CONFIGURAÇÕES --- */
const PORT = process.env.PORT || 3001;
const SECRET_KEY = "pride_barbers_secret_key";

// Use a variável de ambiente no Render ou o link direto para teste local
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "mongodb+srv://lsantos2152_db_user:qhRvWdnje49LtlLU@cluster0.mskhodx.mongodb.net/pride_barbers?retryWrites=true&w=majority";

/* --- CONEXÃO MONGODB --- */
mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("✅ Conectado com sucesso ao MongoDB Atlas!"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

/* --- MIDDLEWARES --- */
app.use(express.json());
app.use(cors());

/* --- MODELOS DE DADOS (SCHEMAS) --- */

// Schema de Configurações
const configuracaoSchema = new mongoose.Schema({
  horarios: { abertura: String, fechamento: String },
  dadosBarbearia: {
    nome: String,
    endereco: String,
    telefone: String,
    email: String,
  },
  perfil: { nome: String, email: String },
});
const Configuracao = mongoose.model("Configuracao", configuracaoSchema);

// Schema de Agendamentos
const agendamentoSchema = new mongoose.Schema({
  nome: String,
  servico: String,
  status: { type: String, default: "Agendado" },
  horario: String,
  data: String,
  preco: String,
  avatar: String,
});
const Agendamento = mongoose.model("Agendamento", agendamentoSchema);

// Schema de Serviços
const servicoSchema = new mongoose.Schema({
  nome: String,
  preco: String,
});
const Servico = mongoose.model("Servico", servicoSchema);

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
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Login fixo conforme seu projeto original
  if (email === "admin" && password === "admin") {
    const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "1h" });

    // Busca as configurações atuais para retornar o nome do perfil
    const config = (await Configuracao.findOne()) || {
      perfil: { nome: "Mestre Barbeiro", email: "admin@admin.com" },
    };

    return res.json({
      auth: true,
      token,
      user: {
        nome: config.perfil.nome,
        email: config.perfil.email,
      },
    });
  }
  res.status(401).json({ auth: false, message: "Credenciais inválidas" });
});

/* --- CRUD: CONFIGURAÇÕES --- */
app.get("/config", autenticarToken, async (req, res) => {
  let config = await Configuracao.findOne();
  if (!config) {
    // Se não existir, cria uma configuração padrão
    config = await Configuracao.create({
      horarios: { abertura: "09:00", fechamento: "20:00" },
      dadosBarbearia: {
        nome: "Pride Barbers",
        endereco: "Rua das Navais, 123",
        telefone: "(11) 99999-0000",
        email: "contato@pridebarbers.com",
      },
      perfil: { nome: "Mestre Barbeiro", email: "admin@admin.com" },
    });
  }
  res.json(config);
});

app.put("/config", autenticarToken, async (req, res) => {
  const config = await Configuracao.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
  });
  res.json({ message: "Configurações atualizadas", configuracoes: config });
});

/* --- CRUD: AGENDAMENTOS --- */

// LISTAR TODOS
app.get("/agendamentos", autenticarToken, async (req, res) => {
  const lista = await Agendamento.find();
  res.json(lista);
});

// CRIAR
app.post("/agendamentos", autenticarToken, async (req, res) => {
  const novo = new Agendamento({
    ...req.body,
    avatar: `https://ui-avatars.com/api/?name=${req.body.nome.replace(" ", "+")}&background=random`,
  });
  await novo.save();
  res.status(201).json(novo);
});

// ATUALIZAR
app.put("/agendamentos/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;
  const atualizado = await Agendamento.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!atualizado)
    return res.status(404).json({ message: "Agendamento não encontrado" });
  res.json(atualizado);
});

// DELETAR
app.delete("/agendamentos/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;
  const deletado = await Agendamento.findByIdAndDelete(id);

  if (!deletado)
    return res.status(404).json({ message: "Agendamento não encontrado" });
  res.json({ message: "Agendamento removido com sucesso" });
});

/* --- CRUD: SERVIÇOS --- */

// LISTAR
app.get("/servicos", autenticarToken, async (req, res) => {
  const lista = await Servico.find();
  res.json(lista);
});

// CRIAR
app.post("/servicos", autenticarToken, async (req, res) => {
  const novoServico = await Servico.create(req.body);
  res.status(201).json(novoServico);
});

// ATUALIZAR
app.put("/servicos/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;
  const atualizado = await Servico.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!atualizado)
    return res.status(404).json({ message: "Serviço não encontrado" });
  res.json(atualizado);
});

// DELETAR
app.delete("/servicos/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;
  const deletado = await Servico.findByIdAndDelete(id);

  if (!deletado)
    return res.status(404).json({ message: "Serviço não encontrado" });
  res.json({ message: "Serviço removido com sucesso" });
});

/* --- INICIALIZAÇÃO --- */
app.listen(PORT, () =>
  console.log(`🔥 Backend Pride Barbers rodando na porta ${PORT}`),
);
