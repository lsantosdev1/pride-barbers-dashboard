// Hooks do React para controle de estado e efeitos colaterais
import { useState, useEffect } from "react";

// Ícones utilizados nos botões e título do cronômetro
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

// Componente responsável pelo cronômetro de tempo de corte
function HaircutTimer() {
  /* ===============================
     ESTADOS
  =============================== */

  // Tempo inicial configurável (em minutos)
  const [minutosIniciais, setMinutosIniciais] = useState(45);

  // Tempo restante do cronômetro (em segundos)
  const [timeLeft, setTimeLeft] = useState(45 * 60);

  // Controla se o cronômetro está rodando ou pausado
  const [isActive, setIsActive] = useState(false);

  /* ===============================
     EFEITO DO CRONÔMETRO
  =============================== */
  useEffect(() => {
    let interval = null;

    // Se o cronômetro estiver ativo e ainda houver tempo
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        // Diminui 1 segundo a cada intervalo
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    // Quando o tempo chega a zero, pausa automaticamente
    if (timeLeft === 0) {
      setIsActive(false);
      // Aqui pode ser adicionado um som ou alerta futuramente
    }

    // Limpa o intervalo ao desmontar o componente
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  /* ===============================
     FUNÇÕES AUXILIARES
  =============================== */

  // Converte segundos para o formato MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Atualiza o tempo inicial definido pelo usuário
  const handleChangeMinutes = (e) => {
    let value = parseInt(e.target.value);

    // Define limites de segurança
    if (value < 1) value = 1; // mínimo: 1 minuto
    if (value > 180) value = 180; // máximo: 3 horas

    setMinutosIniciais(value);
    setTimeLeft(value * 60); // Atualiza o cronômetro imediatamente
    setIsActive(false); // Pausa o cronômetro ao alterar o tempo
  };

  // Reseta o cronômetro para o tempo inicial
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(minutosIniciais * 60);
  };

  /* ===============================
     RENDERIZAÇÃO
  =============================== */
  return (
    <div className="card timer-card">
      {/* Cabeçalho do cronômetro */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#a0a0a0",
          marginBottom: "10px",
        }}
      >
        <Clock size={16} />
        <span>Tempo de Corte</span>
      </div>

      {/* Seletor de tempo (visível apenas quando o cronômetro está parado) */}
      {!isActive && (
        <div className="time-input-container">
          <label>Definir Minutos:</label>
          <input
            type="number"
            value={minutosIniciais}
            onChange={handleChangeMinutes}
            className="timer-input"
          />
        </div>
      )}

      {/* Visor digital do cronômetro */}
      <div className={`digital-clock ${isActive ? "active-clock" : ""}`}>
        {formatTime(timeLeft)}
      </div>

      {/* Controles do cronômetro */}
      <div className="timer-controls">
        {/* Botão Play / Pause */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={isActive ? "btn-pause" : "btn-play"}
        >
          {isActive ? (
            <Pause size={24} />
          ) : (
            <Play size={24} style={{ marginLeft: "4px" }} />
          )}
        </button>

        {/* Botão de Reset */}
        <button onClick={handleReset} className="btn-reset">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}

// Exportação do componente
export default HaircutTimer;
