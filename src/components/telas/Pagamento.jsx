import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import RegistroPedido from "./RegistroPedido";

function Pagamento({ tema }) {
  const [formaSelecionada, setFormaSelecionada] = useState(null);

  if (formaSelecionada) {
    return <RegistroPedido formaPagamento={formaSelecionada} tema={tema} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{
        backgroundColor: tema?.cor_fundo || "#ffffff",
        color: tema?.cor_texto || "#1f2937",
      }}
    >
      <h3 className="text-xl font-semibold mb-4">
        Escolha a forma de pagamento
      </h3>
      <div className="grid grid-cols-3 gap-6">
        <button
          onClick={() => setFormaSelecionada("Pix")}
          className="flex flex-col items-center justify-center p-6 rounded-2xl transition"
          style={{
            backgroundColor: tema?.cor_botao || "#ef4444",
            color: tema?.cor_botao_texto || "#ffffff",
          }}
        >
          <CurrencyDollarIcon className="w-10 h-10 mb-2" />
          Pix
        </button>
        <button
          onClick={() => setFormaSelecionada("Débito")}
          className="flex flex-col items-center justify-center p-6 rounded-2xl transition"
          style={{
            backgroundColor: tema?.cor_botao || "#ef4444",
            color: tema?.cor_botao_texto || "#ffffff",
          }}
        >
          <CreditCardIcon className="w-10 h-10 mb-2" />
          Débito
        </button>
        <button
          onClick={() => setFormaSelecionada("Crédito")}
          className="flex flex-col items-center justify-center p-6 rounded-2xl transition"
          style={{
            backgroundColor: tema?.cor_botao || "#ef4444",
            color: tema?.cor_botao_texto || "#ffffff",
          }}
        >
          <BanknotesIcon className="w-10 h-10 mb-2" />
          Crédito
        </button>
      </div>
    </div>
  );
}

export default Pagamento;
