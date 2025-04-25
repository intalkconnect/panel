import React from "react";
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

function ModoConsumo({ onComerAqui, onParaLevar, tema }) {
  const corBotao = tema?.cor_botao || "#ef4444";
  const corBotaoTexto = tema?.cor_botao_texto || "#ffffff";

  return (
    <div className="grid grid-cols-2 gap-10">
      <div
        onClick={onComerAqui}
        className="cursor-pointer transition rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105"
        style={{
          backgroundColor: corBotao,
          color: corBotaoTexto,
        }}
      >
        <BuildingStorefrontIcon className="w-10 h-10 mb-2" />
        <span className="text-xl font-bold">Comer Aqui</span>
      </div>
      <div
        onClick={onParaLevar}
        className="cursor-pointer transition rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105"
        style={{
          backgroundColor: corBotao,
          color: corBotaoTexto,
        }}
      >
        <ShoppingBagIcon className="w-10 h-10 mb-2" />
        <span className="text-xl font-bold">Para Levar</span>
      </div>
    </div>
  );
}

export default ModoConsumo;
