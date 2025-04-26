import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";
import { Receipt, MapPin, ArrowRightCircle } from "lucide-react";

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
      .select("id, nome_cliente, whatsappId, total, status, clientes ( endereco, id )")
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

  function formatPhone(phone) {
    if (!phone) return "Sem telefone";
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
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
        {statusColumns.map((column) => {
          const pedidosFiltrados = pedidos.filter((p) => p.status === column.status);
          return (
            <div
              key={column.status}
              className={`flex-1 rounded-t-md shadow-lg ${column.color} min-w-[300px] overflow-hidden`}
            >
              <div className="flex items-center justify-between bg-opacity-70 px-4 py-2">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <Receipt size={20} />
                  {column.title}
                </h2>
                <span className="text-white font-semibold">{pedidosFiltrados.length}</span>
              </div>
              <div className="p-4 space-y-4">
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((pedido) => (
                    <div
                      key={pedido.id}
                      className={`bg-white text-gray-800 p-4 rounded-lg shadow flex flex-col gap-2 transition ${
    novosPedidos.includes(pedido.id) ? "ring-4 ring-green-400 animate-pulse" : ""
  }`}
                    >
                      <div className="flex items-center gap-2">
                        <Receipt size={18} className="text-gray-600" />
                        <p className="font-bold">Pedido #{pedido.id.slice(0, 8)}</p>
                      </div>
                      <p className="text-sm">{pedido.nome_cliente || "Cliente não informado"}</p>
                      <p className="text-xs text-gray-500">{formatPhone(pedido.whatsappId)}</p>
                      {pedido.clientes?.endereco ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.clientes.endereco)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-xs text-gray-500 gap-1 hover:text-blue-600 transition"
                        >
                          <MapPin size={14} />
                          {pedido.clientes.endereco}
                        </a>
                      ) : (
                        <div className="flex items-center text-xs text-gray-500 gap-1">
                          <MapPin size={14} />
                          Endereço não disponível
                        </div>
                      )}
                      <p className="font-semibold">Total: R$ {pedido.total?.toFixed(2) || 0}</p>
                      {pedido.status !== "pronto" && (
                        <button
                          onClick={() => avancarPedido(pedido.id, pedido.status)}
                          className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition"
                        >
                          <ArrowRightCircle size={18} /> Atualizar Status
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-white text-center text-sm">Nenhum pedido aqui ainda 😴</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pedidos;
