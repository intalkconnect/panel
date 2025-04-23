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
    const carregarOuCriarHorarios = async () => {
      const { data, error } = await supabase
        .from("horarios_funcionamento")
        .select("*")
        .eq("empresa_id", empresaId);

      if (error) {
        console.error("Erro ao carregar horários:", error);
        return;
      }

      if (!data || data.length === 0) {
        const defaultHorarios = diasSemana.map((dia) => ({
          empresa_id: empresaId,
          dia_semana: dia.id,
          abre: "00:00",
          fecha: "23:59",
          ativo: true,
        }));

        const { error: insertError, data: created } = await supabase
          .from("horarios_funcionamento")
          .insert(defaultHorarios)
          .select();

        if (insertError) {
          console.error("Erro ao criar horários padrão:", insertError);
        } else {
          setHorarios(created);
        }
      } else {
        setHorarios(data);
      }

      setLoading(false);
    };

    if (empresaId) {
      carregarOuCriarHorarios();
    }
  }, [empresaId]);

  const handleHorarioChange = (index, campo, valor) => {
    const novos = [...horarios];
    novos[index][campo] = valor;
    setHorarios(novos);
  };

  const salvarHorarios = async () => {
    setSalvando(true);
    try {
      for (const horario of horarios) {
        const { id, ...dados } = horario;
        const { error } = await supabase
          .from("horarios_funcionamento")
          .update(dados)
          .eq("id", id);

        if (error) {
          console.error(`Erro ao atualizar ${horario.dia_semana}:`, error);
        }
      }
      alert("Horários atualizados com sucesso!");
    } catch (err) {
      console.error("Erro geral ao salvar:", err);
    }
    setSalvando(false);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow border dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-purple-600" />
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
              <div
                key={dia.id}
                className="grid grid-cols-5 items-center gap-4 transition-opacity"
              >
                <label className="font-medium col-span-1">{dia.label}</label>

                <input
                  type="time"
                  value={horario.abre}
                  disabled={!horario.ativo}
                  onChange={(e) =>
                    handleHorarioChange(index, "abre", e.target.value)
                  }
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white col-span-1"
                />

                <input
                  type="time"
                  value={horario.fecha}
                  disabled={!horario.ativo}
                  onChange={(e) =>
                    handleHorarioChange(index, "fecha", e.target.value)
                  }
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white col-span-1"
                />

                <label className="col-span-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={horario.ativo}
                    onChange={(e) =>
                      handleHorarioChange(index, "ativo", e.target.checked)
                    }
                    className="form-checkbox h-4 w-4 text-green-600"
                  />
                  Dia ativo
                </label>
              </div>
            ) : null;
          })}

          <button
            onClick={salvarHorarios}
            disabled={salvando}
            className={`mt-6 px-4 py-2 rounded text-white font-semibold ${
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
