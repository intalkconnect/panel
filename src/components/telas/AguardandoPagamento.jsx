import React from "react";

function AguardandoPagamento({ forma }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      {/* Spinner */}
      <div className="mb-6">
        <svg
          className="animate-spin h-16 w-16 text-red-600"
          viewBox="0 0 24 24"
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
      <h1 className="text-3xl md:text-4xl font-extrabold text-red-600 mb-4">
        Aguardando pagamento via {forma}...
      </h1>

      {/* Mensagem secundária */}
      <p className="text-lg md:text-xl text-gray-700 font-medium max-w-xl">
        Assim que o pagamento for confirmado, seu pedido será processado!
      </p>
    </div>
  );
}

export default AguardandoPagamento;
