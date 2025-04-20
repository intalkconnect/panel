import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

function Pagamento({ onEscolherForma }) {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const registrarPedido = (formaPagamento) => {
    const pedido = JSON.parse(localStorage.getItem("pedido_para_registrar"));

    if (!pedido) return;

    if (pedido.modoConsumo === "Delivery") {
      setEnviando(true);

      fetch(
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
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Erro HTTP ${res.status}`);
          }
          console.log("✅ Pedido registrado com sucesso!");
          localStorage.removeItem("pedido_para_registrar");
          setEnviando(false);
          setEnviado(true);

          setTimeout(() => {
            window.close();
          }, 3000);
        })
        .catch((err) => {
          console.error("❌ Erro ao registrar o pedido:", err);
          setEnviando(false);
        });
    } else {
      onEscolherForma(formaPagamento);
    }
  };

  const handleEscolherForma = (forma) => {
    registrarPedido(forma);
  };

  if (enviando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-center">
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
          Enviando pedido...
        </h1>
        <p className="text-gray-600">Aguarde enquanto registramos seu pedido</p>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          Pedido enviado com sucesso! ✅
        </h1>
        <p className="text-gray-700">Essa janela será fechada automaticamente.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-gray-800">
      <h3 className="text-xl font-semibold mb-4">
        Escolha a forma de pagamento
      </h3>
      <div className="grid grid-cols-3 gap-6">
        <button
          onClick={() => handleEscolherForma("Pix")}
          className="flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 text-white p-6 rounded-2xl"
        >
          <CurrencyDollarIcon className="w-10 h-10 mb-2" />
          Pix
        </button>
        <button
          onClick={() => handleEscolherForma("Débito")}
          className="flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 text-white p-6 rounded-2xl"
        >
          <CreditCardIcon className="w-10 h-10 mb-2" />
          Débito
        </button>
        <button
          onClick={() => handleEscolherForma("Crédito")}
          className="flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 text-white p-6 rounded-2xl"
        >
          <BanknotesIcon className="w-10 h-10 mb-2" />
          Crédito
        </button>
      </div>
    </div>
  );
}

export default Pagamento;
