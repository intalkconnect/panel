import React from "react";

function CategoriaCard({ categoria, selecionada, onClick, tema }) {
  // Cores tematizadas
  const corSelecionadoBg = tema?.cor_primaria || "#ef4444";
  const corSelecionadoTexto = tema?.cor_botao_texto || "#ffffff";

  const corNormalBg = tema?.cor_secundaria || "#ffffff";
  const corNormalTexto = tema?.cor_texto || "#1f2937";

  const estiloContainer = {
    backgroundColor: selecionada ? corSelecionadoBg : corNormalBg,
    color: selecionada ? corSelecionadoTexto : corNormalTexto,
  };

  return (
    <div
      onClick={onClick}
      className={`snap-center cursor-pointer flex flex-col items-center justify-center h-28 mx-2 my-1 rounded-xl transition-all duration-300 ${
        selecionada ? "scale-105 shadow-lg" : "opacity-80 hover:scale-100"
      }`}
      style={estiloContainer}
    >
      <img
        src={categoria.imagem_url || "imagens/placeholder.png"}
        alt={categoria.nome}
        loading="lazy"
        className="w-20 h-20 object-contain mb-1"
      />
      <p className="text-sm font-medium text-center">
        {categoria.nome}
      </p>
    </div>
  );
}

export default CategoriaCard;
