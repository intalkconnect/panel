import React from "react";
import { ShoppingCartIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

function PedidoResumo({ carrinho, total, onRemover, onFinalizar }) {
  return (
    <div className="bg-white border-t p-4">
      <h2 className="text-xl font-bold mb-2">Meu Pedido</h2>

      {carrinho.length === 0 ? (
        <div className="bg-red-500 text-white flex items-center justify-center py-5 rounded-xl shadow-md gap-2">
          <ShoppingCartIcon className="w-6 h-6" />
          <span className="text-xl font-semibold">
            Seu carrinho está vazio.
          </span>
        </div>
      ) : (
        <>
          <ul className="divide-y max-h-40 overflow-y-auto text-base">
            {carrinho.map((item) => (
              <li
                key={item.id}
                className="py-2 flex justify-between items-center"
              >
                <div>
                  <span className="font-medium">{item.nome}</span> x
                  {item.quantidade}
                </div>
                <div className="flex items-center gap-3">
                  <span>
                    {(item.preco * item.quantidade).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <button
                    onClick={() => onRemover(item.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded-full text-sm"
                  >
                    –
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="text-right text-lg font-bold mt-4 border-t pt-2">
            Total:{" "}
            {total.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>

          <button
            onClick={onFinalizar}
            className="mt-3 w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="w-6 h-6" />
            Finalizar Pedido
          </button>
        </>
      )}
    </div>
  );
}

export default PedidoResumo;
