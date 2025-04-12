// src/components/TotemNaoConfigurado.jsx
import React from "react";

const TotemNaoConfigurado = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center px-6">
      <div>
        <img
          src="/imagens/logo.png"
          alt="Logo"
          className="h-20 mx-auto mb-6 object-contain"
        />
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Totem não configurado
        </h1>
        <p className="text-gray-700">
          Este totem ainda não está vinculado a nenhum fornecedor. <br />
          Por favor, entre em contato com o administrador ou fornecedor
          responsável.
        </p>
      </div>
    </div>
  );
};

export default TotemNaoConfigurado;
