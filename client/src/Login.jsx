// Hook para controlar estados no React
import { useState } from "react";

// Biblioteca para requisições HTTP
import axios from "axios";

// Hook para navegação entre rotas
import { useNavigate } from "react-router-dom";

// Ícones
import { Mail, Lock } from "lucide-react";

// Logo da aplicação
import logo from "./assets/imgsalao3.png";

// Componente de Login
function Login({ setToken }) {
  // Estado para armazenar o email digitado
  const [email, setEmail] = useState("");

  // Estado para armazenar a senha digitada
  const [password, setPassword] = useState("");

  // Hook para redirecionamento de páginas
  const navigate = useNavigate();

  // Função chamada ao enviar o formulário
  const handleLogin = async (e) => {
    e.preventDefault(); // Evita recarregar a página

    try {
      // Envia email e senha para o backend
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });

      // Se a autenticação for válida
      if (response.data.auth) {
        // Salva o token no estado
        setToken(response.data.token);

        // Salva o token no localStorage
        localStorage.setItem("token", response.data.token);

        // Redireciona para o dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      // Mensagem de erro caso login falhe
      alert("Usuário ou senha incorretos!");
    }
  };

  // Renderização do formulário de login
  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        {/* Logo do sistema */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
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
        </div>

        {/* Título */}
        <h2>Login</h2>

        {/* Campo de email */}
        <div className="input-group">
          <Mail size={20} className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Campo de senha */}
        <div className="input-group">
          <Lock size={20} className="input-icon" />
          <input
            type="password"
            placeholder="Senha"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Opções adicionais */}
        <div className="form-options">
          {/* Checkbox para lembrar o usuário */}
          <label className="checkbox-label">
            <input type="checkbox" /> Lembrar de mim
          </label>

          {/* Link para recuperação de senha */}
          <a href="#" className="forgot-link">
            Esqueceu a senha?
          </a>
        </div>

        {/* Botão de envio */}
        <button type="submit">Entrar</button>

        {/* Link para cadastro */}
        <div className="register-link">
          Não tem uma conta? <a href="#">Cadastre-se</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
