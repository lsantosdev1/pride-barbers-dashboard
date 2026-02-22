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

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "mongodb+srv://lsantos2152_db_user:qhRvWdnje49LtlLU@cluster0.mskhodx.mongodb.net/pride_barbers?retryWrites=true&w=majority";

/* --- CONEXÃO MONGODB --- */
mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("✅ Conectado com sucesso ao MongoDB Atlas!"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

/* --- MIDDLEWARES GERAIS --- */
app.use(express.json());
app.use(cors());

/* --- MODELOS DE DADOS (SCHEMAS) --- */

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

const servicoSchema = new mongoose.Schema({
  nome: String,
  preco: String,
});
const Servico = mongoose.model("Servico", servicoSchema);

/* --- MIDDLEWARE DE AUTENTICAÇÃO (Mover para cá para organização) --- */
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

/* --- ROTAS PÚBLICAS (Login e Clientes) --- */

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email === "admin" && password === "admin") {
    const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "1h" });
    const config = (await Configuracao.findOne()) || {
      perfil: { nome: "Mestre Barbeiro", email: "admin@admin.com" },
    };
    return res.json({
      auth: true,
      token,
      user: { nome: config.perfil.nome, email: config.perfil.email },
    });
  }
  res.status(401).json({ auth: false, message: "Credenciais inválidas" });
});

app.get("/public/servicos", async (req, res) => {
  try {
    // 1. Tenta buscar os serviços no banco
    let lista = await Servico.find();

    // 2. Se não encontrar nenhum (lista vazia), cria os serviços padrão
    if (lista.length === 0) {
      console.log("⚠️ Banco vazio! Criando serviços padrão...");
      const servicosPadrao = [
        { nome: "Corte Masculino", preco: "35,00" },
        { nome: "Barba", preco: "25,00" },
        { nome: "Corte + Barba", preco: "55,00" },
      ];
      await Servico.insertMany(servicosPadrao);
      // Busca novamente para garantir que agora temos os dados com os IDs do MongoDB
      lista = await Servico.find();
    }

    // 3. SÓ AGORA enviamos a resposta para o Frontend
    res.json(lista);
  } catch (error) {
    console.error("❌ Erro ao carregar serviços:", error);
    res.status(500).json({ message: "Erro ao carregar serviços" });
  }
});
app.post("/public/agendamentos", async (req, res) => {
  try {
    const novo = new Agendamento({
      ...req.body,
      status: "Agendado",
      avatar: `https://ui-avatars.com/api/?name=${(req.body.nome || "Cliente").replace(" ", "+")}&background=random`,
    });
    await novo.save();
    res.status(201).json(novo);
  } catch (error) {
    res.status(500).json({ message: "Erro ao realizar agendamento" });
  }
});

/* --- ROTAS PROTEGIDAS (Admin) --- */

app.get("/config", autenticarToken, async (req, res) => {
  let config = await Configuracao.findOne();
  if (!config) {
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

// CRUD AGENDAMENTOS
app.get("/agendamentos", autenticarToken, async (req, res) => {
  const lista = await Agendamento.find();
  res.json(lista);
});

app.post("/agendamentos", autenticarToken, async (req, res) => {
  const novo = new Agendamento({
    ...req.body,
    avatar: `https://ui-avatars.com/api/?name=${(req.body.nome || "Admin").replace(" ", "+")}&background=random`,
  });
  await novo.save();
  res.status(201).json(novo);
});

app.put("/agendamentos/:id", autenticarToken, async (req, res) => {
  const atualizado = await Agendamento.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  if (!atualizado)
    return res.status(404).json({ message: "Agendamento não encontrado" });
  res.json(atualizado);
});

app.delete("/agendamentos/:id", autenticarToken, async (req, res) => {
  const deletado = await Agendamento.findByIdAndDelete(req.params.id);
  if (!deletado)
    return res.status(404).json({ message: "Agendamento não encontrado" });
  res.json({ message: "Agendamento removido com sucesso" });
});

// CRUD SERVIÇOS
app.get("/servicos", autenticarToken, async (req, res) => {
  const lista = await Servico.find();
  res.json(lista);
});

app.post("/servicos", autenticarToken, async (req, res) => {
  const novoServico = await Servico.create(req.body);
  res.status(201).json(novoServico);
});

app.put("/servicos/:id", autenticarToken, async (req, res) => {
  const atualizado = await Servico.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!atualizado)
    return res.status(404).json({ message: "Serviço não encontrado" });
  res.json(atualizado);
});

app.delete("/servicos/:id", autenticarToken, async (req, res) => {
  const deletado = await Servico.findByIdAndDelete(req.params.id);
  if (!deletado)
    return res.status(404).json({ message: "Serviço não encontrado" });
  res.json({ message: "Serviço removido com sucesso" });
});

/* --- INICIALIZAÇÃO --- */
app.listen(PORT, () =>
  console.log(`🔥 Backend Pride Barbers rodando na porta ${PORT}`),
);
