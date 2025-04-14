import React, { useState } from "react";

function ProdutoCard({ produto, onAdicionar, onRemover, quantidade = 0 }) {
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

  return (
    <>
      <div className="bg-white rounded-3xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 p-6 flex flex-col items-center justify-between w-full max-w-sm mx-auto">
        <img
          src={produto.imagem_url}
          alt={produto.nome}
          loading="lazy"
          className="w-20 h-20 object-contain mb-2"
        />
        <h2 className="text-base font-bold text-center text-gray-800">
          {produto.nome}
        </h2>
        <p className="text-emerald-600 font-semibold text-sm mb-2">
          {produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>

        {produto.quantidade === 0 ? (
          <div className="mt-2 px-6 py-2 bg-red-100 text-red-500 rounded-full text-sm font-semibold shadow-inner">
            Esgotado
          </div>
        ) : quantidade === 0 ? (
          <button
            onClick={handleCliqueAdicionar}
            className="mt-2 bg-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
          >
            Adicionar
          </button>
        ) : (
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() =>
                temDetalhamento
                  ? onRemover({
                      ...produto,
                      extrasSelecionados,
                      removerSelecionados,
                    })
                  : onRemover(produto)
              }
              className="bg-red-500 text-white w-8 h-8 rounded-full text-lg font-bold hover:bg-red-600"
            >
              –
            </button>

            <span className="text-base font-bold">{quantidade}</span>

            <button
              onClick={() =>
                temDetalhamento ? abrirDetalhes() : onAdicionar(produto)
              }
              className="bg-red-500 text-white w-8 h-8 rounded-full text-lg font-bold hover:bg-red-600"
            >
              +
            </button>
          </div>
        )}
      </div>

      {mostrarDetalhes && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
          onClick={() => setMostrarDetalhes(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-left relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
              {produto.nome}
            </h3>
            <p className="text-gray-700 text-sm mb-4 whitespace-pre-wrap">
              {produto.detalhamento?.descricao}
            </p>

            {produto.detalhamento?.remover?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1 text-gray-700">
                  Remover:
                </h4>
                {produto.detalhamento.remover.map((op) => (
                  <label
                    key={op.id}
                    className="flex items-center gap-2 text-sm mb-1"
                  >
                    <input
                      type="checkbox"
                      checked={removerSelecionados.some((r) => r.id === op.id)}
                      onChange={() =>
                        toggleOpcao(
                          removerSelecionados,
                          setRemoverSelecionados,
                          op
                        )
                      }
                    />
                    {op.label}
                  </label>
                ))}
              </div>
            )}

            {produto.detalhamento?.extras?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1 text-gray-700">
                  Adicionar:
                </h4>
                {produto.detalhamento.extras.map((op) => (
                  <label
                    key={op.id}
                    className="flex items-center gap-2 text-sm mb-1"
                  >
                    <input
                      type="checkbox"
                      checked={extrasSelecionados.some((e) => e.id === op.id)}
                      onChange={() =>
                        toggleOpcao(
                          extrasSelecionados,
                          setExtrasSelecionados,
                          op
                        )
                      }
                    />
                    {op.label}
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <label className="text-sm font-semibold text-gray-700">
                Quantidade:
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setQuantidadeSelecionada((q) => Math.max(1, q - 1))
                  }
                  className="w-8 h-8 rounded-full bg-gray-200 text-xl font-bold hover:bg-gray-300"
                >
                  –
                </button>
                <span className="text-base font-bold">
                  {quantidadeSelecionada}
                </span>
                <button
                  onClick={() => setQuantidadeSelecionada((q) => q + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 text-xl font-bold hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setMostrarDetalhes(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionar}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
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
