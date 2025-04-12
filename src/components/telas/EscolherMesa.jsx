import React from "react";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

function EscolherMesa({ onSelecionarMesa }) {
  const mesas = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Escolha sua mesa
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {mesas.map((mesa) => (
            <div
              key={mesa}
              onClick={() => onSelecionarMesa(mesa)}
              className="cursor-pointer border border-red-500 text-red-600 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              <BuildingStorefrontIcon className="w-8 h-8 mb-2" />
              <span className="font-medium text-sm">Mesa {mesa}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EscolherMesa;
