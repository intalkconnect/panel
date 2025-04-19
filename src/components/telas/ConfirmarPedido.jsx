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
  instance,
}) {
  const handleConfirmar = () => {
    if (modoConsumo === "Delivery") {
      const pedido = {
        carrinho,
        total,
        nomeCliente,
        modoConsumo,
        empresaId,
        whatsappId,
        instance, // 👈 garanta que isso esteja aqui
      };

      localStorage.setItem("pedido_para_registrar", JSON.stringify(pedido));
      window.open("/registrar", "_self");
    } else {
      onContinuar();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200">
        <h2 className="text-2xl font-extrabold text-red-600 mb-6 text-center">
          Sua Comanda
        </h2>

        <ul className="divide-y divide-dashed divide-gray-300 mb-6">
          {carrinho.map((item, index) => (
            <li key={index} className="py-3 text-gray-800 text-left">
              <div className="flex justify-between font-medium">
                <span>
                  {item.nome} x{item.quantidade}
                </span>
                <span>
                  {(item.preco * item.quantidade).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>

              {item.extrasSelecionados?.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
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

        <div className="text-right text-xl font-bold text-gray-900 border-t pt-4 mb-6">
          Total:{" "}
          {(Number(total) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onVoltar}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold"
          >
            Voltar
          </button>
          <button
            onClick={handleConfirmar}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmarPedido;
