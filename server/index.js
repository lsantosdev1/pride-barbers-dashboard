/* ==========================================================================
   PROJETO: PRIDE BARBERS - BACKEND API (v2.0 Multi-User COMPLETO)
   DESCRIÇÃO: API REST com MongoDB Atlas, JWT e Isolamento de Dados
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
  .then(() => console.log("✅ Conectado ao MongoDB Atlas!"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

app.use(express.json());
app.use(cors());

/* --- MODELOS DE DADOS (SCHEMAS) --- */

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

const configuracaoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  horarios: { abertura: String, fechamento: String, mesAberto: String },
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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  nome: String,
  preco: String,
});
const Servico = mongoose.model("Servico", servicoSchema);
const gastoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  categoria: { type: String, default: "Produtos" }, // ex: Produtos, Aluguel, Luz
  data: { type: String, required: true },
});
const Gasto = mongoose.model("Gasto", gastoSchema);

/* --- MIDDLEWARE DE AUTENTICAÇÃO --- */
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Token não informado" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Token inválido ou expirado" });
    req.user = decoded; // req.user.id contém o ID do barbeiro
    next();
  });
}
app.post("/public/recuperar-senha", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Solicitação de recuperação para: ${email}`);

    // Aqui no futuro você buscará o usuário e enviará o e-mail real.
    // Por enquanto, apenas confirmamos para o frontend:
    res.json({ message: "Instruções enviadas." });
  } catch (error) {
    res.status(500).send("Erro");
  }
});

/* --- ROTAS DE AUTENTICAÇÃO --- */

app.post("/register", async (req, res) => {
  try {
    let { nome, email, password } = req.body;

    // 1. LIMPEZA DOS DADOS (Evita erro de caracteres invisíveis)
    if (!nome || !email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos" });
    }
    email = email.trim().toLowerCase();
    nome = nome.trim();

    // 2. VERIFICAÇÃO
    const jaExiste = await User.findOne({ email });
    if (jaExiste) {
      return res.status(400).json({ message: "E-mail já cadastrado" });
    }

    // 3. CRIAÇÃO
    await User.create({ nome, email, password });
    console.log(`✅ Novo barbeiro cadastrado: ${email}`);

    res.status(201).json({ message: "Barbeiro cadastrado com sucesso!" });
  } catch (error) {
    // 4. LOG DE ERRO (Isso vai aparecer no painel do Render)
    console.error("❌ ERRO NO REGISTRO:", error.message);

    res.status(500).json({
      message: "Erro no servidor",
      detalhe: error.message, // Isso vai aparecer no seu Toast!
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (user) {
    const token = jwt.sign({ id: user._id, nome: user.nome }, SECRET_KEY, {
      expiresIn: "24h",
    });
    return res.json({
      auth: true,
      token,
      user: { id: user._id, nome: user.nome, email: user.email },
    });
  }
  res.status(401).json({ auth: false, message: "Credenciais inválidas" });
});
/* --- ROTA PARA PEGAR DADOS DO USUÁRIO LOGADO --- */
app.get("/perfil", autenticarToken, async (req, res) => {
  try {
    // Buscamos o usuário no banco usando o ID que veio do Token (req.user.id)
    const user = await User.findById(req.user.id).select("-password"); // .select("-password") oculta a senha por segurança

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res
      .status(500)
      .json({ message: "Erro no servidor ao buscar dados do usuário" });
  }
});
// Rota para buscar os dados do barbeiro logado
app.get("/me", autenticarToken, async (req, res) => {
  try {
    // req.user.id vem do seu middleware 'autenticarToken'
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar dados do usuário" });
  }
});
/* --- ROTAS PÚBLICAS (Clientes) --- */

app.get("/public/servicos/:barbeiroId", async (req, res) => {
  try {
    const { barbeiroId } = req.params;
    let lista = await Servico.find({ userId: barbeiroId });

    // Lógica da v1: Criar padrões se estiver vazio para este barbeiro específico
    if (lista.length === 0) {
      const servicosPadrao = [
        { nome: "Corte Masculino", preco: "35,00", userId: barbeiroId },
        { nome: "Barba", preco: "25,00", userId: barbeiroId },
        { nome: "Corte + Barba", preco: "55,00", userId: barbeiroId },
      ];
      await Servico.insertMany(servicosPadrao);
      lista = await Servico.find({ userId: barbeiroId });
    }
    res.json(lista);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar serviços" });
  }
});

app.post("/public/agendamentos", async (req, res) => {
  try {
    // 1. Pegamos os dados e limpamos espaços em branco (trim)
    const barbeiroId = req.body.barbeiroId;
    const data = req.body.data?.trim();
    const horario = req.body.horario?.trim();
    const { nome, servico, preco } = req.body;

    // --- LOG PARA DEBUG ---
    console.log(
      `🔎 Tentativa: Barbeiro: ${barbeiroId} | Data: ${data} | Hora: ${horario}`,
    );

    // 2. BUSCAR CONFIGURAÇÃO DO BARBEIRO (Para horários e Mês Aberto)
    const configBarbeiro = await Configuracao.findOne({ userId: barbeiroId });

    if (!configBarbeiro) {
      return res
        .status(404)
        .json({ message: "Barbeiro não encontrado ou sem configurações." });
    }

    // 3. TRAVA DE PASSADO: Ajustada para o fuso de Brasília (GMT-3)
    // Pega a hora exata agora em SP/Rio
    const agoraBrasilia = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    );

    // Monta a data que o cliente escolheu
    const dataAgendamento = new Date(`${data}T${horario}:00`);

    // Converte a escolha do cliente também para o contexto de Brasília para comparar "maçã com maçã"
    const dataAgendamentoAjustada = new Date(
      dataAgendamento.toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo",
      }),
    );

    if (dataAgendamentoAjustada < agoraBrasilia) {
      return res.status(400).json({
        message: "Ops! Você não pode agendar em um horário que já passou.",
      });
    }
    // 4. TRAVA DE MÊS CONTROLADO: Verifica se o barbeiro liberou este mês específico
    const dataEscolhida = new Date(`${data}T00:00:00`);
    const mesEscolhido = dataEscolhida.getMonth() + 1; // Janeiro é 0, somamos 1 para ficar 1-12
    const anoEscolhido = dataEscolhida.getFullYear();
    const anoAtual = agora.getFullYear();

    const mesAbertoPeloBarbeiro = configBarbeiro.horarios?.mesAberto; // Deve ser salvo como "4", "5", etc.

    if (
      mesAbertoPeloBarbeiro &&
      (mesEscolhido.toString() !== mesAbertoPeloBarbeiro.toString() ||
        anoEscolhido !== anoAtual)
    ) {
      const mesesNomes = [
        "",
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      const nomeMesAberto = mesesNomes[parseInt(mesAbertoPeloBarbeiro)];

      return res.status(400).json({
        message: `Este barbeiro está aceitando agendamentos apenas para o mês de ${nomeMesAberto}!`,
      });
    }

    // 5. VERIFICAR CONFLITO DE HORÁRIO
    const conflito = await Agendamento.findOne({
      userId: barbeiroId,
      data: data,
      horario: horario,
      status: { $ne: "Cancelado" },
    });

    if (conflito) {
      console.log("⚠️ CONFLITO DETECTADO! Gerando sugestões...");

      // Horários de atendimento vindos da config ou padrão (9h às 19h)
      let inicio = 9,
        fim = 19;
      if (configBarbeiro.horarios) {
        inicio = parseInt(configBarbeiro.horarios.abertura.split(":")[0]);
        fim = parseInt(configBarbeiro.horarios.fechamento.split(":")[0]);
      }

      // Busca o que já está ocupado no dia para sugerir o que sobrou
      const agendamentosDoDia = await Agendamento.find({
        userId: barbeiroId,
        data: data,
        status: { $ne: "Cancelado" },
      });

      const horasOcupadas = agendamentosDoDia.map((a) => a.horario);
      const sugestoes = [];

      for (let h = inicio; h <= fim; h++) {
        const horaFormatada = h < 10 ? `0${h}:00` : `${h}:00`;
        if (!horasOcupadas.includes(horaFormatada)) {
          sugestoes.push(horaFormatada);
        }
      }

      return res.status(400).json({
        message: "Este horário já está reservado!",
        sugestoes: sugestoes,
      });
    }

    // 6. TUDO OK! SALVAR AGENDAMENTO
    console.log("✅ Horário livre e mês permitido. Salvando...");
    const novo = new Agendamento({
      nome,
      servico,
      preco,
      data,
      horario,
      userId: barbeiroId,
      status: "Agendado",
      avatar: `https://ui-avatars.com/api/?name=${(nome || "Cliente").replace(" ", "+")}&background=random`,
    });

    await novo.save();
    res.status(201).json(novo);
  } catch (error) {
    console.error("❌ Erro no agendamento:", error);
    res.status(500).json({ message: "Erro interno ao realizar agendamento" });
  }
});
// 1. NOVA ROTA: Lista todos os tipos de serviços que a barbearia oferece (sem repetir)
app.get("/public/servicos-gerais", async (req, res) => {
  try {
    // O 'distinct' pega nomes únicos. Ex: Se 3 barbeiros fazem "Corte", só aparece "Corte" uma vez na lista.
    const servicos = await Servico.distinct("nome");
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar tipos de serviços" });
  }
});

