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

const alertaAudio = new Audio("/alerta.mp3");

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [novosPedidos, setNovosPedidos] = useState([]);
  const [alertaNovoPedido, setAlertaNovoPedido] = useState(false);
  const [autoAvancar, setAutoAvancar] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [idsNotificados, setIdsNotificados] = useState(new Set());

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 15000);

    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission !== "granted") {
            console.warn("Notificações do sistema não foram autorizadas.");
          }
        });
      } else if (Notification.permission === "denied") {
        console.warn("Notificações do sistema estão bloqueadas pelo usuário.");
      }
    }

    return () => clearInterval(interval);
  }, [autoAvancar]);

  function tocarSomAlerta() {
    alertaAudio.play().catch((err) => console.error("Erro ao tocar som:", err));
  }

  function notificarNovoPedido(pedido) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Novo Pedido Recebido", {
        body: `Pedido #${pedido.numero_pedido} de ${pedido.nome_cliente}`,
        icon: "/logo192.png",
      });
    } else {
      setAlertaNovoPedido(true);
      setTimeout(() => setAlertaNovoPedido(false), 5000);
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

    const novosPedidosData = data.filter(
      (pedido) => !pedidos.some((p) => p.id === pedido.id)
    );

    const pedidosNaoNotificados = novosPedidosData.filter(
      (pedido) => !idsNotificados.has(pedido.id)
    );

    if (pedidosNaoNotificados.length > 0) {
      tocarSomAlerta();
      notificarNovoPedido(pedidosNaoNotificados[0]); // Notifica um dos novos pedidos
      setIdsNotificados((prev) => {
        const novoSet = new Set(prev);
        pedidosNaoNotificados.forEach((p) => novoSet.add(p.id));
        return novoSet;
      });
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
      {alertaNovoPedido && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg z-50">
          Novo pedido recebido!
        </div>
      )}

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
      </div>

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
                      className="bg-white p-4 rounded-lg shadow mb-2"
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
    </div>
  );
};

export default Pedidos;
