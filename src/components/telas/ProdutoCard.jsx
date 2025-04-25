import React, { useState } from "react";

function ProdutoCard({ produto, onAdicionar, onRemover, quantidade = 0, tema }) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [extrasSelecionados, setExtrasSelecionados] = useState([]);
  const [removerSelecionados, setRemoverSelecionados] = useState([]);
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);

  const temDetalhamento =
    typeof produto.detalhamento === "object" && produto.detalhamento !== null;

  const abrirDetalhes = () => {
    setExtrasSelecionados([]);
    setRemoverSelecionados([]);
    setMostrarDetalhes(true);
  };

  const toggleOpcao = (lista, setLista, item) => {
    setLista((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const handleAdicionar = () => {
    const itemComDetalhes = {
      ...produto,
      extrasSelecionados,
      removerSelecionados,
    };

    for (let i = 0; i < quantidadeSelecionada; i++) {
      onAdicionar(itemComDetalhes);
    }

    setMostrarDetalhes(false);
    setQuantidadeSelecionada(1);
  };

  const handleCliqueAdicionar = () => {
    if (temDetalhamento) abrirDetalhes();
    else onAdicionar(produto);
  };

  // Cores do tema com fallback
  const corFundo = tema?.cor_fundo || "#ffffff";
  const corSecundaria = tema?.cor_secundaria || "#f3f4f6";
  const corTexto = tema?.cor_texto || "#1f2937";
  const corPrimaria = tema?.cor_primaria || "#059669";
  const corBotao = tema?.cor_botao || "#ef4444";
  const corBotaoTexto = tema?.cor_botao_texto || "#ffffff";

  return (
    <>
      {/* CARD DO PRODUTO */}
      <div
        className="rounded-3xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 p-6 flex flex-col items-center justify-between w-full max-w-sm mx-auto"
        style={{ backgroundColor: corFundo }}
      >
        <img
          src={produto.imagem_url}
          alt={produto.nome}
          loading="lazy"
          className="w-20 h-20 object-contain mb-2"
        />
        <h2 className="text-base font-bold text-center" style={{ color: corTexto }}>
          {produto.nome}
        </h2>
        <p className="font-semibold text-sm mb-2" style={{ color: corPrimaria }}>
          {produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>

        {/* Botões do produto */}
        {produto.quantidade === 0 ? (
          <div className="mt-2 px-6 py-2 bg-red-100 text-red-500 rounded-full text-sm font-semibold shadow-inner">
            Esgotado
          </div>
        ) : quantidade === 0 ? (
          <button
            onClick={handleCliqueAdicionar}
            className="mt-2 px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            style={{ backgroundColor: corBotao, color: corBotaoTexto }}
          >
            Adicionar
          </button>
        ) : (
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() =>
                temDetalhamento
                  ? onRemover({ ...produto, extrasSelecionados, removerSelecionados })
                  : onRemover(produto)
              }
              className="w-8 h-8 rounded-full text-lg font-bold"
              style={{ backgroundColor: corBotao, color: corBotaoTexto }}
            >
              –
            </button>

            <span className="text-base font-bold">{quantidade}</span>

            <button
              onClick={() =>
                temDetalhamento ? abrirDetalhes() : onAdicionar(produto)
              }
              className="w-8 h-8 rounded-full text-lg font-bold"
              style={{ backgroundColor: corBotao, color: corBotaoTexto }}
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES */}
      {mostrarDetalhes && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
          onClick={() => setMostrarDetalhes(false)}
        >
          <div
            className="p-6 rounded-2xl shadow-xl max-w-md w-full text-left relative max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: corFundo, color: corTexto }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-center mb-2">
              {produto.nome}
            </h3>
            <p className="text-sm mb-4 whitespace-pre-wrap">
              {produto.detalhamento?.descricao}
            </p>

            {/* Remover opções */}
            {produto.detalhamento?.remover?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1">Remover:</h4>
                {produto.detalhamento.remover.map((op) => (
                  <label key={op.id} className="flex items-center gap-2 text-sm mb-1">
                    <input
                      type="checkbox"
                      checked={removerSelecionados.some((r) => r.id === op.id)}
                      onChange={() =>
                        toggleOpcao(removerSelecionados, setRemoverSelecionados, op)
                      }
                    />
                    {op.label}
                  </label>
                ))}
              </div>
            )}

            {/* Adicionar extras */}
            {produto.detalhamento?.extras?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1">Adicionar:</h4>
                {produto.detalhamento.extras.map((op) => (
                  <label key={op.id} className="flex items-center gap-2 text-sm mb-1">
                    <input
                      type="checkbox"
                      checked={extrasSelecionados.some((e) => e.id === op.id)}
                      onChange={() =>
                        toggleOpcao(extrasSelecionados, setExtrasSelecionados, op)
                      }
                    />
                    {op.label}
                  </label>
                ))}
              </div>
            )}

            {/* Quantidade */}
            <div className="flex items-center justify-between mt-6">
              <label className="text-sm font-semibold">Quantidade:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantidadeSelecionada((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full text-xl font-bold"
                  style={{ backgroundColor: corSecundaria, color: corTexto }}
                >
                  –
                </button>
                <span className="text-base font-bold">{quantidadeSelecionada}</span>
                <button
                  onClick={() => setQuantidadeSelecionada((q) => q + 1)}
                  className="w-8 h-8 rounded-full text-xl font-bold"
                  style={{ backgroundColor: corSecundaria, color: corTexto }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setMostrarDetalhes(false)}
                className="px-4 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: corSecundaria, color: corTexto }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionar}
                className="px-4 py-2 rounded-lg font-bold"
                style={{ backgroundColor: corBotao, color: corBotaoTexto }}
              >
                Adicionar ao pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProdutoCard;
