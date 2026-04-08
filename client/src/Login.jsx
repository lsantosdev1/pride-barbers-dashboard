// Hook para controlar estados no React
import { useState, useEffect } from "react";

// Biblioteca para requisições HTTP
import api from "./api";
import toast from "react-hot-toast"; // Importe no topo do arquivo

// Hook para navegação entre rotas
import { Link, useNavigate } from "react-router-dom";

// Ícones
import { Mail, Lock } from "lucide-react";

// Logo da aplicação
import logo from "./assets/imgsalao3.png";

function Login({ setToken }) {
  // --- ESTADOS DO LOGIN ORIGINAL ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lembrarMe, setLembrarMe] = useState(false);

  // --- ESTADOS DA LÓGICA DO CONSOLE ---
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [secretCode, setSecretCode] = useState("");

  const navigate = useNavigate();

  // CHAVE MESTRA (Altere aqui se quiser outra senha)
  const MASTER_KEY = "PRIDE99";

  /* ==========================================================
      LÓGICA PARA CARREGAR DADOS SALVOS (REMEMBER ME)
  ========================================================== */
  useEffect(() => {
    const emailSalvo = localStorage.getItem("emailLembrado");
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrarMe(true);
    }
  }, []);

  /* ==========================================================
      LÓGICA DO CONSOLE (VALIDAÇÃO)
  ========================================================== */
  const handleVerifySecret = (e) => {
    e.preventDefault();
    if (secretCode === MASTER_KEY) {
      setIsAuthorized(true);
    } else {
      alert("ACESSO NEGADO: Credencial Inválida.");
      setSecretCode("");
      navigate("/"); // Opcional: volta pro agendamento se errar
    }
  };

  /* ==========================================================
      FUNÇÃO DE LOGIN (SUA LÓGICA ORIGINAL)
  ========================================================== */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      // --- LOG DE TESTE (Abra o console F12 para ver isso) ---
      console.log("Resposta do Servidor:", response.data);

      if (response.data.auth) {
        const token = response.data.token;
        setToken(token);

        if (lembrarMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("emailLembrado", email);
          console.log("✅ Salvo no LocalStorage");
        } else {
          sessionStorage.setItem("token", token);
          localStorage.removeItem("emailLembrado");
          console.log("✅ Salvo no SessionStorage");
        }

        // --- IMPLEMENTAÇÃO DO TOAST SUCESSO ---
        toast.success("Login realizado! Bem-vindo de volta. 💈");

        navigate("/dashboard");
      } else {
        // --- TROCADO ALERT POR TOAST ERROR ---
        toast.error("O servidor não enviou um token válido. ❌");
      }
    } catch (error) {
      console.error("Erro no Login:", error);

      // --- TROCADO ALERT POR TOAST ERROR ---
      const mensagem =
        error.response?.data?.message ||
        "Não foi possível realizar o login. ❌";
      toast.error(mensagem);
    }
  };
  /* ==========================================================
      VISÃO 1: O CONSOLE (ADAPTADO PARA MOBILE)
  ========================================================== */
  if (!isAuthorized) {
    return (
      <div className="console-screen">
        <div className="console-box">
          <p className="console-text">{">"} PRIDE_BARBERS_SYSTEM [v1.0.4]</p>
          <p className="console-text">{">"} STATUS: AGUARDANDO CREDENCIAL...</p>

          <form onSubmit={handleVerifySecret}>
            <input
              type="password"
              className="console-input"
              autoFocus
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="________________________________________"
              // Isso ajuda o teclado do celular a mostrar o botão de "Enviar"
              enterKeyHint="go"
            />

            {/* Botão invisível para garantir que o 'Enter' do teclado funcione */}
            <button type="submit" style={{ display: "none" }}></button>
          </form>

          <div className="console-footer">
            {/* Botão visível para Mobile e Desktop */}
            <button
              type="button"
              className="console-submit-btn"
              onClick={handleVerifySecret}
            >
              [ EXECUTAR COMANDO ]
            </button>

            <Link to="/" className="cancel-link">
              CANCELAR
            </Link>
          </div>
          <p className="console-mobile-hint">
            Digite a chave e toque em EXECUTAR
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
      VISÃO 2: SEU LOGIN ORIGINAL (APARECE APÓS A CHAVE)
  ========================================================== */
  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "70px",
              height: "70px",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
          {/* Tag discreta para indicar que o console foi vencido */}
          <span
            style={{ fontSize: "10px", color: "#41f1b6", marginTop: "5px" }}
          >
            SISTEMA AUTORIZADO
          </span>
        </div>

        <h2>Login</h2>

        <div className="input-group">
          <Mail size={20} className="input-icon" />
          <input
            type="text"
            placeholder="Usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <Lock size={20} className="input-icon" />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={lembrarMe}
              onChange={(e) => setLembrarMe(e.target.checked)}
            />{" "}
            Lembrar de mim
          </label>

          <Link
            to="/recuperar-senha"
            style={{
              fontSize: "0.85rem",
              color: "#ffffffff",
              textDecoration: "none",
            }}
          >
            Esqueceu a senha?
          </Link>
        </div>

        <button type="submit">Entrar</button>

        <div className="register-link" style={{ opacity: 0.3 }}>
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
