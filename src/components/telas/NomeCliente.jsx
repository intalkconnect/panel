import React from "react";

function NomeCliente({ nome, onChange, onConfirmar }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-red-50 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-6">
          Informe seu nome
        </h2>

        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-red-400 mb-4 text-lg"
        />

        <button
          disabled={!nome.trim()}
          onClick={onConfirmar}
          className={`w-full py-3 rounded-lg text-white font-bold transition ${
            nome.trim()
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default NomeCliente;
