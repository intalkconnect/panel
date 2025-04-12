// src/admin/Empresas.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../data/supabaseClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  Search,
  SquarePenIcon,
  Trash2,
  Building,
  Pencil,
} from "lucide-react";

function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [novaEmpresa, setNovaEmpresa] = useState({
    nome: "",
    modulo_pagamento_id: "", // Mudado para string vazia para compatibilidade com value do select
    maquina_pagamento_id: "", // Mudado para string vazia para compatibilidade com value do select
  });
  const [usuarioEmpresa, setUsuarioEmpresa] = useState({
    email: "",
    senha: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [editando, setEditando] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [perfilOptions, setPerfilOptions] = useState([]);
  const [modulosPagamento, setModulosPagamento] = useState([]);
  const [maquinasDisponiveis, setMaquinasDisponiveis] = useState([]);
  const [moduloSelecionado, setModuloSelecionado] = useState(null);

  useEffect(() => {
    buscarEmpresas();
    fetchPerfis();
    fetchModulosEMaquinas();
  }, []);

  async function fetchModulosEMaquinas() {
    const { data: modulos } = await supabase
      .from("modulos_pagamento")
      .select("*");
    const { data: maquinas } = await supabase
      .from("maquinas_pagamento")
      .select("*");
    setModulosPagamento(modulos || []);
    setMaquinasDisponiveis(maquinas || []);
  }

  useEffect(() => {
    if (showModal) {
      const senhaGerada = Math.random().toString(36).slice(-10);
      setUsuarioEmpresa((prev) => ({ ...prev, senha: senhaGerada }));
      setModuloSelecionado(null); // resetar a seleção ao abrir
      // Certificar-se de que os valores iniciais estão como strings vazias
      setNovaEmpresa({
        nome: "",
        perfil_id: "",
        modulo_pagamento_id: "",
        maquina_pagamento_id: "",
      });
    }
  }, [showModal]);

  async function buscarEmpresas() {
    const { data, error } = await supabase
      .from("empresas")
      .select(
        `
        *,
        modulo_pagamento:modulo_pagamento_id (
          id,
          nome,
          exige_maquina_pagamento,
          display_name
        ),
        maquina_pagamento:maquina_pagamento_id (
          id,
          nome,
          display_name
        )
      `
      )
      .order("nome", { ascending: true });

    if (error) toast.error("Erro ao buscar empresas");
    else setEmpresas(data);
  }

  async function fetchPerfis() {
    const { data, error } = await supabase.from("perfis").select("id, nome");

    if (error) toast.error("Erro ao buscar perfis");
    else setPerfilOptions(data);
  }

  async function adicionarEmpresa() {
    if (!novaEmpresa.nome || !usuarioEmpresa.email) {
      toast.warning("Preencha todos os campos obrigatórios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuarioEmpresa.email)) {
      toast.warning("Digite um e-mail válido");
      return;
    }

    if (!novaEmpresa.modulo_pagamento_id) {
      toast.warning("Selecione um módulo de pagamento");
      return;
    }

    if (
      moduloSelecionado &&
      moduloSelecionado.exige_maquina_pagamento &&
      moduloSelecionado.display_name !== "pedido" &&
      !novaEmpresa.maquina_pagamento_id
    ) {
      toast.warning("Este módulo exige uma máquina de pagamento.");
      return;
    }

    setLoading(true);

    // 1. Verifica se nome da empresa já existe
    const { data: existentes } = await supabase
      .from("empresas")
      .select("id")
      .eq("nome", novaEmpresa.nome);

    if (existentes && existentes.length > 0) {
      toast.error("Já existe uma empresa com esse nome.");
      setLoading(false);
      return;
    }

    // 2. Cria empresa
    const { data: empresa, error: erroEmpresa } = await supabase
      .from("empresas")
      .insert({
        nome: novaEmpresa.nome,
        modulo_pagamento_id: novaEmpresa.modulo_pagamento_id,
        maquina_pagamento_id: novaEmpresa.maquina_pagamento_id || null,
      })
      .select()
      .single();

    if (erroEmpresa || !empresa) {
      toast.error("Erro ao criar empresa");
      setLoading(false);
      return;
    }

    // 3. Busca o perfil admin
    const { data: perfilAdmin, error: erroPerfil } = await supabase
      .from("perfis")
      .select("id")
      .eq("nome", "admin")
      .single();

    if (erroPerfil || !perfilAdmin) {
      toast.error("Perfil admin não encontrado.");
      setLoading(false);
      return;
    }

    // 4. Cria usuário
    const { error: erroUserInsert } = await supabase.from("users").insert({
      email: usuarioEmpresa.email,
      senha: usuarioEmpresa.senha,
      perfil_id: perfilAdmin.id,
      empresa_id: empresa.id,
    });

    if (erroUserInsert) {
      toast.error("Erro ao criar usuário: " + erroUserInsert.message);
      setLoading(false);
      return;
    }

    toast.success("Empresa e usuário criados com sucesso!");
    resetForm();
    buscarEmpresas();
  }

  async function excluirEmpresa(id) {
    setConfirmDeleteId(null);
    const { error } = await supabase.from("empresas").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir empresa");
    else {
      toast.success("Empresa excluída com sucesso");
      buscarEmpresas();
    }
  }

  async function salvarEdicao() {
    setLoading(true);

    const moduloId = editando.modulo_pagamento_id
      ? editando.modulo_pagamento_id
      : null;

    if (!moduloId) {
      toast.error("Você deve selecionar um módulo de pagamento.");
      setLoading(false);
      return;
    }

    const updatePayload = {
      nome: editando.nome,
      modulo_pagamento_id: moduloId,
      maquina_pagamento_id: editando.maquina_pagamento_id || null,
    };

    const { error } = await supabase
      .from("empresas")
      .update(updatePayload)
      .eq("id", editando.id);

    if (error) {
      toast.error("Erro ao atualizar empresa: " + error.message);
    } else {
      toast.success("Empresa atualizada com sucesso");
      setEditando(null);
      buscarEmpresas();
    }

    setLoading(false);
  }

  function resetForm() {
    setNovaEmpresa({
      nome: "",
      modulo_pagamento_id: "",
      maquina_pagamento_id: "",
    });
    setUsuarioEmpresa({ email: "", senha: "" });
    setShowModal(false);
    setLoading(false);
  }

  const empresasFiltradas = empresas.filter((e) =>
    e.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // Auxiliar para mostrar logs no console para debug
  const logStateForDebug = () => {
    console.log("Estado atual:", {
      novaEmpresa,
      moduloSelecionado,
      modulosPagamento,
    });
  };

  return (
    <div className="p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Building size={24} className="text-blue-500 dark:text-blue-400" />
          <h1 className="text-2xl font-bold">Empresas</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Nova Empresa
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por nome..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800 font-bold text-gray-800 dark:text-white">
            <tr>
              <th className="p-3 border text-center">ID</th>
              <th className="p-3 border text-center">Nome</th>
              <th className="p-3 border text-center">Módulo Pagamento</th>
              <th className="p-3 border text-center">Máquina Pagamento</th>
              <th className="p-3 border text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {empresasFiltradas.map((e) => (
              <tr
                key={e.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3 border text-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {e.id}
                </td>
                <td className="p-3 border text-center">{e.nome}</td>
                <td className="p-3 border text-center">
                  {e.modulo_pagamento?.display_name || "—"}
                </td>
                <td className="p-3 border text-center">
                  {e.modulo_pagamento?.exige_maquina_pagamento
                    ? e.maquina_pagamento?.display_name || "—"
                    : "Desativado"}
                </td>
                <td className="p-3 border text-center space-x-2">
                  <button
                    className="p-2 rounded-full hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 dark:hover:bg-blue-700 transition"
                    onClick={() => {
                      const moduloAtual = modulosPagamento.find(
                        (mod) => mod.id === e.modulo_pagamento_id
                      );
                      setModuloSelecionado(moduloAtual);
                      setEditando({
                        ...e,
                        modulo_pagamento_id: e.modulo_pagamento_id || "",
                        maquina_pagamento_id: e.maquina_pagamento_id || "",
                      });
                    }}
                  >
                    <SquarePenIcon size={18} />
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 dark:hover:bg-red-700 transition"
                    onClick={() => setConfirmDeleteId(e.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal Nova Empresa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" /> Nova Empresa
            </h2>

            <label className="block text-sm font-semibold mb-1">Nome</label>
            <input
              type="text"
              placeholder="Nome"
              value={novaEmpresa.nome}
              onChange={(e) =>
                setNovaEmpresa({ ...novaEmpresa, nome: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-800 dark:border-gray-700"
            />

            <h3 className="text-sm font-bold mt-4 mb-2">Usuário da Empresa</h3>
            <input
              type="email"
              placeholder="Email"
              value={usuarioEmpresa.email}
              onChange={(e) =>
                setUsuarioEmpresa({ ...usuarioEmpresa, email: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              type="text"
              placeholder="Senha"
              value={usuarioEmpresa.senha}
              readOnly
              className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-800 dark:border-gray-700 bg-gray-100 text-gray-600"
            />

            <label className="block text-sm font-semibold mb-1">
              Módulo de Pagamento (Obrigatório)
            </label>
            <select
              value={novaEmpresa.modulo_pagamento_id}
              onChange={(e) => {
                const moduleValue = e.target.value;
                const modulo = modulosPagamento.find(
                  (m) => m.id === moduleValue
                );

                setModuloSelecionado(modulo);
                setNovaEmpresa({
                  ...novaEmpresa,
                  modulo_pagamento_id: moduleValue,
                  // Reset maquina_pagamento_id when module changes
                  maquina_pagamento_id: "",
                });

                // Debug para verificar o que está acontecendo
                console.log("Módulo selecionado:", {
                  value: moduleValue,
                  parsed: parseInt(moduleValue),
                  modulo,
                });
              }}
              className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Selecione um Módulo</option>
              {modulosPagamento.map((mod) => (
                <option key={mod.id} value={mod.id.toString()}>
                  {mod.display_name}
                </option>
              ))}
            </select>

            {moduloSelecionado?.nome === "pedido-com-pagamento" && (
              <>
                <label className="block text-sm font-semibold mb-1">
                  Máquina de Pagamento
                </label>
                <select
                  value={novaEmpresa.maquina_pagamento_id || ""}
                  onChange={(e) =>
                    setNovaEmpresa({
                      ...novaEmpresa,
                      maquina_pagamento_id: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">Selecione uma Máquina</option>
                  {maquinasDisponiveis.map((maq) => (
                    <option key={maq.id} value={maq.id}>
                      {maq.display_name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarEmpresa}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
              >
                {loading ? "Salvando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Empresa */}
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Pencil size={20} className="text-yellow-500" /> Editar Empresa
            </h2>

            <label className="block text-sm font-semibold mb-1">Nome</label>
            <input
              type="text"
              value={editando.nome}
              onChange={(e) =>
                setEditando({ ...editando, nome: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-800 dark:border-gray-700"
            />

            <label className="block text-sm font-semibold mb-1">
              Módulo de Pagamento
            </label>
            <select
              value={editando.modulo_pagamento_id || ""}
              onChange={(e) => {
                const moduloId = e.target.value;
                const modulo = modulosPagamento.find((m) => m.id === moduloId);

                setModuloSelecionado(modulo);

                setEditando((prev) => ({
                  ...prev,
                  modulo_pagamento_id: moduloId,
                  maquina_pagamento_id: "", // reseta a máquina quando o módulo muda
                }));
              }}
              className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Selecione um módulo</option>
              {modulosPagamento.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.display_name}
                </option>
              ))}
            </select>

            {moduloSelecionado?.exige_maquina_pagamento && (
              <>
                <label className="block text-sm font-semibold mb-1">
                  Máquina de Pagamento
                </label>
                <select
                  value={editando.maquina_pagamento_id || ""}
                  onChange={(e) =>
                    setEditando((prev) => ({
                      ...prev,
                      maquina_pagamento_id: e.target.value,
                    }))
                  }
                  className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">Selecione uma Máquina</option>
                  {maquinasDisponiveis.map((maq) => (
                    <option key={maq.id} value={maq.id}>
                      {maq.display_name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditando(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-6 rounded-xl max-w-sm w-full shadow-lg text-center">
            <h3 className="text-lg font-bold mb-4">
              Tem certeza que deseja excluir?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => excluirEmpresa(confirmDeleteId)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Empresas;
