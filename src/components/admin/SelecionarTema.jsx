// components/admin/SelecionarTema.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../data/supabaseClient";

function SelecionarTema() {
  const [temasBase, setTemasBase] = useState([]);
  const [temaSelecionado, setTemaSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const empresaId = localStorage.getItem("empresa_id");

  useEffect(() => {
    const fetchTemas = async () => {
      setCarregando(true);
      const { data, error } = await supabase
        .from("temas_base")
        .select("*")
        .order("nome");

      if (error) {
        console.error("Erro ao buscar temas:", error);
      } else {
        setTemasBase(data);
      }
      setCarregando(false);
    };

    fetchTemas();
  }, []);

  const aplicarTema = async () => {
    if (!temaSelecionado || !empresaId) return;

    setCarregando(true);
    const tema = temasBase.find((t) => t.id === temaSelecionado);

    const { error } = await supabase
      .from("temas")
      .upsert({
        empresa_id: empresaId,
        nome: tema.nome,
        cor_primaria: tema.cor_primaria,
        cor_secundaria: tema.cor_secundaria,
        cor_fundo: tema.cor_fundo,
        cor_texto: tema.cor_texto,
        cor_botao: tema.cor_botao,
        cor_botao_texto: tema.cor_botao_texto,
      }, { onConflict: ["empresa_id"] });

    if (error) {
      console.error("Erro ao aplicar tema:", error);
      setMensagem("Erro ao aplicar tema.");
    } else {
      setMensagem("Tema aplicado com sucesso!");
    }

    setCarregando(false);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Escolha um tema:</label>
      <select
        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={temaSelecionado || ""}
        onChange={(e) => setTemaSelecionado(e.target.value)}
      >
        <option value="" disabled>
          Selecione um tema...
        </option>
        {temasBase.map((tema) => (
          <option key={tema.id} value={tema.id}>
            {tema.nome}
          </option>
        ))}
      </select>

      <button
        onClick={aplicarTema}
        disabled={!temaSelecionado || carregando}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {carregando ? "Aplicando..." : "Aplicar Tema"}
      </button>

      {mensagem && (
        <p className="text-sm text-green-600 dark:text-green-400">{mensagem}</p>
      )}
    </div>
  );
}

export default SelecionarTema;
