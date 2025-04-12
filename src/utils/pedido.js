import { supabase } from "../data/supabaseClient";

export async function salvarPedido({
    empresaId,
    nomeCliente,
    modoConsumo,
    mesaSelecionada,
    formaPagamento,
    carrinho,
    total,
}) {
    try {
        const { data: pedidoInserido, error: erroPedido } = await supabase
            .from("pedidos")
            .insert([
                {
                    nome_cliente: nomeCliente || null,
                    modo_consumo: modoConsumo,
                    mesa_id: mesaSelecionada || null,
                    forma_pagamento: formaPagamento,
                    total: Number(total.toFixed(2)),
                    empresa_id: empresaId,
                },
            ])
            .select()
            .single();

        if (erroPedido) throw erroPedido;

        const pedidoId = pedidoInserido.id;

        const itens = carrinho.map((item) => ({
            pedido_id: pedidoId,
            produto_id: item.id,
            quantidade: item.quantidade,
            subtotal: Number((item.preco * item.quantidade).toFixed(2)),
            extras: item.extrasSelecionados || [],
            remover: item.removerSelecionados || [],
        }));

        const { error: erroItens } = await supabase
            .from("pedido_itens")
            .insert(itens);

        if (erroItens) throw erroItens;

        console.log("✅ Pedido salvo:", pedidoInserido);
    } catch (error) {
        console.error("❌ Erro ao salvar pedido:", error.message || error);
    }
}
