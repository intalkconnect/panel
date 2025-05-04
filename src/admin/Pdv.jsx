import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";
import { registrarPedido } from "../services/pedidoService";
import dayjs from "dayjs";

const Pdv = () => {
  const empresaId = localStorage.getItem("empresa_id");
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [mesaSelecionada, setMesaSelecionada] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [horaAtual, setHoraAtual] = useState(dayjs().format("HH:mm:ss"));

  const [modalProduto, setModalProduto] = useState(null);
  const [extrasSelecionados, setExtrasSelecionados] = useState([]);
  const [removerSelecionados, setRemoverSelecionados] = useState([]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraAtual(dayjs().format("HH:mm:ss"));
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      const { data: produtosData } = await supabase
        .from("produtos")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("ativo", true);

      const { data: categoriasData } = await supabase
        .from("categorias")
        .select("*")
        .eq("empresa_id", empresaId);

      const { data: mesasData } = await supabase
        .from("mesas")
        .select("*")
        .eq("empresa_id", empresaId);

      setProdutos(produtosData || []);
      setCategorias(categoriasData || []);
      setMesas(mesasData || []);
    };

    carregarDados();
  }, [empresaId]);

  const abrirModalOuAdicionar = (produto) => {
    if (
      (produto.extras && Array.isArray(produto.extras)) ||
      (produto.remover && Array.isArray(produto.remover))
    ) {
      setExtrasSelecionados([]);
      setRemoverSelecionados([]);
      setModalProduto(produto);
    } else {
      adicionarProduto(produto);
    }
  };

  const confirmarAdicaoComOpcoes = () => {
    adicionarProduto({
      ...modalProduto,
      extrasSelecionados,
      removerSelecionados,
    });
    setModalProduto(null);
  };

  const adicionarProduto = (produto) => {
    setCarrinho((prev) => {
      const existente = prev.find(
        (p) =>
          p.id === produto.id &&
          JSON.stringify(p.extrasSelecionados || []) ===
            JSON.stringify(produto.extrasSelecionados || []) &&
          JSON.stringify(p.removerSelecionados || []) ===
            JSON.stringify(produto.removerSelecionados || [])
      );

      if (existente) {
        return prev.map((p) =>
          p === existente ? { ...p, quantidade: p.quantidade + 1 } : p
        );
      }

      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const removerProduto = (produtoIndex) => {
    setCarrinho((prev) => {
      const item = prev[produtoIndex];
      if (!item) return prev;

      if (item.quantidade === 1) {
        return prev.filter((_, i) => i !== produtoIndex);
      }

      return prev.map((p, i) =>
        i === produtoIndex ? { ...p, quantidade: p.quantidade - 1 } : p
      );
    });
  };

  const limparCarrinho = () => setCarrinho([]);

  const total = carrinho.reduce(
    (acc, item) => acc + item.quantidade * parseFloat(item.preco),
    0
  );

  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter((p) => p.categoria_id === categoriaSelecionada)
    : produtos;

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Carrinho */}
      <aside className="w-1/3 bg-gray-100 border-r p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">Carrinho</h2>
          <select
            value={mesaSelecionada}
            onChange={(e) => setMesaSelecionada(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          >
            <option value="">Selecione uma mesa</option>
            {mesas.map((mesa) => (
              <option key={mesa.id} value={mesa.id}>
                Mesa {mesa.numero}
              </option>
            ))}
          </select>

          <ul className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {carrinho.map((item, index) => (
              <li
                key={index}
                className="flex flex-col bg-white rounded shadow px-2 py-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {item.nome} x{item.quantidade}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removerProduto(index)}
                      className="bg-red-500 text-white w-6 h-6 rounded"
                    >
                      –
                    </button>
                    <button
                      onClick={() => adicionarProduto(item)}
                      className="bg-green-500 text-white w-6 h-6 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                {(item.extrasSelecionados?.length > 0 ||
                  item.removerSelecionados?.length > 0) && (
                  <div className="text-xs text-gray-500 mt-1 ml-1">
                    {item.extrasSelecionados?.map((e) => `+${e}`).join(", ")}{" "}
                    {item.removerSelecionados
                      ?.map((r) => `–${r}`)
                      .join(", ")}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-2 text-right font-bold text-lg">
            Total: R$ {total.toFixed(2)}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={limparCarrinho}
            className="w-full bg-red-500 py-2 rounded text-white font-bold"
          >
            Cancelar Pedido
          </button>
          <button
            onClick={async () => {
              try {
                await registrarPedido({
                  carrinho,
                  mesaId: mesaSelecionada,
                  modoConsumo: "mesa",
                  formaPagamento: "dinheiro",
                  nomeCliente: "",
                });
                setCarrinho([]);
                alert("Pedido registrado com sucesso!");
              } catch (err) {
                console.error(err);
                alert("Erro ao registrar pedido.");
              }
            }}
            className="w-full bg-green-600 py-2 rounded text-white font-bold"
          >
            Finalizar Pagamento
          </button>
        </div>
      </aside>

      {/* Produtos */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              className={`px-3 py-1 rounded border ${
                categoriaSelecionada === null ? "bg-black text-white" : ""
              }`}
              onClick={() => setCategoriaSelecionada(null)}
            >
              Todas
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                className={`px-3 py-1 rounded border ${
                  categoriaSelecionada === cat.id ? "bg-black text-white" : ""
                }`}
                onClick={() => setCategoriaSelecionada(cat.id)}
              >
                {cat.nome}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500">Hora: {horaAtual}</div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {produtosFiltrados.map((produto) => (
            <button
              key={produto.id}
              onClick={() => abrirModalOuAdicionar(produto)}
              className="border p-4 rounded hover:bg-gray-100 text-center"
            >
              {produto.imagem_url && (
                <img
                  src={produto.imagem_url}
                  alt={produto.nome}
                  className="h-20 mx-auto mb-2 object-contain"
                />
              )}
              <h3 className="font-semibold text-sm">{produto.nome}</h3>
              <p className="text-green-700 font-bold text-sm">
                R$ {parseFloat(produto.preco).toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </main>

      {/* Modal de seleção de extras/remover */}
      {modalProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-2">{modalProduto.nome}</h2>

            {modalProduto.extras?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-1">Adicionar:</h3>
                {modalProduto.extras.map((extra) => (
                  <label key={extra} className="block text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={extra}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExtrasSelecionados((prev) => [...prev, extra]);
                        } else {
                          setExtrasSelecionados((prev) =>
                            prev.filter((ex) => ex !== extra)
                          );
                        }
                      }}
                    />
                    {extra}
                  </label>
                ))}
              </div>
            )}

            {modalProduto.remover?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-1">Remover:</h3>
                {modalProduto.remover.map((item) => (
                  <label key={item} className="block text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={item}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRemoverSelecionados((prev) => [...prev, item]);
                        } else {
                          setRemoverSelecionados((prev) =>
                            prev.filter((r) => r !== item)
                          );
                        }
                      }}
                    />
                    {item}
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded"
                onClick={() => setModalProduto(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={confirmarAdicaoComOpcoes}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pdv;
