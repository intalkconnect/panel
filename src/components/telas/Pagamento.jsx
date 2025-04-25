import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import RegistroPedido from "./RegistroPedido";

function Pagamento({ tema }) {
  const [formaSelecionada, setFormaSelecionada] = useState(null);

  const corFundo = tema?.cor_fundo || "#ffffff";
  const corTexto = tema?.cor_texto || "#1f2937";
  const corBotao = tema?.cor_botao || "#ef4444";
  const corBotaoTexto = tema?.cor_botao_texto || "#ffffff";

  if (formaSelecionada) {
    return <RegistroPedido formaPagamento={formaSelecionada} tema={tema} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ backgroundColor: corFundo, color: corTexto }}
    >
      <h3 className="text-xl font-semibold mb-4">
        Escolha a forma de pagamento
      </h3>

      <div className="grid grid-cols-3 gap-6">
        {[
          { label: "Pix", icon: CurrencyDollarIcon },
          { label: "Débito", icon: CreditCardIcon },
          { label: "Crédito", icon: BanknotesIcon },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setFormaSelecionada(label)}
            className="flex flex-col items-center justify-center p-6 rounded-2xl transition hover:scale-105"
            style={{
              backgroundColor: corBotao,
              color: corBotaoTexto,
            }}
          >
            <Icon className="w-10 h-10 mb-2" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Pagamento;
