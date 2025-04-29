import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";
import {
  Receipt,
  MapPin,
  ArrowRightCircle,
  Hourglass,
  ChefHat,
  Truck,
  Clock3,
  Link as LinkIcon,
  Rocket,
  Info
} from "lucide-react";
import dayjs from "dayjs";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [novosPedidos, setNovosPedidos] = useState([]);
  const [alertaNovoPedido, setAlertaNovoPedido] = useState(false);
  const [autoAvancar, setAutoAvancar] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null); // Novo: para modal de detalhes

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 15000);
    return () => clearInterval(interval);
  }, [autoAvancar]);

  async function enviarPost(endpoint, payload) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
    } catch (error) {
      console.error("Erro ao enviar POST:", error);
    }
  }

  async function fetchPedidos() {
    const empresaId = localStorage.getItem("empresa_id");

    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        id, nome_cliente, whatsappId, total, status, created_at, tempo_para_pronto, numero_pedido,
        clientes ( endereco, id ),
        pedido_itens (
          id, quantidade, subtotal, extras, remover,
          produtos ( nome )
        )
      `)
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      return;
    }

    if (autoAvancar && data?.length) {
      const pedidosEmAnalise = data.filter((p) => p.status === "aguardando");
      for (const pedido of pedidosEmAnalise) {
        await avancarPedido(pedido.id, "aguardando", pedido.created_at, true);
      }
    }

    if (pedidos.length > 0) {
      const novosPedidosData = data.filter(
        (pedido) => !pedidos.some((p) => p.id === pedido.id)
      );

      if (novosPedidosData.length > 0) {
        setNovosPedidos(novosPedidosData.map((p) => p.id));
        setAlertaNovoPedido(true);
        setTimeout(() => {
          setNovosPedidos([]);
          setAlertaNovoPedido(false);
        }, 4000);

        for (const pedido of novosPedidosData) {
          if (pedido.status === "aguardando") {
            await enviarPost("http://localhost:9123/pedido", {
              type: "notification",
              numero_pedido: pedido.numero_pedido,
              nome_cliente: pedido.nome_cliente,
            });
          } else if (pedido.status === "em_preparo") {
            await enviarPost("http://localhost:9123/pedido", pedido);
          }
        }
      }
    }

    setPedidos(data);
  }

  async function avancarPedido(id, statusAtual, createdAt, silent = false) {
    let novoStatus = "";
    if (statusAtual === "aguardando") novoStatus = "em_preparo";
    else if (statusAtual === "em_preparo") novoStatus = "pronto";

    const updateData = {
      status: novoStatus,
      ...(novoStatus === "pronto" && {
        tempo_para_pronto: dayjs().diff(dayjs(createdAt), "minute"),
      }),
    };

    const { error } = await supabase
      .from("pedidos")
      .update(updateData)
      .eq("id", id);
    if (!error && !silent) fetchPedidos();
    else if (error) console.error("Erro ao avançar pedido:", error);
  }

  function formatPhone(phone) {
    if (!phone) return "Sem telefone";
    phone = phone.replace(/^55/, "");
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  const statusColumns = [
    {
      title: "Aguardando",
      status: "aguardando",
      color: "bg-orange-500",
      icon: <Hourglass size={20} />,
    },
    {
      title: "Em Produção",
      status: "em_preparo",
      color: "bg-yellow-500",
      icon: <ChefHat size={20} />,
    },
    {
      title: "Pronto para Entrega",
      status: "pronto",
      color: "bg-green-500",
      icon: <Truck size={20} />,
    },
  ];

  const totalReceita = pedidos.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalAguardando = pedidos.filter((p) => p.status === "aguardando").length;
  const totalEmProducao = pedidos.filter((p) => p.status === "em_preparo").length;
  const totalPronto = pedidos.filter((p) => p.status === "pronto").length;

  function countPedidosCliente(whatsappId) {
    return pedidos.filter((p) => p.whatsappId === whatsappId).length;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex flex-wrap justify-center items-center gap-4 px-4 py-2 bg-gray-100 shadow-md">
        <div className="flex-1 bg-white p-4 rounded-lg shadow text-center">
          <h2 className="text-sm font-semibold text-gray-500">Aguardando</h2>
          <p className="text-xl font-bold text-orange-500">{totalAguardando}</p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow text-center">
          <h2 className="text-sm font-semibold text-gray-500">Em Produção</h2>
          <p className="text-xl font-bold text-yellow-500">{totalEmProducao}</p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow text-center">
          <h2 className="text-sm font-semibold text-gray-500">Pronto</h2>
          <p className="text-xl font-bold text-green-500">{totalPronto}</p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow text-center">
          <h2 className="text-sm font-semibold text-gray-500">Receita Total</h2>
          <p className="text-xl font-bold text-indigo-600">R$ {totalReceita.toFixed(2)}</p>
        </div>

        {/* Botão Auto-Avançar */}
        <label htmlFor="autoAvancar" className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-lg shadow">
          <div className="relative">
            <input
              type="checkbox"
              id="autoAvancar"
              checked={autoAvancar}
              onChange={() => setAutoAvancar(!autoAvancar)}
              className="sr-only"
            />
            <div className={`block w-14 h-8 rounded-full transition-all ${autoAvancar ? "bg-green-500" : "bg-gray-300"}`}></div>
            <div className={`dot absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-all ${autoAvancar ? "translate-x-6" : ""}`}></div>
          </div>
          {autoAvancar ? (
            <span className="flex items-center gap-1 text-green-600 font-semibold animate-pulse">
              <Rocket size={16} /> Avançando...
            </span>
          ) : (
            <span>Avançar automaticamente</span>
          )}
        </label>
      </div>

      {/* Alerta Novo Pedido */}
      {alertaNovoPedido && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg animate-bounce z-50">
          Novo pedido recebido!
        </div>
      )}

      {/* Colunas de pedidos */}
      <div className="flex flex-1 overflow-x-auto p-6 gap-4">
        {statusColumns.map((column) => {
          const pedidosFiltrados = pedidos.filter((p) => p.status === column.status);
          return (
            <div key={column.status} className={`flex flex-col flex-1 min-w-[300px] ${column.color} rounded-md shadow overflow-hidden`}>
              <div className="flex flex-col items-center justify-center bg-black/20 px-4 py-2">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  {column.icon} {column.title}
                </h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((pedido) => (
                    <div
                      key={pedido.id}
                      className={`bg-white p-4 rounded-lg shadow mb-2 ${
                        novosPedidos.includes(pedido.id) ? "ring-4 ring-green-400 animate-bounce" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Receipt size={18} className="text-gray-600" />
                            <p className="font-bold">Pedido #{pedido.numero_pedido}</p>
                          </div>
                          <p className="mt-2 text-sm font-semibold">{pedido.nome_cliente || "Cliente não informado"}</p>
                          <p className="text-xs text-gray-500">{formatPhone(pedido.whatsappId)}</p>
                          <div className="flex justify-between items-center text-xs mt-2">
                            <p>Pedido:</p>
                            <div className={`${countPedidosCliente(pedido.whatsappId) === 1 ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"} px-2 py-1 rounded-full font-bold`}>
                              {countPedidosCliente(pedido.whatsappId)}º
                            </div>
                            <p className="font-semibold">Total: R$ {pedido.total?.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => setPedidoSelecionado(pedido)}
                            className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                          >
                            <Info size={14} /> Ver Detalhes
                          </button>
                          <div className="flex items-center gap-1 text-xs text-gray-500 bg-blue-50 p-1 rounded-md">
                            <Clock3 size={14} />
                            {dayjs(pedido.created_at).format("HH:mm")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-700 bg-blue-50 p-2 rounded-md mt-2">
                        <MapPin size={14} />
                        {pedido.clientes?.endereco ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.clientes.endereco)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            <LinkIcon size={14} /> {pedido.clientes.endereco}
                          </a>
                        ) : (
                          <span>Endereço não disponível</span>
                        )}
                      </div>

                      {pedido.status !== "pronto" && (
                        <button
                          onClick={() => avancarPedido(pedido.id, pedido.status, pedido.created_at)}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-md text-sm font-semibold"
                        >
                          <ArrowRightCircle size={18} /> Avançar
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

      {/* Modal de Detalhes */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Detalhes do Pedido #{pedidoSelecionado.numero_pedido}</h2>
            {pedidoSelecionado.pedido_itens?.length > 0 ? (
              pedidoSelecionado.pedido_itens.map((item) => (
                <div key={item.id} className="border-b border-gray-300 pb-2 mb-2">
                  <p className="font-semibold">{item.produtos?.nome || "Produto"}</p>
                  <p className="text-sm">Quantidade: {item.quantidade}</p>
                  <p className="text-sm">Subtotal: R$ {item.subtotal?.toFixed(2)}</p>

{item.extras && Array.isArray(item.extras) && item.extras.length > 0 && (
  <div className="text-sm mt-1 text-green-700">
    <p className="font-medium">Extras:</p>
    <ul className="list-disc list-inside">
      {item.extras.map((extra, index) => (
        <li key={index}>
          {typeof extra === "object" && extra.label ? extra.label : JSON.stringify(extra)}
        </li>
      ))}
    </ul>
  </div>
)}

{item.remover && Array.isArray(item.remover) && item.remover.length > 0 && (
  <div className="text-sm mt-1 text-red-700">
    <p className="font-medium">Remover:</p>
    <ul className="list-disc list-inside">
      {item.remover.map((rem, index) => (
        <li key={index}>
          {typeof rem === "object" && rem.label ? rem.label : JSON.stringify(rem)}
        </li>
      ))}
    </ul>
  </div>
)}


                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum item neste pedido.</p>
            )}

            <button
              onClick={() => setPedidoSelecionado(null)}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;
