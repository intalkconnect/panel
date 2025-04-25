import React from "react";

function NomeCliente({ nome, onChange, onConfirmar, tema }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: tema?.cor_fundo || "#ffffff",
        color: tema?.cor_texto || "#000000",
      }}
    >
      <div
        className="p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
        style={{
          backgroundColor: tema?.cor_secundaria || "#fff1f2",
        }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: tema?.cor_primaria || "#dc2626" }}
        >
          Informe seu nome
        </h2>

        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-4 text-lg"
          style={{
            outlineColor: tema?.cor_primaria || "#dc2626",
            color: tema?.cor_texto || "#000000",
          }}
        />

        <button
          disabled={!nome.trim()}
          onClick={onConfirmar}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            backgroundColor: nome.trim()
              ? tema?.cor_botao || "#16a34a"
              : "#d1d5db",
            color: nome.trim()
              ? tema?.cor_botao_texto || "#ffffff"
              : "#9ca3af",
            cursor: nome.trim() ? "pointer" : "not-allowed",
          }}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default NomeCliente;
