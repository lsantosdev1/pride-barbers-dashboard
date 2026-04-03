import { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import logo from "../assets/imgsalao3.png";

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rota pública no backend para solicitar o reset
      await api.post("/public/recuperar-senha", { email });
      setEnviado(true);
    } catch (error) {
      alert("Erro ao processar solicitação. Verifique o e-mail digitado.");
    } finally {
      setLoading(false);
    }
  };

  // Se já enviou, mostra mensagem de sucesso
  if (enviado) {
    return (
      <div className="login-container">
        <div className="form-content fade-in" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "1rem" }}>
            <img
              src={logo}
              alt="Logo"
              style={{ width: "70px", borderRadius: "50%" }}
            />
          </div>
          <h2>E-mail Enviado!</h2>
          <p
            className="subtitle"
            style={{ marginBottom: "1.5rem", color: "#888" }}
          >
            Se o e-mail **{email}** estiver cadastrado, você receberá as
            instruções para criar uma nova senha em instantes.
          </p>
          <Link
            to="/login"
            className="btn-primary"
            style={{
              display: "flex",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={18} style={{ marginRight: "8px" }} /> Voltar ao
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form onSubmit={handleRecuperar} className="fade-in">
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

        <h2>Recuperar Senha</h2>
        <p
          className="subtitle"
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            color: "#ffffffff",
            fontSize: "0.9rem",
          }}
        >
          Digite seu e-mail cadastrado e enviaremos um link de recuperação.
        </p>

        <div className="input-group">
          <Mail size={20} className="input-icon" />
          <input
            type="email"
            placeholder="Seu e-mail de acesso"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
          {loading ? (
            "Processando..."
          ) : (
            <>
              <Send size={18} style={{ marginRight: "8px" }} /> Enviar
              Instruções
            </>
          )}
        </button>

        <div className="register-link">
          <Link
            to="/login"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <ArrowLeft size={14} style={{ marginRight: "5px" }} /> Voltar ao
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RecuperarSenha;
