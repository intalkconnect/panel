import React from "react";

function AguardandoPagamento({ forma, tema }) {
  const corPrimaria = tema?.cor_primaria || "#ef4444"; // fallback red-600
  const corTexto = tema?.cor_texto || "#1f2937";
  const corFundo = tema?.cor_fundo || "#ffffff";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: corFundo, color: corTexto }}
    >
      {/* Spinner */}
      <div className="mb-6">
        <svg
          className="animate-spin h-16 w-16"
          viewBox="0 0 24 24"
          style={{ color: corPrimaria }}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>

      {/* Mensagem principal */}
      <h1
        className="text-3xl md:text-4xl font-extrabold mb-4"
        style={{ color: corPrimaria }}
      >
        Aguardando pagamento via {forma}...
      </h1>

      {/* Mensagem secundária */}
      <p className="text-lg md:text-xl font-medium max-w-xl">
        Assim que o pagamento for confirmado, seu pedido será processado!
      </p>
    </div>
  );
}

export default AguardandoPagamento;
