import React, { useState, useEffect } from "react";
import api from "../api"; // Verifique se o caminho está correto
import toast from "react-hot-toast";
import { Plus, Trash2, Receipt } from "lucide-react";

function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Estado para o novo gasto
  const [novoGasto, setNovoGasto] = useState({
    descricao: "",
    valor: "",
    categoria: "Produtos",
    data: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchGastos();
  }, []);

  const fetchGastos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/gastos");
      setGastos(res.data);
    } catch (err) {
      toast.error("Erro ao carregar lista de gastos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!novoGasto.descricao || !novoGasto.valor) {
      toast.error("Preencha a descrição e o valor! ⚠️");
      return;
    }

    try {
      // Converte o valor para número antes de enviar (tratando vírgula)
      const valorNumerico = parseFloat(novoGasto.valor.replace(",", "."));

      const res = await api.post("/gastos", {
        ...novoGasto,
        valor: valorNumerico,
      });

      setGastos([...gastos, res.data]);
      setShowModal(false);
      toast.success("Gasto registrado com sucesso! 💸");

      // Limpa o formulário
      setNovoGasto({
        descricao: "",
        valor: "",
        categoria: "Produtos",
        data: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      toast.error("Erro ao salvar gasto.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este registro de gasto?")) {
      try {
        await api.delete(`/gastos/${id}`);
        setGastos(gastos.filter((g) => g._id !== id));
        toast.success("Gasto removido! 🗑️");
      } catch (err) {
        toast.error("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="title-group">
          <Receipt size={28} color="#ff4444" />
          <h1>Controle de Gastos</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Novo Gasto
        </button>
      </header>

      {/* TABELA DE GASTOS (Seguindo seu padrão de vidro) */}
      <div className="table-container glass">
        {loading ? (
          <p className="loading-text">Carregando gastos...</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {gastos.length > 0 ? (
                gastos.map((g) => (
                  <tr key={g._id}>
                    <td>{new Date(g.data).toLocaleDateString("pt-BR")}</td>
                    <td>{g.descricao}</td>
                    <td>
                      <span
                        className={`badge badge-${g.categoria.toLowerCase()}`}
                      >
                        {g.categoria}
                      </span>
                    </td>
                    <td className="valor-gasto">
                      R$ {parseFloat(g.valor).toFixed(2).replace(".", ",")}
                    </td>
                    <td>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(g._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Nenhum gasto registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL PARA NOVO GASTO (Mesmo estilo do Agendamento) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>Registrar Saída</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Pomada, Aluguel, Luz..."
                  value={novoGasto.descricao}
                  onChange={(e) =>
                    setNovoGasto({ ...novoGasto, descricao: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor (R$)</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={novoGasto.valor}
                    onChange={(e) =>
                      setNovoGasto({ ...novoGasto, valor: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    value={novoGasto.data}
                    onChange={(e) =>
                      setNovoGasto({ ...novoGasto, data: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={novoGasto.categoria}
                  onChange={(e) =>
                    setNovoGasto({ ...novoGasto, categoria: e.target.value })
                  }
                >
                  <option value="Produtos">Produtos</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Luz/Água">Luz/Água</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Salvar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gastos;
