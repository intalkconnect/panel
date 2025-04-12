import React from "react";

function CategoriaCard({ categoria, selecionada, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`snap-center cursor-pointer flex flex-col items-center justify-center h-28 mx-2 my-1 rounded-xl transition-all duration-300
        ${
          selecionada
            ? "bg-red-500 text-white scale-105 shadow-lg"
            : "bg-white text-gray-800 opacity-80 hover:scale-100"
        }`}
    >
      <img
        src={categoria.imagem_url || "imagens/placeholder.png"}
        alt={categoria.nome}
        loading="lazy"
        className="w-20 h-20 object-contain mb-1"
      />

      <p className="text-sm font-medium text-center">{categoria.nome}</p>
    </div>
  );
}

export default CategoriaCard;
