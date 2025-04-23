import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { supabase } from "../../data/supabaseClient";

const diasSemana = [
  { id: "segunda", label: "Segunda-feira" },
  { id: "terca", label: "Terça-feira" },
  { id: "quarta", label: "Quarta-feira" },
  { id: "quinta", label: "Quinta-feira" },
  { id: "sexta", label: "Sexta-feira" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

const HorariosFuncionamento = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const empresaId = localStorage.getItem("empresa_id");

  useEffect(() => {
    if (!empresaId) return;

    const carregarOuCriarHorarios = async () => {
      const { data, error } = await supabase
        .from("horarios_funcionamento")
        .select("*")
        .eq("empresa_id", empresaId);

      if (error) {
        console.error("Erro ao carregar horários:", error);
        return;
      }

      if (data.length === 0) {
        // Se não houver registros, cria os padrões
        const defaultHorarios = diasSemana.map((dia) => ({
          empresa_id: empresaId,
          dia_semana: dia.id,
          abre: "00:00",
          fecha: "23:59",
          ativo: true,
        }));

        const { error: insertError } = await supabase
          .from("horarios_funcionamento")
          .insert(defaultHorarios);

        if (insertError) {
          console.error("Erro ao criar horários padrão:", insertError);
        } else {
          setHorarios(defaultHorarios);
        }
      } else {
        setHorarios(data);
      }

      setLoading(false);
    };

    carregarOuCriarHorarios();
  }, [empresaId]);

  const handleHorarioChange = (index, campo, valor) => {
    const novos = [...horarios];
    novos[index][campo] = valor;
    setHorarios(novos);
  };

  const salvarHorarios = async () => {
    setSalvando(true);
    for (const horario of horarios) {
      const { id, ...rest } = horario;
      if (id) {
        await supabase.from("horarios_funcionamento").update(rest).eq("id", id);
      }
    }
    setSalvando(false);
    alert("Horários atualizados com sucesso!");
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow border dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-blue-600" />
        <h2 className="text-xl font-semibold">Horários de Funcionamento</h2>
      </div>

      {loading ? (
        <p>Carregando horários...</p>
      ) : (
        <div className="space-y-4">
          {diasSemana.map((dia) => {
            const horario = horarios.find((h) => h.dia_semana === dia.id);
            const index = horarios.findIndex((h) => h.dia_semana === dia.id);
            return horario ? (
              <div key={dia.id} className="grid grid-cols-3 items-center gap-4">
                <label className="font-medium">{dia.label}</label>
                <input
                  type="time"
                  value={horario.abre}
                  onChange={(e) =>
                    handleHorarioChange(index, "abre", e.target.value)
                  }
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="time"
                  value={horario.fecha}
                  onChange={(e) =>
                    handleHorarioChange(index, "fecha", e.target.value)
                  }
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
            ) : null;
          })}

          <button
            onClick={salvarHorarios}
            disabled={salvando}
            className={`mt-4 px-4 py-2 rounded text-white ${
              salvando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {salvando ? "Salvando..." : "Salvar horários"}
          </button>
        </div>
      )}
    </div>
  );
};

export default HorariosFuncionamento;
