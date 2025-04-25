import React from "react";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

function EscolherMesa({ onSelecionarMesa, tema }) {
  const mesas = [1, 2, 3, 4, 5, 6, 7, 8];

  const corFundo = tema?.cor_fundo || "#ffffff";
  const corTexto = tema?.cor_texto || "#1f2937";
  const corPrimaria = tema?.cor_primaria || "#ef4444";
  const corPrimariaHover = "#dc2626"; // opcionalmente derivado

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: corFundo, color: corTexto }}
    >
      <div className="text-center w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-8" style={{ color: corPrimaria }}>
          Escolha sua mesa
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {mesas.map((mesa) => (
            <div
              key={mesa}
              onClick={() => onSelecionarMesa(mesa)}
              className="cursor-pointer rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
              style={{
                backgroundColor: corPrimaria,
              }}
            >
              <BuildingStorefrontIcon className="w-8 h-8 mb-2 text-white" />
              <span className="font-medium text-sm text-white font-bold">
                Mesa {mesa}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EscolherMesa;
