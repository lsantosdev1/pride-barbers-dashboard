import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
// Mantenha ícones leves para o visual de vidro, combinando com image_3.png
import { UserPlus, Mail, Lock, User, UserCheck } from "lucide-react";
import "../App.css"; // O único import de CSS

const Register = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErro("As senhas não coincidem!");
      return;
    }
    try {
      await api.post("/register", formData);
      alert("Cadastro realizado! Faça login agora.");
      navigate("/login");
    } catch (err) {
      setErro(
        err.response?.data?.message || "Erro ao cadastrar. Tente novamente.",
      );
    }
  };

  return (
    // Container de centralização para o corpo da página inteira
    <div className="page-background-glass">
      {/* O único container de vidro que envolve todo o conteúdo */}
      <div className="glass-container">
        {/* ADICIONE o placeholder do logo circular como no Login */}
        <div className="logo-wrapper"></div>

        {/* MOVA título e parágrafo PARA DENTRO da caixa */}
        <h2>CADASTRAR-SE</h2>
        <p>Preencha os dados do novo profissional</p>

        {erro && <div className="error-message">{erro}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-group-glass">
            <User size={20} className="icon-glass" />
            <input
              type="text"
              style={{ color: "#fff" }}
              placeholder="Nome Completo"
              required
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />
          </div>

          <div className="input-group-glass">
            <Mail size={20} className="icon-glass" />
            <input
              type="email"
              placeholder="E-mail"
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="input-group-glass">
            <Lock size={20} className="icon-glass" />
            <input
              type="password"
              placeholder="Crie uma senha segura"
              required
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div className="input-group-glass">
            <UserCheck size={20} className="icon-glass" />
            <input
              type="password"
              placeholder="Confirme a senha"
              required
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>

          {/* Estilize como o botão escuro sólido como no Login */}
          <button type="submit" className="btn-confirmar-glass">
            <UserPlus size={22} /> CADASTRAR PROMISSOR
          </button>
        </form>

        {/* Mantenha texto e link centralizados, com melhor cor */}
        <p className="footer-link-glass">
          Já é cadastrado? <Link to="/login">Voltar ao Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
