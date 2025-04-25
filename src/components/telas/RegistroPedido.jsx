import React, { useEffect, useState } from "react";
import { supabase } from "../../data/supabaseClient";

function RegistroPedido({ formaPagamento }) {
  const [status, setStatus] = useState("enviando");
  const [redirect, setRedirect] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [tema, setTema] = useState(null);

  // Carrega o tema com base no empresa_id
  useEffect(() => {
    const carregarTema = async () => {
      const pedidoData = localStorage.getItem("pedido_para_registrar");
      if (!pedidoData) return;
      const pedido = JSON.parse(pedidoData);

      const { data, error } = await supabase
        .from("temas")
        .select("*")
        .eq("empresa_id", pedido.empresaId)
        .single();

      if (data) setTema(data);
      else console.error("Erro ao buscar tema:", error);
    };

    carregarTema();
  }, []);

  // Envia pedido
  useEffect(() => {
    const pedidoData = localStorage.getItem("pedido_para_registrar");
    if (!pedidoData) return;

    const pedido = JSON.parse(pedidoData);

    if (!pedido || !pedido.phoneNumber) {
      setStatus("erro");
      return;
    }

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

        if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

        setTelefone(pedido.phoneNumber);
        localStorage.removeItem("pedido_para_registrar");
        setStatus("enviado");

        setTimeout(() => {
          setRedirect(true);
        }, 1500);
      } catch (err) {
        setStatus("erro");
        console.error("Erro ao registrar o pedido:", err);
      }
    };

    registrar();
  }, [formaPagamento]);

  // Redirecionamento
  useEffect(() => {
    if (redirect && telefone) {
      const numero = telefone.replace(/\D/g, "");
      window.location.href = `https://wa.me/${numero}`;
    }
  }, [redirect, telefone]);

  // Spinner
  if (!tema) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" className="opacity-75" />
        </svg>
      </div>
    );
  }

  const containerStyle = {
    backgroundColor: tema.cor_fundo,
    color: tema.cor_texto,
  };

  const iconColor = {
    enviando: tema.cor_primaria,
    enviado: tema.cor_botao,
    erro: "#dc2626", // Vermelho padrão
  };

  const textColor = {
    enviado: tema.cor_botao_texto,
    erro: tema.cor_texto,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8" style={containerStyle}>
      {status === "enviando" && (
        <>
          <svg className="animate-spin h-16 w-16 mb-6" fill="none" viewBox="0 0 24 24" style={{ color: iconColor.enviando }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <h1 className="text-2xl font-bold mb-2">Registrando pedido...</h1>
          <p>Aguarde um instante</p>
        </>
      )}

      {status === "enviado" && (
        <>
          <svg className="h-16 w-16 mb-4 animate-bounce" viewBox="0 0 20 20" fill={iconColor.enviado}>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <h1 className="text-2xl font-bold mb-2" style={{ color: textColor.enviado }}>
            Pedido registrado com sucesso!
          </h1>
          <p style={{ color: tema.cor_texto }}>Redirecionando para o WhatsApp...</p>
        </>
      )}

      {status === "erro" && (
        <>
          <h1 className="text-2xl font-bold mb-2" style={{ color: textColor.erro }}>
            Erro ao registrar o pedido ❌
          </h1>
          <p style={{ color: tema.cor_texto }}>Tente novamente em alguns segundos</p>
        </>
      )}
    </div>
  );
}

export default RegistroPedido;
