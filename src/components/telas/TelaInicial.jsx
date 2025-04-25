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

  const corFundo = tema.cor_fundo || "#ffffff";
  const corSecundaria = tema.cor_secundaria || "#f3f4f6";
  const corTexto = tema.cor_texto || "#1f2937";
  const corPrimaria = tema.cor_primaria || "#ef4444";

  return (
    <div
      onClick={onIniciar}
      className="w-full h-screen flex flex-col items-center justify-center text-center cursor-pointer select-none"
      style={{
        background: linear-gradient(to bottom right, ${corFundo}, ${corSecundaria}),
        color: corTexto,
      }}
    >
      <div className="text-7xl mb-6 animate-bounce">{empresa?.icone}</div>

      <h1
        className="text-4xl font-extrabold mb-4"
        style={{ color: corPrimaria }}
      >
        Bem-vindo ao {empresa?.nome_exibicao}
      </h1>

      <p className="text-lg" style={{ color: corTexto }}>
        Toque na tela para iniciar seu pedido
      </p>
    </div>
  );
}

export default TelaInicial;