// 2. NOVA ROTA: Quando o cliente clica em "Corte", essa rota busca quais barbeiros fazem esse serviço
app.get("/public/barbeiros-por-servico", async (req, res) => {
  try {
    const { nomeServico } = req.query;

    const termoBusca = nomeServico
      .trim()
      .replace(/\+/g, "\\+")
      .replace(/\s+/g, ".*");

    const profissionais = await Servico.find({
      nome: { $regex: termoBusca, $options: "i" },
    }).populate("userId", "nome email");

    // --- MÁGICA PARA REMOVER DUPLICADOS ---
    const barbeirosUnicos = [];
    const idsEncontrados = new Set();

    for (const item of profissionais) {
      // Verifica se o barbeiro existe e se já não o colocamos na lista
      if (item.userId && !idsEncontrados.has(item.userId._id.toString())) {
        barbeirosUnicos.push(item);
        idsEncontrados.add(item.userId._id.toString());
      }
    }

    // Organiza os dados finais usando a lista de únicos
    const resultado = barbeirosUnicos.map((item) => ({
      barbeiroId: item.userId._id,
      barbeiroNome: item.userId.nome,
      preco: item.preco,
    }));

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar profissionais" });
  }
});
/* --- ROTAS PROTEGIDAS (Admin / Barbeiro) --- */

