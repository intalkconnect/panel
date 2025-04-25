import React from "react";

function NomeCliente({ nome, onChange, onConfirmar, tema }) {
  // Cores do tema com fallback
  const corFundo = tema?.cor_fundo || "#ffffff";
  const corTexto = tema?.cor_texto || "#000000";
  const corSecundaria = tema?.cor_secundaria || "#fff1f2";
  const corPrimaria = tema?.cor_primaria || "#dc2626";
  const corBotao = tema?.cor_botao || "#16a34a";
  const corBotaoTexto = tema?.cor_botao_texto || "#ffffff";

  const nomeValido = nome.trim().length > 0;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: corFundo, color: corTexto }}
    >
      <div
        className="p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
        style={{ backgroundColor: corSecundaria }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: corPrimaria }}
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
            outlineColor: corPrimaria,
            color: corTexto,
          }}
        />

        <button
          disabled={!nomeValido}
          onClick={onConfirmar}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            backgroundColor: nomeValido ? corBotao : "#d1d5db",
            color: nomeValido ? corBotaoTexto : "#9ca3af",
            cursor: nomeValido ? "pointer" : "not-allowed",
          }}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default NomeCliente;
