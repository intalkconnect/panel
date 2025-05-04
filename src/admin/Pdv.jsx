// src/admin/Pdv.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";
import dayjs from "dayjs";

const Pdv = () => {
  const empresaId = localStorage.getItem("empresa_id");
  const [produtos, setProdutos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [mesaSelecionada, setMesaSelecionada] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState("");
  const [horaAtual, setHoraAtual] = useState(dayjs().format("HH:mm:ss"));

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

      const { data: mesasData } = await supabase
        .from("mesas")
        .select("*")
        .eq("empresa_id", empresaId);

      setProdutos(produtosData || []);
      setMesas(mesasData || []);
    };

    carregarDados();
  }, [empresaId]);

  const adicionarProduto = (produto) => {
    setCarrinho((prev) => {
      const existente = prev.find((p) => p.id === produto.id);
      if (existente) {
        return prev.map((p) =>
          p.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const removerProduto = (produtoId) => {
    setCarrinho((prev) => {
      const item = prev.find((p) => p.id === produtoId);
      if (!item) return prev;
      if (item.quantidade === 1) {
        return prev.filter((p) => p.id !== produtoId);
      }
      return prev.map((p) =>
        p.id === produtoId ? { ...p, quantidade: p.quantidade - 1 } : p
      );
    });
  };

  const total = carrinho.reduce(
    (acc, item) => acc + item.quantidade * parseFloat(item.preco),
    0
  );

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Carrinho */}
      <aside className="w-1/3 bg-gray-100 border-r p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold mb-2">Pedido</h2>
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

          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {carrinho.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center bg-white rounded shadow px-2 py-1"
              >
                <span className="font-medium">
                  {item.nome} x{item.quantidade}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removerProduto(item.id)}
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
              </li>
            ))}
          </ul>

          <div className="mt-4 text-right font-bold text-lg">
            Total: R$ {total.toFixed(2)}
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full bg-yellow-500 py-2 rounded text-white font-bold">
            Aguardar
          </button>
          <button className="w-full bg-red-500 py-2 rounded text-white font-bold">
            Cancelar
          </button>
          <button className="w-full bg-green-600 py-2 rounded text-white font-bold">
            Pagamento
          </button>
        </div>
      </aside>

      {/* Produtos */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="border px-3 py-2 rounded w-1/2"
          />
          <div className="text-sm text-gray-500">Hora: {horaAtual}</div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {produtosFiltrados.map((produto) => (
            <button
              key={produto.id}
              onClick={() => adicionarProduto(produto)}
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
    </div>
  );
};

export default Pdv;
