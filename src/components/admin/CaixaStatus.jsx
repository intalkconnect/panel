// components/pdv/CaixaStatus.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../data/supabaseClient";

function CaixaStatus() {
  const empresaId = localStorage.getItem("empresa_id");
  const [caixaAberto, setCaixaAberto] = useState(null);
  const [valorInicial, setValorInicial] = useState("");
  const [carregando, setCarregando] = useState(true);

  const buscarStatus = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("caixas")
      .select("*")
      .eq("empresa_id", empresaId)
      .is("fechado_em", null)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar caixa:", error);
    } else {
      setCaixaAberto(data || null);
    }
    setCarregando(false);
  };

  useEffect(() => {
    buscarStatus();
  }, []);

  const abrirCaixa = async () => {
    if (!valorInicial) return;
    const { error } = await supabase.from("caixas").insert([
      {
        empresa_id: empresaId,
        valor_abertura: parseFloat(valorInicial),
        aberto_por: "admin", // ajustar para usuário real se houver auth
      },
    ]);

    if (!error) {
      setValorInicial("");
      buscarStatus();
    } else {
      console.error("Erro ao abrir caixa:", error);
    }
  };

  const fecharCaixa = async () => {
    if (!caixaAberto) return;

    const { error } = await supabase
      .from("caixas")
      .update({ fechado_em: new Date(), valor_fechamento: caixaAberto.valor_abertura }) // simulando mesmo valor
      .eq("id", caixaAberto.id);

    if (!error) {
      buscarStatus();
    } else {
      console.error("Erro ao fechar caixa:", error);
    }
  };

  if (carregando) return <p>Carregando caixa...</p>;

  return (
    <div className="p-4 bg-white shadow rounded-lg space-y-4">
      {caixaAberto ? (
        <>
          <p className="text-green-600 font-bold">Caixa em aberto</p>
          <p>
            Abertura: R${" "}
            {Number(caixaAberto.valor_abertura).toFixed(2).replace(".", ",")}
          </p>
          <button
            onClick={fecharCaixa}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Fechar caixa
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-700 font-medium">Nenhum caixa aberto</p>
          <input
            type="number"
            step="0.01"
            placeholder="Valor inicial"
            value={valorInicial}
            onChange={(e) => setValorInicial(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          <button
            onClick={abrirCaixa}
            disabled={!valorInicial}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Abrir caixa
          </button>
        </>
      )}
    </div>
  );
}

export default CaixaStatus;
