import React from "react";
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

function ModoConsumo({ onComerAqui, onParaLevar, tema }) {
  const corFundo = tema?.cor_fundo || "#ffffff";
  const corTexto = tema?.cor_texto || "#1f2937";
  const corBotao = tema?.cor_botao || "#ef4444";
  const corBotaoTexto = tema?.cor_botao_texto || "#ffffff";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: corFundo, color: corTexto }}
    >
      <div className="grid grid-cols-2 gap-10 w-full max-w-md">
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
    </div>
  );
}

export default ModoConsumo;
