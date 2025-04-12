import React from "react";
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

function ModoConsumo({ onComerAqui, onParaLevar }) {
  return (
    <div className="grid grid-cols-2 gap-10 text-white">
      <div
        onClick={onComerAqui}
        className="cursor-pointer bg-red-500 hover:bg-red-600 transition rounded-2xl p-6 flex flex-col items-center justify-center"
      >
        <BuildingStorefrontIcon className="w-10 h-10 mb-2 text-white" />
        <span className="text-xl font-bold">Comer Aqui</span>
      </div>
      <div
        onClick={onParaLevar}
        className="cursor-pointer bg-red-500 hover:bg-red-600 transition rounded-2xl p-6 flex flex-col items-center justify-center"
      >
        <ShoppingBagIcon className="w-10 h-10 mb-2 text-white" />
        <span className="text-xl font-bold">Para Levar</span>
      </div>
    </div>
  );
}

export default ModoConsumo;
