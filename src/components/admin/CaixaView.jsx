import React, { useState } from "react";
import { abrirCaixa, fecharCaixa } from "../services/caixaService";

const CaixaView = () => {
  const [valorAbertura, setValorAbertura] = useState("");
  const [valorFechamento, setValorFechamento] = useState("");

  const handleAbrir = async () => {
    try {
      await abrirCaixa({
        valorAbertura: parseFloat(valorAbertura),
        abertoPor: "Operador",
      });
      alert("Caixa aberto com sucesso!");
      setValorAbertura("");
    } catch (err) {
      alert("Erro ao abrir caixa.");
      console.error(err);
    }
  };

  const handleFechar = async () => {
    try {
      await fecharCaixa({
        valorFechamento: parseFloat(valorFechamento),
      });
      alert("Caixa fechado com sucesso!");
      setValorFechamento("");
    } catch (err) {
      alert("Erro ao fechar caixa.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Gerenciar Caixa</h2>

      <div className="mb-4">
        <label className="block mb-1">Valor de Abertura</label>
        <input
          type="number"
          value={valorAbertura}
          onChange={(e) => setValorAbertura(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          onClick={handleAbrir}
          className="mt-2 w-full bg-green-600 text-white py-2 rounded font-bold"
        >
          Abrir Caixa
        </button>
      </div>

      <div>
        <label className="block mb-1">Valor de Fechamento</label>
        <input
          type="number"
          value={valorFechamento}
          onChange={(e) => setValorFechamento(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          onClick={handleFechar}
          className="mt-2 w-full bg-red-600 text-white py-2 rounded font-bold"
        >
          Fechar Caixa
        </button>
      </div>
    </div>
  );
};

export default CaixaView;
