// Pagamento.jsx
import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import RegistroPedido from "./RegistroPedido";

function Pagamento() {
  const [formaSelecionada, setFormaSelecionada] = useState(null);

  if (formaSelecionada) {
    return <RegistroPedido formaPagamento={formaSelecionada} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-gray-800">
      <h3 className="text-xl font-semibold mb-4">
        Escolha a forma de pagamento
      </h3>
      <div className="grid grid-cols-3 gap-6">
        <button
          onClick={() => setFormaSelecionada("Pix")}
          className="flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 text-white p-6 rounded-2xl"
        >
          <CurrencyDollarIcon className="w-10 h-10 mb-2" />
          Pix
        </button>
        <button
          onClick={() => setFormaSelecionada("Débito")}
          className="flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 text-white p-6 rounded-2xl"
        >
          <CreditCardIcon className="w-10 h-10 mb-2" />
          Débito
        </button>
        <button
          onClick={() => setFormaSelecionada("Crédito")}
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
