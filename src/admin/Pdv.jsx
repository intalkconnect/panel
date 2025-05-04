import React from "react";
import CaixaStatus from "../components/admin/pdv/CaixaStatus";

function Pdv() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Ponto de Venda (PDV)</h1>
      <CaixaStatus />
      {/* Aqui virão outras seções do PDV, como mesas, carrinho, finalização, etc. */}
    </div>
  );
}

export default Pdv;
