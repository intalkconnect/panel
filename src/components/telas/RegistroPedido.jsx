import React, { useEffect, useState } from "react";

function RegistroPedido({ formaPagamento }) {
  const [status, setStatus] = useState("enviando");

  useEffect(() => {
    const pedido = JSON.parse(localStorage.getItem("pedido_para_registrar"));

    if (!pedido) return;

    const registrar = async () => {
      try {
        const res = await fetch(
          "https://mensageria-backend-n8n.9j9goo.easypanel.host/webhook/2add3ce5-aa7a-42dd-8ff4-f94ef7f08955",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome_cliente: pedido.nomeCliente,
              modo_consumo: pedido.modoConsumo,
              empresa_id: pedido.empresaId,
              whatsapp_id: pedido.whatsappId,
              instance: pedido.instance,
              total: Number(pedido.total.toFixed(2)),
              forma_pagamento: formaPagamento,
              itens: pedido.carrinho.map((item) => ({
                produto_id: item.id,
                nome: item.nome,
                quantidade: item.quantidade,
                subtotal: Number((item.preco * item.quantidade).toFixed(2)),
                extras: item.extrasSelecionados || [],
                remover: item.removerSelecionados || [],
              })),
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`Erro HTTP ${res.status}`);
        }

        localStorage.removeItem("pedido_para_registrar");
        setStatus("enviado");

        setTimeout(() => {
          const numero = pedido.phoneNumber.replace(/[^0-9]/g, "");
          window.location.href = `https://wa.me/${numero}`;
        }, 2000);
      } catch (err) {
        console.error("Erro ao registrar o pedido:", err);
        setStatus("erro");
      }
    };

    registrar();
  }, [formaPagamento]);

  if (status === "enviando") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-8">
        <svg
          className="animate-spin h-16 w-16 text-green-600 mb-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Registrando pedido...
        </h1>
        <p className="text-gray-600">Aguarde um instante</p>
      </div>
    );
  }

  if (status === "enviado") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-8">
        <svg
          className="h-16 w-16 text-green-500 mb-4 animate-bounce"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          Pedido registrado com sucesso!
        </h1>
        <p className="text-gray-700">Redirecionando para o WhatsApp...</p>
      </div>
    );
  }

  if (status === "erro") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Erro ao registrar o pedido ❌
        </h1>
        <p className="text-gray-700">Tente novamente em alguns segundos</p>
      </div>
    );
  }

  return null;
}

export default RegistroPedido;
