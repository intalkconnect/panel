import { useEffect } from "react";

function RegistrarPedido() {
  useEffect(() => {
    const pedido = JSON.parse(localStorage.getItem("pedido_para_registrar"));

    const enviarParaWebhook = async () => {
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

        console.log("✅ Pedido enviado para o webhook!");
        localStorage.removeItem("pedido_para_registrar");

        setTimeout(() => {
          window.close();
        }, 5000);
      } catch (err) {
        console.error("❌ Erro ao enviar para o webhook:", err);
      }
    };

    if (pedido) {
      enviarParaWebhook();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6">
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
      <p className="text-gray-600">Aguarde enquanto o pedido é enviado</p>
    </div>
  );
}

export default RegistrarPedido;
