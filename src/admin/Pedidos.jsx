import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";
import { Receipt, MapPin, ArrowRightCircle, Hourglass, ChefHat, Truck, Clock3, Link as LinkIcon } from "lucide-react";
import dayjs from "dayjs";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [novosPedidos, setNovosPedidos] = useState([]);
  const [alertaNovoPedido, setAlertaNovoPedido] = useState(false);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchPedidos() {
    const empresaId = localStorage.getItem("empresa_id");

    const { data, error } = await supabase
      .from("pedidos")
      .select("id, nome_cliente, whatsappId, total, status, created_at, tempo_para_pronto, clientes ( endereco, id )")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      return;
    }

    if (pedidos.length > 0) {
      const novos = data.filter((pedido) => !pedidos.some((p) => p.id === pedido.id)).map((pedido) => pedido.id);
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

  async function avancarPedido(id, statusAtual, createdAt) {
    let novoStatus = "";
    let updateData = {};

    if (statusAtual === "aguardando") novoStatus = "em_preparo";
    else if (statusAtual === "em_preparo") {
      novoStatus = "pronto";
      const minutosDecorridos = dayjs().diff(dayjs(createdAt), 'minute');
      updateData.tempo_para_pronto = minutosDecorridos;
    }

    updateData.status = novoStatus;

    const { error } = await supabase
      .from("pedidos")
      .update(updateData)
      .eq("id", id);

    if (!error) {
      fetchPedidos();
    } else {
      console.error("Erro ao avançar pedido:", error);
    }
  }

  function formatPhone(phone) {
    if (!phone) return "Sem telefone";
    phone = phone.replace(/^55/, "");
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  const statusColumns = [
    { title: "Em Análise", status: "aguardando", color: "bg-orange-500", icon: <Hourglass size={20} /> },
    { title: "Em Produção", status: "em_preparo", color: "bg-yellow-500", icon: <ChefHat size={20} /> },
    { title: "Pronto para Entrega", status: "pronto", color: "bg-green-500", icon: <Truck size={20} /> },
  ];

  function countPedidosCliente(whatsappId) {
    return pedidos.filter((p) => p.whatsappId === whatsappId).length;
  }

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
              <div className="flex items-center justify-between bg-black/20 px-4 py-2">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  {column.icon}
                  {column.title}
                </h2>
                <span className="text-white font-semibold">{pedidosFiltrados.length}</span>
              </div>
              <div className="p-4 space-y-4">
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((pedido) => (
                    <div
                      key={pedido.id}
                      className={`bg-white text-gray-800 p-4 rounded-lg shadow flex flex-col gap-3 transition ${novosPedidos.includes(pedido.id) ? "ring-4 ring-green-400 animate-bounce" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt size={18} className="text-gray-600" />
                          <p className="font-bold">Pedido #{pedido.id.slice(0, 8)}</p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock3 size={14} />
                          {dayjs(pedido.created_at).format('HH:mm')}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-sm font-semibold">{pedido.nome_cliente || "Cliente não informado"}</p>
                        <p className="text-xs text-gray-500">{formatPhone(pedido.whatsappId)}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <p>Pedidos:</p>
                          <div
                            className={`${countPedidosCliente(pedido.whatsappId) === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'} font-bold px-2 py-1 rounded-full`}
                            title={countPedidosCliente(pedido.whatsappId) === 1 ? 'Primeiro pedido!' : 'Cliente frequente'}
                          >
                            {countPedidosCliente(pedido.whatsappId)}
                          </div>
                          <p className="font-semibold">Total: R$ {pedido.total?.toFixed(2) || 0}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-700 bg-blue-50 p-2 rounded-md">
                          <MapPin size={14} />
                          {pedido.clientes?.endereco ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.clientes.endereco)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <LinkIcon size={14} /> {pedido.clientes.endereco}
                            </a>
                          ) : (
                            <span>Endereço não disponível</span>
                          )}
                        </div>
                      </div>
                      {pedido.status !== "pronto" && (
                        <button
                          onClick={() => avancarPedido(pedido.id, pedido.status, pedido.created_at)}
                          className="mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-md text-sm font-semibold transition"
                        >
                          <ArrowRightCircle size={18} /> Avançar Pedido
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
