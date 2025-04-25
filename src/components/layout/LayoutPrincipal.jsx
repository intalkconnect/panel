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
  const tema = empresa?.tema || {};
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
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ backgroundColor: tema.cor_fundo, color: tema.cor_texto }}
    >
      {/* Sidebar */}
      <aside className="md:w-48 w-full md:h-screen overflow-y-auto p-4 border-b md:border-b-0 md:border-r" style={{ backgroundColor: tema.cor_secundaria }}>
        <div className="flex md:block overflow-x-auto gap-2 md:gap-0">
          {categorias.map((cat) => (
            <CategoriaCard
              key={cat.id}
              categoria={cat}
              selecionada={categoriaSelecionada === cat.id}
              onClick={() => setCategoriaSelecionada(cat.id)}
              tema={tema}
            />
          ))}
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col">
        <header className="border-b pb-4 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: tema.cor_primaria }}>
            {empresa?.nome_exibicao}
          </h1>
          <p className="text-sm font-medium">
            {modoConsumo === "Comer aqui" && mesaSelecionada
              ? `Mesa ${mesaSelecionada}`
              : modoConsumo === "Delivery" && nomeCliente
              ? `Delivery - ${nomeCliente}`
              : nomeCliente
              ? `Para Levar - ${nomeCliente}`
              : ""}
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                tema={tema}
              />
            );
          })}
        </div>
      </main>

      {/* Carrinho */}
      <aside className="md:w-80 w-full p-4 sm:p-6 border-t md:border-t-0 md:border-l flex flex-col justify-between" style={{ backgroundColor: tema.cor_secundaria }}>
        <div>
          <h2 className="text-xl font-bold mb-4">Pedido</h2>
          {carrinho.length === 0 ? (
            <div className="p-6 rounded-xl text-center flex flex-col items-center gap-3 shadow-inner" style={{ backgroundColor: "#fff4f4" }}>
              <p className="text-base font-semibold" style={{ color: tema.cor_primaria }}>
                Seu carrinho está vazio
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-3 max-h-64 overflow-y-auto text-sm pr-2">
                {carrinho.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold">
                        {item.nome} x{item.quantidade}
                      </p>
                      {item.extrasSelecionados?.length > 0 && (
                        <p className="text-xs">
                          + {item.extrasSelecionados.map((e) => e.label).join(", ")}
                        </p>
                      )}
                      {item.removerSelecionados?.length > 0 && (
                        <p className="text-xs">
                          – {item.removerSelecionados.map((r) => r.label).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-semibold">
                        {(item.preco * item.quantidade).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <button
                        onClick={() => remover(item)}
                        className="text-xs font-bold hover:underline"
                        style={{ color: tema.cor_primaria }}
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

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="w-full py-2 rounded-lg font-semibold"
            style={{ backgroundColor: "#e2e8f0", color: "#1a202c" }}
          >
            Cancelar Pedido
          </button>
          <button
            onClick={finalizarPedido}
            disabled={carrinho.length === 0}
            className="w-full py-2 rounded-lg font-bold"
            style={{
              backgroundColor: carrinho.length === 0 ? "#a7f3d0" : tema.cor_botao,
              color: tema.cor_botao_texto,
              cursor: carrinho.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            Finalizar Pedido
          </button>
        </div>
      </aside>

      {/* Modal de confirmação */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Cancelar pedido?</h2>
            <p className="mb-6">Você perderá todos os itens do pedido atual.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="px-4 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: "#e2e8f0", color: "#1a202c" }}
              >
                Voltar
              </button>
              <button
                onClick={cancelarPedido}
                className="px-4 py-2 rounded-lg font-bold"
                style={{ backgroundColor: "#dc2626", color: "white" }}
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
