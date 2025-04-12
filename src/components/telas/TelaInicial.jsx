import React from "react";

function TelaInicial({ onIniciar }) {
  return (
    <div
      onClick={onIniciar}
      className="w-full h-screen bg-gradient-to-br from-white via-red-50 to-red-100 flex flex-col items-center justify-center text-center cursor-pointer select-none"
    >
      {/* Ícone ou emoji */}
      <div className="text-7xl mb-6 animate-bounce">🍔</div>

      {/* Título principal */}
      <h1 className="text-4xl font-extrabold text-red-600 mb-4">
        Bem-vindo ao McTotem
      </h1>

      {/* Subtítulo explicativo */}
      <p className="text-lg text-gray-700">
        Toque na tela para iniciar seu pedido
      </p>
    </div>
  );
}

export default TelaInicial;