// CONFIGURAÇÕES
app.get("/config", autenticarToken, async (req, res) => {
  let config = await Configuracao.findOne({ userId: req.user.id });
  if (!config) {
    config = await Configuracao.create({
      userId: req.user.id,
      horarios: { abertura: "09:00", fechamento: "20:00" },
      perfil: { nome: req.user.nome, email: "" },
    });
  }
  res.json(config);
});

app.put("/config", autenticarToken, async (req, res) => {
  const config = await Configuracao.findOneAndUpdate(
    { userId: req.user.id },
    req.body,
    { upsert: true, returnDocument: "after" },
  );
  res.json({ message: "Configurações atualizadas", configuracoes: config });
});

// CRUD AGENDAMENTOS (Isolado por userId)
app.get("/agendamentos", autenticarToken, async (req, res) => {
  const lista = await Agendamento.find({ userId: req.user.id });
  res.json(lista);
});

app.post("/agendamentos", autenticarToken, async (req, res) => {
  const novo = new Agendamento({
    ...req.body,
    userId: req.user.id,
    avatar: `https://ui-avatars.com/api/?name=${(req.body.nome || "Admin").replace(" ", "+")}&background=random`,
  });
  await novo.save();
  res.status(201).json(novo);
});

app.put("/agendamentos/:id", autenticarToken, async (req, res) => {
  const atualizado = await Agendamento.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id }, // Só edita se for o dono
    req.body,
    { returnDocument: "after" },
  );
  if (!atualizado)
    return res.status(404).json({ message: "Agendamento não encontrado" });
  res.json(atualizado);
});

app.delete("/agendamentos/:id", autenticarToken, async (req, res) => {
  const deletado = await Agendamento.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!deletado)
    return res.status(404).json({ message: "Agendamento não encontrado" });
  res.json({ message: "Agendamento removido com sucesso" });
});

// CRUD SERVIÇOS (Isolado por userId)
app.get("/servicos", autenticarToken, async (req, res) => {
  const lista = await Servico.find({ userId: req.user.id });
  res.json(lista);
});

app.post("/servicos", autenticarToken, async (req, res) => {
  const novoServico = await Servico.create({
    ...req.body,
    userId: req.user.id,
  });
  res.status(201).json(novoServico);
});

app.put("/servicos/:id", autenticarToken, async (req, res) => {
  const atualizado = await Servico.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { returnDocument: "after" },
  );
  if (!atualizado)
    return res.status(404).json({ message: "Serviço não encontrado" });
  res.json(atualizado);
});

app.delete("/servicos/:id", autenticarToken, async (req, res) => {
  const deletado = await Servico.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!deletado)
    return res.status(404).json({ message: "Serviço não encontrado" });
  res.json({ message: "Serviço removido com sucesso" });
});
// CRUD GASTOS
app.get("/gastos", autenticarToken, async (req, res) => {
  const lista = await Gasto.find({ userId: req.user.id });
  res.json(lista);
});

app.post("/gastos", autenticarToken, async (req, res) => {
  const novoGasto = await Gasto.create({ ...req.body, userId: req.user.id });
  res.status(201).json(novoGasto);
});

app.delete("/gastos/:id", autenticarToken, async (req, res) => {
  await Gasto.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Gasto removido" });
});
/* --- INICIALIZAÇÃO --- */
app.listen(PORT, () =>
  console.log(`🔥 Pride Barbers v2.0 rodando na porta ${PORT}`),
);
