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
  const empresaId = localStorage.getItem("empresa_id");

  useEffect(() => {
    const carregarHorarios = async () => {
      const { data, error } = await supabase
        .from("horarios_funcionamento")
        .select("*")
        .eq("empresa_id", empresaId);

      if (data) setHorarios(data);
      if (error) console.error("Erro ao carregar horários:", error);

      setLoading(false);
    };

    carregarHorarios();
  }, [empresaId]);

  const handleHorarioChange = (index, campo, valor) => {
    const novosHorarios = [...horarios];
    novosHorarios[index][campo] = valor;
    setHorarios(novosHorarios);
  };

  const salvarHorarios = async () => {
    for (const horario of horarios) {
      const { id, ...rest } = horario;
      await supabase.from("horarios_funcionamento").update(rest).eq("id", id);
    }
    alert("Horários atualizados com sucesso!");
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow border dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-blue-600" />
        <h2 className="text-xl font-semibold">Horários de Funcionamento</h2>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="space-y-4">
          {diasSemana.map((dia) => {
            const horario = horarios.find((h) => h.dia_semana === dia.id);
            return horario ? (
              <div key={dia.id} className="grid grid-cols-3 items-center gap-4">
                <label className="font-medium">{dia.label}</label>
                <input
                  type="time"
                  value={horario.abre}
                  onChange={(e) =>
                    handleHorarioChange(
                      horarios.findIndex((h) => h.dia_semana === dia.id),
                      "abre",
                      e.target.value
                    )
                  }
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="time"
                  value={horario.fecha}
                  onChange={(e) =>
                    handleHorarioChange(
                      horarios.findIndex((h) => h.dia_semana === dia.id),
                      "fecha",
                      e.target.value
                    )
                  }
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
            ) : null;
          })}
          <button
            onClick={salvarHorarios}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Salvar horários
          </button>
        </div>
      )}
    </div>
  );
};

export default HorariosFuncionamento;
