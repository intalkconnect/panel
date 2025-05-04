import { supabase } from "../data/supabaseClient";

export async function registrarPedido({
  carrinho,
  mesaId,
  modoConsumo,
  formaPagamento,
  nomeCliente,
}) {
  const empresaId = localStorage.getItem("empresa_id");

  const total = carrinho.reduce(
    (acc, item) => acc + item.quantidade * parseFloat(item.preco),
    0
  );

  const { data: pedido, error: erroPedido } = await supabase
    .from("pedidos")
    .insert({
      nome_cliente: nomeCliente || null,
      modo_consumo: modoConsumo,
      mesa_id: mesaId || null,
      forma_pagamento: formaPagamento,
      total,
      empresa_id: empresaId,
    })
    .select()
    .single();

  if (erroPedido) {
    console.error("Erro ao inserir pedido:", erroPedido);
    throw erroPedido;
  }

  const itens = carrinho.map((item) => ({
    pedido_id: pedido.id,
    produto_id: item.id,
    quantidade: item.quantidade,
    subtotal: item.quantidade * parseFloat(item.preco),
    extras: Array.isArray(item.extrasSelecionados)
      ? item.extrasSelecionados
      : [],
    remover: Array.isArray(item.removerSelecionados)
      ? item.removerSelecionados
      : [],
  }));

  const { error: erroItens } = await supabase
    .from("pedido_itens")
    .insert(itens);

  if (erroItens) {
    console.error("Erro ao inserir itens do pedido:", erroItens);
    throw erroItens;
  }

  return pedido;
}
