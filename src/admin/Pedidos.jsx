import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";
import { Receipt, MapPin, ArrowRightCircle, Hourglass, ChefHat, Truck, Clock3, Link as LinkIcon, Rocket, Info } from "lucide-react";
import dayjs from "dayjs";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [novosPedidos, setNovosPedidos] = useState([]);
  const [alertaNovoPedido, setAlertaNovoPedido] = useState(false);
  const [autoAvancar, setAutoAvancar] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

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
        id,
        nome_cliente,
        whatsappId,
        total,
        status,
        created_at,
        tempo_para_pronto,
        numero_pedido,
        clientes ( endereco, id ),
        pedido_itens (
          id,
          quantidade,
          subtotal,
          extras,
          remover,
          produto_id,
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
      const novosPedidosData = data.filter((pedido) => !pedidos.some((p) => p.id === pedido.id));

      if (novosPedidosData.length > 0) {
        setNovosPedidos(novosPedidosData.map((p) => p.id));
        setAlertaNovoPedido(true);
        setTimeout(() => {
          setNovosPedidos([]);
          setAlertaNovoPedido(false);
        }, 4000);

        for (const pedido of novosPedidosData) {
          if (pedido.status === "aguardando") {
            await enviarPost("http://localhost:3000/pedido", {
              type: "notification",
              numero_pedido: pedido.numero_pedido,
              nome_cliente: pedido.nome_cliente,
            });
          } else if (pedido.status === "em_preparo") {
            await enviarPost("http://localhost:3000/pedido", pedido);
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
      ...(novoStatus === "pronto" && { tempo_para_pronto: dayjs().diff(dayjs(createdAt), "minute") }),
    };

    const { error } = await supabase.from("pedidos").update(updateData).eq("id", id);
    if (!error && !silent) fetchPedidos();
    else if (error) console.error("Erro ao avançar pedido:", error);
  }

  function formatPhone(phone) {
    if (!phone) return "Sem telefone";
    phone = phone.replace(/^55/, "");
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  const statusColumns = [
    { title: "Aguardando", status: "aguardando", color: "bg-orange-500", icon: <Hourglass size={20} /> },
    { title: "Em Produção", status: "em_preparo", color: "bg-yellow-500", icon: <ChefHat size={20} /> },
    { title: "Pronto para Entrega", status: "pronto", color: "bg-green-500", icon: <Truck size={20} /> },
  ];

  const totalReceita = pedidos.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalAguardando = pedidos.filter((p) => p.status === "aguardando").length;
  const totalEmProducao = pedidos.filter((p) => p.status === "em_preparo").length;
  const totalPronto = pedidos.filter((p) => p.status === "pronto").length;

  function countPedidosCliente(whatsappId) {
    return pedidos.filter((p) => p.whatsappId === whatsappId).length;
  }

  function renderDetalhesPedido(pedido) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto mt-6">
        <h2 className="text-lg font-bold mb-4">Detalhes do Pedido #{pedido.numero_pedido}</h2>
        {pedido.pedido_itens?.length > 0 ? pedido.pedido_itens.map(item => (
          <div key={item.id} className="border-b border-gray-200 mb-2 pb-2">
            <p className="font-semibold">{item.produtos?.nome || "Produto"}</p>
            <p>Quantidade: {item.quantidade}</p>
            <p>Subtotal: R$ {item.subtotal?.toFixed(2)}</p>
            {item.extras && Object.keys(item.extras).length > 0 && (
              <div className="text-sm text-green-600">
                <p>Extras:</p>
                <ul className="list-disc list-inside">
                  {Object.entries(item.extras).map(([key, value]) => (
                    <li key={key}>{key}: {value}</li>
                  ))}
                </ul>
              </div>
            )}
            {item.remover && Object.keys(item.remover).length > 0 && (
              <div className="text-sm text-red-600">
                <p>Remover:</p>
                <ul className="list-disc list-inside">
                  {Object.entries(item.remover).map(([key, value]) => (
                    <li key={key}>{key}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )) : (
          <p className="text-gray-500">Sem itens no pedido.</p>
        )}
        <button onClick={() => setPedidoSelecionado(null)} className="mt-4 w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-700">Fechar</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      {alertaNovoPedido && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg animate-bounce z-50">
          Novo pedido recebido!
        </div>
      )}
      <div className="flex flex-1 overflow-x-auto p-6 gap-4">
        {statusColumns.map((column) => {
          const pedidosFiltrados = pedidos.filter((p) => p.status === column.status);
          return (
            <div key={column.status} className={`flex flex-col flex-1 min-w-[300px] ${column.color} rounded-md shadow overflow-hidden`}>
              <div className="flex flex-col items-center justify-center bg-black/20 px-4 py-2">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">{column.icon} {column.title}</h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((pedido) => (
                    <div key={pedido.id} className={`bg-white p-4 rounded-lg shadow mb-2 ${novosPedidos.includes(pedido.id) ? "ring-4 ring-green-400 animate-bounce" : ""}`}>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt size={18} className="text-gray-600" />
                          <p className="font-bold">Pedido #{pedido.numero_pedido}</p>
                        </div>
                        <button onClick={() => setPedidoSelecionado(pedido)} className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                          <Info size={14} /> Ver Detalhes
                        </button>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{pedido.nome_cliente || "Cliente não informado"}</p>
                      <p className="text-xs text-gray-500">{formatPhone(pedido.whatsappId)}</p>
                      <p className="text-xs mt-1">Total: R$ {pedido.total?.toFixed(2)}</p>
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

      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {renderDetalhesPedido(pedidoSelecionado)}
        </div>
      )}
    </div>
  );
};

export default Pedidos;
