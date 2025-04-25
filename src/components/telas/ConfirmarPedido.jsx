import React from "react";

function ConfirmarPedido({
  carrinho,
  total,
  onVoltar,
  onContinuar,
  modoConsumo,
  nomeCliente,
  empresaId,
  whatsappId,
  phoneNumber,
  tema,
}) {
  const handleConfirmar = () => {
    const pedido = {
      carrinho,
      total,
      nomeCliente,
      modoConsumo,
      empresaId,
      whatsappId,
      phoneNumber,
    };

    localStorage.setItem("pedido_para_registrar", JSON.stringify(pedido));
    onContinuar(); // Redireciona para o componente Pagamento
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: tema?.cor_fundo || "#fff" }}
    >
      <div
        className="rounded-2xl shadow-xl max-w-md w-full p-6 border"
        style={{
          backgroundColor: tema?.cor_secundaria || "#ffffff",
          borderColor: "#e5e7eb",
          color: tema?.cor_texto || "#1f2937",
        }}
      >
        <h2
          className="text-2xl font-extrabold mb-6 text-center"
          style={{ color: tema?.cor_primaria || "#dc2626" }}
        >
          Sua Comanda
        </h2>

        <ul className="divide-y divide-dashed divide-gray-300 mb-6">
          {carrinho.map((item, index) => (
            <li key={index} className="py-3 text-left">
              <div className="flex justify-between font-medium">
                <span>{item.nome} x{item.quantidade}</span>
                <span>
                  {(item.preco * item.quantidade).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>

              {item.extrasSelecionados?.length > 0 && (
                <p className="text-xs mt-1 text-gray-600">
                  <strong>Adicionar:</strong>{" "}
                  {item.extrasSelecionados
                    .map((ex) => (typeof ex === "object" ? ex.label : ex))
                    .join(", ")}
                </p>
              )}

              {item.removerSelecionados?.length > 0 && (
                <p className="text-xs text-gray-600">
                  <strong>Remover:</strong>{" "}
                  {item.removerSelecionados
                    .map((rm) => (typeof rm === "object" ? rm.label : rm))
                    .join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="text-right text-xl font-bold border-t pt-4 mb-6">
          Total:{" "}
          {(Number(total) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onVoltar}
            className="flex-1 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: "#e5e7eb",
              color: tema?.cor_texto || "#1f2937",
            }}
          >
            Voltar
          </button>
          <button
            onClick={handleConfirmar}
            className="flex-1 py-3 rounded-lg font-bold"
            style={{
              backgroundColor: tema?.cor_botao || "#16a34a",
              color: tema?.cor_botao_texto || "#ffffff",
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmarPedido;
