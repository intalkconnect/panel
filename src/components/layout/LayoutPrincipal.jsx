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
    <div className="min-h-screen flex bg-white text-gray-800">
      {/* Sidebar de Categorias */}
      <aside className="w-48 overflow-y-auto bg-gray-100 p-4">
        {categorias.map((cat) => (
          <CategoriaCard
            key={cat.id}
            categoria={cat}
            selecionada={categoriaSelecionada === cat.id}
            onClick={() => setCategoriaSelecionada(cat.id)}
          />
        ))}
      </aside>

      {/* Produtos */}
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="mb-6 flex items-center gap-4">
          {empresa?.logo_url && (
            <img
              src={empresa.logo_url}
              alt={empresa.nome_exibicao}
              className="h-12 w-auto object-contain"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{empresa?.nome_exibicao}</h1>
            <p className="text-sm text-gray-500">
              {modoConsumo === "Comer aqui" && mesaSelecionada
                ? `Mesa ${mesaSelecionada}`
                : nomeCliente
                ? `Para Levar - ${nomeCliente}`
                : ""}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
      <aside className="w-80 bg-gray-50 p-6 border-l flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">Meu Pedido</h2>
          {carrinho.length === 0 ? (
            <p className="text-center text-gray-500">
              Seu carrinho está vazio.
            </p>
          ) : (
            <>
              <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
                {carrinho.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
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
                    <div className="text-right">
                      <p className="text-sm">
                        {(item.preco * item.quantidade).toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        )}
                      </p>
                      <button
                        onClick={() => remover(item)}
                        className="text-red-500 text-xs font-bold"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-right font-bold mt-4">
                Total:{" "}
                {total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-md font-semibold hover:bg-gray-300"
          >
            Cancelar Pedido
          </button>
          <button
            onClick={finalizarPedido}
            disabled={carrinho.length === 0}
            className={`w-full py-2 rounded-md font-bold ${
              carrinho.length === 0
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Finalizar Pedido
          </button>
        </div>
      </aside>

      {/* Confirmação de cancelamento */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full text-center">
            <h2 className="text-lg font-bold mb-2">Cancelar pedido?</h2>
            <p className="text-gray-600 mb-4">
              Todos os itens serão removidos do carrinho.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Voltar
              </button>
              <button
                onClick={cancelarPedido}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
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
