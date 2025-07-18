import React from "react";
import CategoriaCard from "../telas/CategoriaCard";
import ProdutoCard from "../telas/ProdutoCard";

function LayoutPrincipal({
  empresa,
  categorias,
  produtos,
  categoriaSelecionada,
  setCategoriaSelecionada,
  carrinho,
  setCarrinho,
  modoConsumo,
  mesaSelecionada,
  nomeCliente,
  finalizarPedido,
  cancelarPedido,
  showConfirmCancel,
  setShowConfirmCancel,
}) {
  const produtosFiltrados = produtos.filter(
    (p) => p.categoria_id === categoriaSelecionada
  );

  const total = carrinho.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  const adicionar = (produto) => {
    setCarrinho((prev) => {
      const igual = prev.find(
        (p) =>
          p.id === produto.id &&
          JSON.stringify(p.extrasSelecionados || []) ===
            JSON.stringify(produto.extrasSelecionados || []) &&
          JSON.stringify(p.removerSelecionados || []) ===
            JSON.stringify(produto.removerSelecionados || [])
      );

      if (igual) {
        return prev.map((p) =>
          p === igual ? { ...p, quantidade: p.quantidade + 1 } : p
        );
      }

      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const remover = (produto) => {
    setCarrinho((prev) => {
      const index = prev.findIndex((p) => {
        const mesmaId = p.id === produto.id;
        const extrasIguais =
          JSON.stringify(p.extrasSelecionados || []) ===
          JSON.stringify(produto.extrasSelecionados || []);
        const removerIguais =
          JSON.stringify(p.removerSelecionados || []) ===
          JSON.stringify(produto.removerSelecionados || []);
        return mesmaId && extrasIguais && removerIguais;
      });

      let copia = [...prev];
      if (index !== -1) {
        const item = copia[index];
        if (item.quantidade === 1) {
          copia.splice(index, 1);
        } else {
          copia[index] = { ...item, quantidade: item.quantidade - 1 };
        }
        return copia;
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-gray-800">
      {/* Sidebar */}
      <aside className="md:w-48 w-full md:h-screen overflow-y-auto bg-gray-100 p-4 border-b md:border-b-0 md:border-r">
        <div className="flex md:block overflow-x-auto gap-2 md:gap-0">
          {categorias.map((cat) => (
            <CategoriaCard
              key={cat.id}
              categoria={cat}
              selecionada={categoriaSelecionada === cat.id}
              onClick={() => setCategoriaSelecionada(cat.id)}
            />
          ))}
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col">
        <header className="bg-white border-b pb-4 mb-6">
          <h1 className="text-3xl font-extrabold text-red-600">
            {empresa?.nome_exibicao}
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            {modoConsumo === "Comer aqui" && mesaSelecionada
              ? `Mesa ${mesaSelecionada}`
              : nomeCliente
              ? `Para Levar - ${nomeCliente}`
              : ""}
          </p>
        </header>

        {/* Produtos */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {produtosFiltrados.map((produto) => {
            const quantidade = carrinho
              .filter((p) => p.id === produto.id)
              .reduce((acc, p) => acc + p.quantidade, 0);

            return (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                quantidade={quantidade}
                onAdicionar={adicionar}
                onRemover={remover}
              />
            );
          })}
        </div>
      </main>

      {/* Carrinho */}
      <aside className="md:w-80 w-full bg-gray-50 p-6 border-t md:border-t-0 md:border-l flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Pedido</h2>

          {carrinho.length === 0 ? (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center flex flex-col items-center gap-3 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.293 1.293a1 1 0 000 1.414L7 17m0 0h10m0 0l1.293-1.293a1 1 0 000-1.414L17 13"
                />
              </svg>
              <p className="text-base text-red-600 font-semibold">
                Seu carrinho está vazio
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-3 max-h-64 overflow-y-auto text-sm pr-2">
                {carrinho.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {item.nome} x{item.quantidade}
                      </p>
                      {item.extrasSelecionados?.length > 0 && (
                        <p className="text-xs text-gray-500">
                          +{" "}
                          {item.extrasSelecionados
                            .map((e) => e.label)
                            .join(", ")}
                        </p>
                      )}
                      {item.removerSelecionados?.length > 0 && (
                        <p className="text-xs text-gray-500">
                          –{" "}
                          {item.removerSelecionados
                            .map((r) => r.label)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-semibold text-gray-700">
                        {(item.preco * item.quantidade).toLocaleString(
                          "pt-BR",
                          { style: "currency", currency: "BRL" }
                        )}
                      </p>
                      <button
                        onClick={() => remover(item)}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-right text-lg font-bold mt-4">
                Total:{" "}
                {total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </>
          )}
        </div>

        {/* Botões */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancelar Pedido
          </button>
          <button
            onClick={finalizarPedido}
            disabled={carrinho.length === 0}
            className={`w-full py-2 rounded-lg font-bold ${
              carrinho.length === 0
                ? "bg-green-300 text-white cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Finalizar Pedido
          </button>
        </div>
      </aside>

      {/* Modal de confirmação */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Cancelar pedido?
            </h2>
            <p className="text-gray-600 mb-6">
              Você perderá todos os itens do pedido atual.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
              >
                Voltar
              </button>
              <button
                onClick={cancelarPedido}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LayoutPrincipal;
