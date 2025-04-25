import React, { useEffect, useState } from "react";
import { supabase } from "../../data/supabaseClient";
import { Loader2 } from "lucide-react";

function TelaInicial({ onIniciar, empresa }) {
  const [tema, setTema] = useState(null);

  useEffect(() => {
    const buscarTema = async () => {
      if (!empresa?.id) return;

      const { data, error } = await supabase
        .from("temas")
        .select("*")
        .eq("empresa_id", empresa.id)
        .single();

      if (error) {
        console.error("Erro ao carregar tema:", error);
      } else {
        setTema(data);
      }
    };

    buscarTema();
  }, [empresa]);

  if (!tema) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div
      onClick={onIniciar}
      className="w-full h-screen flex flex-col items-center justify-center text-center cursor-pointer select-none"
      style={{
        background: `linear-gradient(to bottom right, ${tema.cor_fundo}, ${tema.cor_secundaria})`,
        color: tema.cor_texto,
      }}
    >
      <div className="text-7xl mb-6 animate-bounce">{empresa?.icone}</div>

      <h1
        className="text-4xl font-extrabold mb-4"
        style={{ color: tema.cor_primaria }}
      >
        Bem-vindo ao {empresa?.nome_exibicao}
      </h1>

      <p className="text-lg" style={{ color: tema.cor_texto }}>
        Toque na tela para iniciar seu pedido
      </p>
    </div>
  );
}

export default TelaInicial;
