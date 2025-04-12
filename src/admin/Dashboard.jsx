import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const cores = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#f472b6",
  "#38bdf8",
  "#10b981",
];

const Dashboard = () => {
  const empresaId = localStorage.getItem("empresa_id");

  const [filtro, setFiltro] = useState("hoje");
  const [totalVendido, setTotalVendido] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [pagamentoData, setPagamentoData] = useState([]);
  const [consumoData, setConsumoData] = useState([]);
  const [produtosMaisPedidos, setProdutosMaisPedidos] = useState([]);
  const [produtosMaisLucrativos, setProdutosMaisLucrativos] = useState([]);
  const [receitaPorConsumo, setReceitaPorConsumo] = useState([]);
  const [dmmData, setDmmData] = useState([]);
  const [mediaReceitaPorDia, setMediaReceitaPorDia] = useState([]);

  const [dataInicioPersonalizado, setDataInicioPersonalizado] = useState("");
  const [dataFimPersonalizado, setDataFimPersonalizado] = useState("");

  const filtros = {
    hoje: new Date(new Date().setHours(0, 0, 0, 0)),
    "7dias": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    "30dias": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  };

  const agruparPor = (arr, chave) => {
    const total = arr.length;
    const agrupado = arr.reduce((acc, item) => {
      const key = item[chave] || "Desconhecido";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(agrupado).map(([name, value], index) => ({
      name,
      value: parseFloat(((value / total) * 100).toFixed(2)),
      fill: cores[index % cores.length],
    }));
  };

  const carregarDados = async () => {
    const dataInicio =
      filtro === "personalizado"
        ? new Date(dataInicioPersonalizado).toISOString()
        : filtros[filtro].toISOString();

    const dataFim =
      filtro === "personalizado" && dataFimPersonalizado
        ? new Date(
            new Date(dataFimPersonalizado).setHours(23, 59, 59, 999)
          ).toISOString()
        : new Date().toISOString();

    const { data: pedidos, error: erroPedidos } = await supabase
      .from("pedidos")
      .select("id, total, forma_pagamento, modo_consumo")
      .eq("empresa_id", empresaId)
      .gte("created_at", dataInicio)
      .lte("created_at", dataFim);

    if (erroPedidos) {
      console.error(erroPedidos);
      return;
    }

    const total = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
    setTotalVendido(total);
    setTicketMedio(pedidos.length > 0 ? total / pedidos.length : 0);

    setPagamentoData(agruparPor(pedidos, "forma_pagamento"));
    setConsumoData(agruparPor(pedidos, "modo_consumo"));

    const receitaConsumo = pedidos.reduce((acc, pedido) => {
      const modo = pedido.modo_consumo || "Desconhecido";
      acc[modo] = (acc[modo] || 0) + (pedido.total || 0);
      return acc;
    }, {});

    const receitaFormatada = Object.entries(receitaConsumo).map(
      ([modo, valor], i) => ({
        modo,
        valor: parseFloat(valor.toFixed(2)),
        cor: cores[i % cores.length],
      })
    );
    console.log("receita por consumo", receitaFormatada);
    setReceitaPorConsumo(receitaFormatada);

    const idsPedidos = pedidos.map((p) => p.id);
    setTotalPedidos(pedidos.length);

    if (idsPedidos.length > 0) {
      const { data: itens, error: erroItens } = await supabase
        .from("pedido_itens")
        .select("produto_id, quantidade, subtotal, produtos(nome)")
        .in("pedido_id", idsPedidos);

      if (erroItens) {
        console.error(erroItens);
        return;
      }

      const pedidosAgrupados = {};
      const receitaAgrupada = {};

      itens.forEach((item) => {
        const nome = item.produtos?.nome || "Desconhecido";
        const quantidade = item.quantidade || 0;
        const valor = item.subtotal || 0;

        pedidosAgrupados[nome] = (pedidosAgrupados[nome] || 0) + quantidade;
        receitaAgrupada[nome] =
          (receitaAgrupada[nome] || 0) + quantidade * valor;
      });

      const topPedidos = Object.entries(pedidosAgrupados)
        .map(([nome, qtd], i) => ({
          nome,
          qtd,
          cor: cores[i % cores.length],
        }))
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 5);

      const topReceita = Object.entries(receitaAgrupada)
        .map(([nome, valor], i) => ({
          nome,
          valor: parseFloat(valor.toFixed(2)),
          cor: cores[i % cores.length],
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      setProdutosMaisPedidos(topPedidos);
      setProdutosMaisLucrativos(topReceita);
    } else {
      setProdutosMaisPedidos([]);
      setProdutosMaisLucrativos([]);
    }
  };

  const carregarDMM = async () => {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 3);

    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select("id, modo_consumo, created_at")
      .eq("empresa_id", empresaId)
      .gte("created_at", dataInicio.toISOString());

    if (error) {
      console.error("Erro no DMM:", error);
      return;
    }

    const diasSemana = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

    const dmmFormatado = diasSemana.map((dia) => ({
      dia,
      comer_aqui: 0,
      para_levar: 0,
      delivery: 0,
    }));

    pedidos.forEach((pedido) => {
      const data = new Date(pedido.created_at);
      const dia = diasSemana[data.getDay()];
      const modo = pedido.modo_consumo;
      const index = dmmFormatado.findIndex((d) => d.dia === dia);

      if (modo === "comer_aqui") dmmFormatado[index].comer_aqui += 1;
      else if (modo === "para_levar") dmmFormatado[index].para_levar += 1;
      else if (modo === "delivery") dmmFormatado[index].delivery += 1;
    });

    setDmmData(dmmFormatado);
  };
  const carregarMediaReceitaPorDia = async () => {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 3);

    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select("total, created_at")
      .eq("empresa_id", empresaId)
      .gte("created_at", dataInicio.toISOString());

    if (error) {
      console.error("Erro ao carregar média por dia:", error);
      return;
    }

    const diasSemana = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

    const receitaPorDia = {};
    const contagemPorDia = {};

    pedidos.forEach((pedido) => {
      const data = new Date(pedido.created_at);
      const dia = diasSemana[data.getDay()];
      receitaPorDia[dia] = (receitaPorDia[dia] || 0) + (pedido.total || 0);
      contagemPorDia[dia] = (contagemPorDia[dia] || 0) + 1;
    });

    const mediaPorDia = diasSemana.map((dia) => ({
      dia,
      media: contagemPorDia[dia]
        ? parseFloat((receitaPorDia[dia] / contagemPorDia[dia]).toFixed(2))
        : 0,
    }));

    setMediaReceitaPorDia(mediaPorDia);
  };

  useEffect(() => {
    if (empresaId) {
      if (
        filtro === "personalizado" &&
        (!dataInicioPersonalizado || !dataFimPersonalizado)
      ) {
        return;
      }
      carregarDados();
    }
  }, [filtro, dataInicioPersonalizado, dataFimPersonalizado, empresaId]);

  useEffect(() => {
    if (empresaId) carregarDMM();
    carregarMediaReceitaPorDia();
  }, [empresaId]);

  const receitaTratada = receitaPorConsumo
    .filter((item) => item.valor > 0) // só exibe se tiver valor
    .map((item) => ({
      ...item,
      modo:
        item.modo === "comer_aqui"
          ? "Comer aqui"
          : item.modo === "para_levar"
          ? "Levar para Casa"
          : item.modo === "delivery"
          ? "Delivery"
          : item.modo,
    }));

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-12">
      {/* Filtros */}
      <div className="flex gap-3 flex-wrap items-center">
        {["hoje", "7dias", "30dias", "personalizado"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg font-medium border ${
              filtro === f
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {f === "hoje"
              ? "Hoje"
              : f === "7dias"
              ? "Últimos 7 dias"
              : f === "30dias"
              ? "Últimos 30 dias"
              : "Personalizado"}
          </button>
        ))}

        {filtro === "personalizado" && (
          <>
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={dataInicioPersonalizado}
              onChange={(e) => setDataInicioPersonalizado(e.target.value)}
            />
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={dataFimPersonalizado}
              onChange={(e) => setDataFimPersonalizado(e.target.value)}
            />
          </>
        )}
      </div>

      {/* Seção: Visão Geral */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">📊 Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Vendido */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow text-center">
            <h3 className="text-lg font-bold">Total Vendido</h3>
            <p className="text-2xl text-green-600 dark:text-green-400">
              {totalVendido.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow text-center">
            <h3 className="text-lg font-bold">Ticket Médio</h3>
            <p className="text-2xl text-blue-500">
              {ticketMedio.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          {/* Total de Pedidos */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow text-center">
            <h3 className="text-lg font-bold">Total de Pedidos</h3>
            <p className="text-2xl text-purple-500">{totalPedidos}</p>
          </div>
        </div>
      </section>

      {/* Seção: Comportamento de Consumo */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">🍽️ Comportamento de Consumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formas de Pagamento */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
            <h3 className="text-lg font-bold mb-2">Formas de Pagamento (%)</h3>
            {pagamentoData.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhum dado disponível.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pagamentoData}
                    dataKey="value"
                    nameKey="name"
                    label
                    isAnimationActive
                  >
                    {pagamentoData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Modo de Consumo */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
            <h3 className="text-lg font-bold mb-2">Forma de Consumo (%)</h3>
            {consumoData.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhum dado disponível.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={consumoData
                      .filter(
                        (item) => item.name !== "delivery" || item.value > 0
                      )
                      .map((item) => ({
                        ...item,
                        name:
                          item.name === "comer_aqui"
                            ? "Comer aqui"
                            : item.name === "para_levar"
                            ? "Levar para Casa"
                            : item.name === "delivery"
                            ? "Delivery"
                            : item.name,
                      }))}
                    dataKey="value"
                    nameKey="name"
                    label
                    isAnimationActive
                  >
                    {consumoData
                      .filter(
                        (item) => item.name !== "delivery" || item.value > 0
                      )
                      .map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.fill || `hsl(${(index * 60) % 360}, 70%, 60%)`
                          }
                        />
                      ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Receita por Consumo */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow col-span-2">
            <h3 className="text-lg font-bold mb-2">
              🧾 Receita por Forma de Consumo
            </h3>
            {receitaTratada.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhum dado disponível.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={receitaTratada}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  barCategoryGap="30%"
                  barGap={5}
                >
                  <XAxis dataKey="modo" />
                  <YAxis />
                  <Tooltip
                    formatter={(v) =>
                      `${v.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}`
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="valor"
                    name="Receita"
                    barSize={28}
                    isAnimationActive
                  >
                    {receitaTratada.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.fill || `hsl(${(index * 60) % 360}, 65%, 60%)`
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Seção: Produtos em Destaque */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">🛒 Produtos em Destaque</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produtos Mais Pedidos */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
            <h3 className="text-lg font-bold mb-2">🏆 Top 5 Mais Pedidos</h3>
            {produtosMaisPedidos.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhum dado disponível.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[...produtosMaisPedidos].sort((a, b) => b.qtd - a.qtd)}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 60, bottom: 10 }}
                  barCategoryGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="nome" />
                  <Tooltip />
                  <Bar
                    dataKey="qtd"
                    fill="#60a5fa"
                    name="Quantidade"
                    barSize={18}
                    isAnimationActive
                  >
                    {produtosMaisPedidos.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#34d399" : "#60a5fa"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Produtos com Maior Receita */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
            <h3 className="text-lg font-bold mb-2">
              💸 Top 5 com Maior Receita
            </h3>
            {produtosMaisLucrativos.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhum dado disponível.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[...produtosMaisLucrativos].sort(
                    (a, b) => b.valor - a.valor
                  )}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 60, bottom: 10 }}
                  barCategoryGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="nome" />
                  <Tooltip
                    formatter={(v) =>
                      `${v.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}`
                    }
                  />
                  <Bar
                    dataKey="valor"
                    name="Receita"
                    barSize={18}
                    isAnimationActive
                  >
                    {produtosMaisLucrativos.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#f59e0b" : "#34d399"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Seção: Movimento por Dia */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          📈 Movimento por Dia (últimos 3 meses)
        </h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          {dmmData.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum dado disponível.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dmmData} isAnimationActive>
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="comer_aqui" fill="#60a5fa" name="Comer aqui" />
                <Bar
                  dataKey="para_levar"
                  fill="#fbbf24"
                  name="Levar para Casa"
                />
                {dmmData.some((item) => item.delivery > 0) && (
                  <Bar dataKey="delivery" fill="#34d399" name="Delivery" />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
      {/* Seção: Média de Receita por Dia */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          💰 Receita por Dia da Semana (últimos 3 meses)
        </h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          {mediaReceitaPorDia.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum dado disponível.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mediaReceitaPorDia} isAnimationActive>
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  }
                />
                <Legend />
                <Bar dataKey="media" fill="#f87171" name="Média Receita" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
