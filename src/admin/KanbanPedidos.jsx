import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";

const KanbanPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [novosPedidos, setNovosPedidos] = useState([]);
  const [alertaNovoPedido, setAlertaNovoPedido] = useState(false);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchPedidos() {
    const empresaId = localStorage.getItem("empresa_id");

    const { data, error } = await supabase
      .from("pedidos")
      .select("id, nome_cliente, whatsappId, total, status")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      return;
    }

    if (pedidos.length > 0) {
      const novos = data.filter(
        (pedido) => !pedidos.some((p) => p.id === pedido.id)
      ).map((pedido) => pedido.id);
      if (novos.length > 0) {
        setNovosPedidos(novos);
        setAlertaNovoPedido(true);
        setTimeout(() => {
          setNovosPedidos([]);
          setAlertaNovoPedido(false);
        }, 4000);
      }
    }

    setPedidos(data);
  }

  async function avancarPedido(id, statusAtual) {
    let novoStatus = "";
    if (statusAtual === "aguardando") novoStatus = "em_preparo";
    else if (statusAtual === "em_preparo") novoStatus = "pronto";

    const { error } = await supabase
      .from("pedidos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (!error) {
      fetchPedidos();
    } else {
      console.error("Erro ao avançar pedido:", error);
    }
  }

  const statusColumns = [
    { title: "Em Análise", status: "aguardando", color: "bg-orange-400" },
    { title: "Em Produção", status: "em_preparo", color: "bg-yellow-400" },
    { title: "Pronto para Entrega", status: "pronto", color: "bg-green-400" },
  ];

  return (
    <div className="relative">
      {alertaNovoPedido && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg animate-bounce z-50">
          Novo pedido recebido!
        </div>
      )}
      <div className="flex gap-4 p-6 overflow-x-auto min-h-screen">
        {statusColumns.map((column) => (
          <div
            key={column.status}
            className={`flex-1 p-4 rounded-xl shadow-lg ${column.color} min-w-[300px]`}
          >
            <h2 className="text-white text-xl font-bold mb-4 text-center">{column.title}</h2>
            <div className="space-y-4">
              {pedidos.filter((p) => p.status === column.status).map((pedido) => (
                <div
                  key={pedido.id}
                  className={`bg-white text-gray-800 p-4 rounded-lg shadow flex flex-col gap-2 transition ${
    novosPedidos.includes(pedido.id) ? "ring-4 ring-green-400 animate-pulse" : ""
  }`}
                >
                  <p className="font-bold">Pedido #{pedido.id.slice(0, 8)}</p>
                  <p className="text-sm">{pedido.nome_cliente || "Cliente não informado"}</p>
                  <p className="text-xs text-gray-500">{pedido.whatsappId || "Sem telefone"}</p>
                  <p className="font-semibold">Total: R$ {pedido.total?.toFixed(2) || 0}</p>
                  {pedido.status !== "pronto" && (
                    <button
                      onClick={() => avancarPedido(pedido.id, pedido.status)}
                      className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                    >
                      Avançar pedido →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanPedidos;
